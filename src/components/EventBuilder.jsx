/**
 * INTERNAL TESTING PAGE - Event Builder
 * 
 * Purpose: Generate balanced, beatable events with progressive difficulty
 * 
 * Access: Direct URL only (/eventbuilder123)
 * NOT linked in navigation - INTERNAL USE ONLY
 */

import { useState, useMemo, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Autocomplete,
	Paper,
	Chip,
	Stack,
	LinearProgress,
	Alert,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	Switch,
	FormControlLabel,
	Slider,
	IconButton,
	Tooltip,
	Modal,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Pagination,
} from '@mui/material';

// Data imports
import trackData from '../data/trackData.js';
import carData from '../data/data.js';
import packData from '../data/packData.js';

// Race engine
import { evaluateRace, getCarStats } from '../utils/raceEngine';

// Icons
import BuildIcon from '@mui/icons-material/Build';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// ============================================================
// IMAGE OPTIMIZATION
// ============================================================
const getThumbnailUrl = (originalUrl, width = 80, quality = 70) => {
	if (!originalUrl) return originalUrl;
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we&il`;
};

// ============================================================
// DATA SETUP
// ============================================================
const raceCars = carData.filter(car => !car.reference && car.topSpeed && car["0to60"] && car.handling && car.cr);

const getUniqueValues = (key) => {
	const values = new Set();
	raceCars.forEach(car => {
		if (key === 'make') {
			const makes = Array.isArray(car.make) ? car.make : [car.make];
			makes.forEach(m => m && values.add(m));
		} else if (key === 'tags') {
			if (Array.isArray(car.tags)) car.tags.forEach(t => values.add(t));
		} else if (car[key] !== undefined && car[key] !== null) {
			values.add(car[key]);
		}
	});
	return Array.from(values).sort();
};

const getNumericBounds = (key) => {
	const values = raceCars.map(c => c[key]).filter(v => v !== undefined && v !== null && !isNaN(v));
	if (values.length === 0) return { min: 0, max: 100 };
	return { min: Math.min(...values), max: Math.max(...values) };
};

const allMakes = getUniqueValues('make');
const allBodyStyles = getUniqueValues('bodyStyle');
const allTyreTypes = getUniqueValues('tyreType');
const allFuelTypes = getUniqueValues('fuelType');
const allCountries = getUniqueValues('country');
const allDriveTypes = getUniqueValues('driveType');
const allGcs = getUniqueValues('gc');
const allCreators = getUniqueValues('creator');
const allEnginePosOptions = getUniqueValues('enginePos');
const allTags = getUniqueValues('tags');

const crBounds = getNumericBounds('cr');
const weightBounds = getNumericBounds('weight');
const mraBounds = getNumericBounds('mra');
const olaBounds = getNumericBounds('ola');
const yearBounds = getNumericBounds('modelYear');
const handlingBounds = getNumericBounds('handling');
const accelBounds = getNumericBounds('0to60');
const topSpeedBounds = getNumericBounds('topSpeed');
const seatBounds = getNumericBounds('seatCount');

const rewardPacks = packData?.filter(p => p.packID) || [];

// Get pack tiers/tags for filtering
const packTags = [...new Set(rewardPacks.flatMap(p => p.filter?.tags || []))].sort();

// Car rarities based on CR ranges
const CAR_RARITIES = [
	{ label: 'Common (1-149)', min: 1, max: 149 },
	{ label: 'Uncommon (150-299)', min: 150, max: 299 },
	{ label: 'Rare (300-449)', min: 300, max: 449 },
	{ label: 'Epic (450-599)', min: 450, max: 599 },
	{ label: 'Legendary (600-799)', min: 600, max: 799 },
	{ label: 'Mythic (800+)', min: 800, max: 9999 },
];

const TRACK_TYPES = {
	'on-road': ['Asphalt', 'Drag', 'Track'],
	'off-road': ['Dirt', 'Gravel', 'Sand', 'Snow', 'Ice'],
	'track': ['Track'],
	'any': null,
};

const upgradeOptions = ["000", "333", "666", "699", "969", "996"];
const stockUpgrades = ["000"];

const headerCellSx = { fontWeight: 'bold', backgroundColor: '#1a1a2e', color: '#fff', fontSize: '0.75rem', py: 1 };
const bodyCellSx = { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.75rem', py: 0.5 };

// ============================================================
// COMPONENT
// ============================================================
const EventBuilder = () => {
	// Event configuration
	const [eventName, setEventName] = useState('');
	const [selectedMakes, setSelectedMakes] = useState([]);
	const [crRange, setCrRange] = useState([100, 800]);
	const [numRounds, setNumRounds] = useState(15);
	const [forceOpponentMatch, setForceOpponentMatch] = useState(true);
	const [allowUpgradedOpponents, setAllowUpgradedOpponents] = useState(true);
	const [trackType, setTrackType] = useState('any');
	const [weather, setWeather] = useState('any');
	const [includePrizeCars, setIncludePrizeCars] = useState(false);
	const [minWinMargin, setMinWinMargin] = useState(0);
	const [maxWinMargin, setMaxWinMargin] = useState(500);
	const [minWinners, setMinWinners] = useState(1);
	const [maxWinners, setMaxWinners] = useState(9999);
	const [filtersApplyToOpponents, setFiltersApplyToOpponents] = useState(true);

	// Additional filters
	const [filterBodyStyle, setFilterBodyStyle] = useState('');
	const [filterTyreType, setFilterTyreType] = useState('');
	const [filterFuelType, setFilterFuelType] = useState('');
	const [filterCountry, setFilterCountry] = useState('');
	const [filterDriveType, setFilterDriveType] = useState('');
	const [filterGc, setFilterGc] = useState('');
	const [filterCreator, setFilterCreator] = useState('');
	const [filterEnginePos, setFilterEnginePos] = useState('');
	const [filterTag, setFilterTag] = useState('');
	const [weightRange, setWeightRange] = useState([weightBounds.min, weightBounds.max]);
	const [mraRange, setMraRange] = useState([mraBounds.min, mraBounds.max]);
	const [olaRange, setOlaRange] = useState([olaBounds.min, olaBounds.max]);
	const [yearRange, setYearRange] = useState([yearBounds.min, yearBounds.max]);
	const [handlingRange, setHandlingRange] = useState([handlingBounds.min, handlingBounds.max]);
	const [accelRange, setAccelRange] = useState([accelBounds.min, accelBounds.max]);
	const [topSpeedRange, setTopSpeedRange] = useState([topSpeedBounds.min, topSpeedBounds.max]);
	const [seatRange, setSeatRange] = useState([seatBounds.min, seatBounds.max]);

	// Reward configuration
	const [rewardMinMoney, setRewardMinMoney] = useState(50000);
	const [rewardMaxMoney, setRewardMaxMoney] = useState(1000000);
	const [rewardMinTrophies, setRewardMinTrophies] = useState(5);
	const [rewardMaxTrophies, setRewardMaxTrophies] = useState(150);
	const [rewardPackTags, setRewardPackTags] = useState([]);
	const [rewardCarRarities, setRewardCarRarities] = useState([]);

	// Generation state
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [generatedEvent, setGeneratedEvent] = useState(null);
	const [error, setError] = useState(null);
	const [warnings, setWarnings] = useState([]);
	const [copySuccess, setCopySuccess] = useState(false);

	// Modal state
	const [selectedRound, setSelectedRound] = useState(null);
	const [winningCarsModal, setWinningCarsModal] = useState(false);
	const [winningCarsPage, setWinningCarsPage] = useState(1);
	const WINNERS_PER_PAGE = 15;

	// Editing state
	const [editingRoundIndex, setEditingRoundIndex] = useState(null);
	const [editValues, setEditValues] = useState({});

	// Helpers
	const getCarName = (car) => {
		if (!car) return "Unknown";
		const make = Array.isArray(car.make) ? car.make[0] : car.make;
		return `${make} ${car.model}`;
	};

	const getCarById = (carID) => raceCars.find(c => c.carID === carID);
	const getTrackById = (trackID) => trackData.find(t => t.trackID === trackID);

	// Apply filters to cars
	const applyFilters = useCallback((cars) => {
		return cars.filter(car => {
			if (filterBodyStyle && car.bodyStyle !== filterBodyStyle) return false;
			if (filterTyreType && car.tyreType !== filterTyreType) return false;
			if (filterFuelType && car.fuelType !== filterFuelType) return false;
			if (filterCountry && car.country !== filterCountry) return false;
			if (filterDriveType && car.driveType !== filterDriveType) return false;
			if (filterGc && car.gc !== filterGc) return false;
			if (filterCreator && car.creator !== filterCreator) return false;
			if (filterEnginePos && car.enginePos !== filterEnginePos) return false;
			if (filterTag && (!car.tags || !car.tags.includes(filterTag))) return false;
			if (car.weight && (car.weight < weightRange[0] || car.weight > weightRange[1])) return false;
			if (car.mra && (car.mra < mraRange[0] || car.mra > mraRange[1])) return false;
			if (car.ola && (car.ola < olaRange[0] || car.ola > olaRange[1])) return false;
			if (car.modelYear && (car.modelYear < yearRange[0] || car.modelYear > yearRange[1])) return false;
			if (car.handling && (car.handling < handlingRange[0] || car.handling > handlingRange[1])) return false;
			if (car["0to60"] && (car["0to60"] < accelRange[0] || car["0to60"] > accelRange[1])) return false;
			if (car.topSpeed && (car.topSpeed < topSpeedRange[0] || car.topSpeed > topSpeedRange[1])) return false;
			if (car.seatCount && (car.seatCount < seatRange[0] || car.seatCount > seatRange[1])) return false;
			return true;
		});
	}, [filterBodyStyle, filterTyreType, filterFuelType, filterCountry, filterDriveType, filterGc, filterCreator, filterEnginePos, filterTag, weightRange, mraRange, olaRange, yearRange, handlingRange, accelRange, topSpeedRange, seatRange]);

	// Filter cars
	const filterCars = useCallback((crStart, crEnd, makes, mustMatchMakes = false, allowPrize = false, applyExtraFilters = true) => {
		let filtered = raceCars.filter(car => {
			if (car.cr < crStart || car.cr > crEnd) return false;
			if (!allowPrize && car.isPrize) return false;
			if (mustMatchMakes && makes.length > 0) {
				const carMakes = Array.isArray(car.make) ? car.make : [car.make];
				const carMakesLower = carMakes.map(m => m?.toLowerCase());
				if (!makes.some(m => carMakesLower.includes(m.toLowerCase()))) return false;
			}
			return true;
		});
		return applyExtraFilters ? applyFilters(filtered) : filtered;
	}, [applyFilters]);

	// Filter tracks
	const filterTracks = useCallback(() => {
		let filtered = trackData.filter(t => t.trackID);
		if (trackType !== 'any' && TRACK_TYPES[trackType]) {
			filtered = filtered.filter(t => TRACK_TYPES[trackType].includes(t.surface));
		}
		if (weather !== 'any') {
			const weatherFilter = weather.charAt(0).toUpperCase() + weather.slice(1);
			filtered = filtered.filter(t => t.weather === weatherFilter);
		}
		return filtered;
	}, [trackType, weather]);

	// Calculate round stats (winners, margin)
	const calculateRoundStats = useCallback((round) => {
		const opponentCar = getCarById(round.carID);
		const track = getTrackById(round.track);
		if (!opponentCar || !track) return { winnerCount: 0, bestScore: -999 };

		const opponentStats = getCarStats(opponentCar, round.upgrade);
		if (!opponentStats) return { winnerCount: 0, bestScore: -999 };

		const playerCars = filterCars(round.reqs.cr.start, round.reqs.cr.end, selectedMakes, selectedMakes.length > 0, includePrizeCars, true);
		
		let bestScore = -Infinity;
		let bestCar = null;
		let bestTune = "000";
		const winners = [];

		for (const car of playerCars) {
			let carBestScore = -Infinity;
			let carBestTune = "000";
			
			for (const upgrade of upgradeOptions) {
				const playerStats = getCarStats(car, upgrade);
				if (!playerStats) continue;
				const score = evaluateRace(playerStats, opponentStats, track);
				if (score > carBestScore) {
					carBestScore = score;
					carBestTune = upgrade;
				}
				if (score > bestScore) {
					bestScore = score;
					bestCar = car;
					bestTune = upgrade;
				}
			}
			
			if (carBestScore > 0) {
				winners.push({ car, tune: carBestTune, score: carBestScore });
			}
		}

		return {
			winnerCount: winners.length,
			bestScore,
			bestCar,
			bestTune
		};
	}, [filterCars, selectedMakes, includePrizeCars]);

	// Get winning cars for modal
	const getWinningCars = useCallback((round) => {
		if (!round) return [];
		const opponentCar = getCarById(round.carID);
		const track = getTrackById(round.track);
		if (!opponentCar || !track) return [];
		
		const opponentStats = getCarStats(opponentCar, round.upgrade);
		if (!opponentStats) return [];
		
		const playerCars = filterCars(round.reqs.cr.start, round.reqs.cr.end, selectedMakes, selectedMakes.length > 0, includePrizeCars, true);
		const winners = [];
		
		for (const car of playerCars) {
			let bestScore = -Infinity;
			let bestTune = "000";
			
			for (const upgrade of upgradeOptions) {
				const playerStats = getCarStats(car, upgrade);
				if (!playerStats) continue;
				const score = evaluateRace(playerStats, opponentStats, track);
				if (score > bestScore) {
					bestScore = score;
					bestTune = upgrade;
				}
			}
			
			if (bestScore > 0) {
				winners.push({ car, tune: bestTune, score: bestScore });
			}
		}
		
		return winners.sort((a, b) => b.score - a.score);
	}, [filterCars, selectedMakes, includePrizeCars]);

	// Check if round is beatable
	const isRoundBeatable = useCallback((opponentCar, opponentUpgrade, track, playerCars, minMargin = 0, maxMargin = 9999, minWins = 1, maxWins = 9999) => {
		const opponentStats = getCarStats(opponentCar, opponentUpgrade);
		if (!opponentStats) return { beatable: false, bestCar: null, bestScore: -Infinity, allWinners: [] };

		let bestScore = -Infinity;
		let bestCar = null;
		let bestTune = "000";
		const allWinners = [];

		for (const car of playerCars) {
			let carBestScore = -Infinity;
			let carBestTune = "000";
			
			for (const upgrade of upgradeOptions) {
				const playerStats = getCarStats(car, upgrade);
				if (!playerStats) continue;
				const score = evaluateRace(playerStats, opponentStats, track);
				
				if (score > carBestScore) {
					carBestScore = score;
					carBestTune = upgrade;
				}
				if (score > bestScore) {
					bestScore = score;
					bestCar = car;
					bestTune = upgrade;
				}
			}
			
			if (carBestScore > minMargin && carBestScore <= maxMargin) {
				allWinners.push({ car, tune: carBestTune, score: carBestScore });
			}
		}

		const winnerCount = allWinners.length;
		const meetsWinnerConstraint = winnerCount >= minWins && winnerCount <= maxWins;
		const meetsMarginConstraint = bestScore > minMargin && bestScore <= maxMargin;

		return {
			beatable: meetsMarginConstraint && meetsWinnerConstraint,
			bestCar, bestTune, bestScore, winnerCount, allWinners
		};
	}, []);

	// Generate reward based on configuration
	const generateReward = useCallback((roundIndex, totalRounds, crMidpoint) => {
		const progress = (roundIndex + 1) / totalRounds;
		
		// Calculate money and trophies based on progress and CR
		const moneyRange = rewardMaxMoney - rewardMinMoney;
		const trophyRange = rewardMaxTrophies - rewardMinTrophies;
		
		const baseMoney = Math.round(rewardMinMoney + (moneyRange * progress * 0.5) + (crMidpoint * moneyRange / 2000));
		const baseTrophies = Math.round(rewardMinTrophies + (trophyRange * progress));
		
		const roundMoney = (m) => Math.round(Math.min(Math.max(m, rewardMinMoney), rewardMaxMoney) / 10000) * 10000;
		const roundTrophies = (t) => Math.round(Math.min(Math.max(t, rewardMinTrophies), rewardMaxTrophies) / 5) * 5;
		
		const roll = Math.random();
		
		// Final round: car reward if rarities selected
		if (roundIndex === totalRounds - 1 && rewardCarRarities.length > 0 && roll < 0.6) {
			const eligibleCars = raceCars.filter(c => {
				return rewardCarRarities.some(r => c.cr >= r.min && c.cr <= r.max);
			});
			if (eligibleCars.length > 0) {
				const rewardCar = eligibleCars[Math.floor(Math.random() * eligibleCars.length)];
				return { car: rewardCar.carID };
			}
		}
		
		// Milestone rounds: pack reward if tags selected
		const milestone1 = Math.floor(totalRounds / 3);
		const milestone2 = Math.floor(2 * totalRounds / 3);
		
		if ((roundIndex === milestone1 || roundIndex === milestone2) && roll < 0.7) {
			let eligiblePacks = rewardPacks;
			if (rewardPackTags.length > 0) {
				eligiblePacks = rewardPacks.filter(p => 
					p.filter?.tags?.some(t => rewardPackTags.includes(t))
				);
			}
			if (eligiblePacks.length > 0) {
				const pack = eligiblePacks[Math.floor(Math.random() * eligiblePacks.length)];
				return { pack: pack.packID };
			}
		}
		
		// Regular rewards
		if (roll < 0.55) return { money: roundMoney(baseMoney) };
		else if (roll < 0.85) return { trophies: roundTrophies(baseTrophies) };
		else {
			let eligiblePacks = rewardPacks;
			if (rewardPackTags.length > 0) {
				eligiblePacks = rewardPacks.filter(p => p.filter?.tags?.some(t => rewardPackTags.includes(t)));
			}
			if (eligiblePacks.length > 0) {
				const pack = eligiblePacks[Math.floor(Math.random() * eligiblePacks.length)];
				return { pack: pack.packID };
			}
		}
		return { money: roundMoney(baseMoney) };
	}, [rewardMinMoney, rewardMaxMoney, rewardMinTrophies, rewardMaxTrophies, rewardPackTags, rewardCarRarities]);

	// Reset filters
	const resetFilters = () => {
		setFilterBodyStyle(''); setFilterTyreType(''); setFilterFuelType('');
		setFilterCountry(''); setFilterDriveType(''); setFilterGc('');
		setFilterCreator(''); setFilterEnginePos(''); setFilterTag('');
		setWeightRange([weightBounds.min, weightBounds.max]);
		setMraRange([mraBounds.min, mraBounds.max]);
		setOlaRange([olaBounds.min, olaBounds.max]);
		setYearRange([yearBounds.min, yearBounds.max]);
		setHandlingRange([handlingBounds.min, handlingBounds.max]);
		setAccelRange([accelBounds.min, accelBounds.max]);
		setTopSpeedRange([topSpeedBounds.min, topSpeedBounds.max]);
		setSeatRange([seatBounds.min, seatBounds.max]);
	};

	// Generate event
	const generateEvent = useCallback(async () => {
		if (!eventName.trim()) { setError("Please enter an event name"); return; }
		if (crRange[1] <= crRange[0]) { setError("Invalid CR range"); return; }

		setError(null);
		setWarnings([]);
		setIsGenerating(true);
		setProgress(0);
		setGeneratedEvent(null);

		const newWarnings = [];
		const rounds = [];
		const availableTracks = filterTracks();
		const opponentUpgrades = allowUpgradedOpponents ? upgradeOptions : stockUpgrades;

		if (availableTracks.length === 0) {
			setError("No tracks match criteria");
			setIsGenerating(false);
			return;
		}

		const crSpread = crRange[1] - crRange[0];
		const crStep = crSpread / numRounds;
		const usedCarIDs = new Set();
		const usedTrackIDs = new Set();

		for (let i = 0; i < numRounds; i++) {
			setProgress((i / numRounds) * 100);
			await new Promise(resolve => setTimeout(resolve, 5));

			const roundCrStart = Math.round(crRange[0] + (i * crStep));
			const roundCrEnd = Math.round(crRange[0] + ((i + 1) * crStep) + (crStep * 0.2));
			const roundCrMid = (roundCrStart + roundCrEnd) / 2;

			const playerCars = filterCars(roundCrStart, roundCrEnd, selectedMakes, selectedMakes.length > 0, includePrizeCars, true);
			
			if (playerCars.length === 0) {
				newWarnings.push(`Round ${i + 1}: No player cars in CR ${roundCrStart}-${roundCrEnd}`);
				continue;
			}

			const opponentCars = forceOpponentMatch && selectedMakes.length > 0
				? filterCars(roundCrStart, roundCrEnd, selectedMakes, true, includePrizeCars, filtersApplyToOpponents)
				: filterCars(roundCrStart, roundCrEnd, [], false, includePrizeCars, filtersApplyToOpponents);

			const unusedOpponentCars = opponentCars.filter(c => !usedCarIDs.has(c.carID));
			const opponentPool = unusedOpponentCars.length > 0 ? unusedOpponentCars : opponentCars;

			if (opponentPool.length === 0) {
				newWarnings.push(`Round ${i + 1}: No opponent cars`);
				continue;
			}

			const unusedTracks = availableTracks.filter(t => !usedTrackIDs.has(t.trackID));
			const trackPool = unusedTracks.length > 0 ? unusedTracks : availableTracks;

			let foundBeatable = false;
			let attempts = 0;
			const maxAttempts = 150;

			while (!foundBeatable && attempts < maxAttempts) {
				attempts++;
				const opponentCar = opponentPool[Math.floor(Math.random() * opponentPool.length)];
				const opponentUpgrade = opponentUpgrades[Math.floor(Math.random() * opponentUpgrades.length)];
				const track = trackPool[Math.floor(Math.random() * trackPool.length)];

				const result = isRoundBeatable(opponentCar, opponentUpgrade, track, playerCars, minWinMargin, maxWinMargin, minWinners, maxWinners);

				if (result.beatable) {
					foundBeatable = true;
					usedCarIDs.add(opponentCar.carID);
					usedTrackIDs.add(track.trackID);

					rounds.push({
						carID: opponentCar.carID,
						upgrade: opponentUpgrade,
						track: track.trackID,
						reqs: {
							cr: { start: roundCrStart, end: roundCrEnd },
							isPrize: includePrizeCars
						},
						rewards: generateReward(i, numRounds, roundCrMid),
						_meta: {
							opponentCarName: getCarName(opponentCar),
							opponentCR: opponentCar.cr,
							trackName: track.trackName,
							winMargin: result.bestScore,
							winnerCount: result.winnerCount,
							verified: true
						}
					});
				}
			}

			if (!foundBeatable) {
				newWarnings.push(`Round ${i + 1}: Could not meet constraints`);
				const opponentCar = opponentPool[Math.floor(Math.random() * opponentPool.length)];
				const track = trackPool[Math.floor(Math.random() * trackPool.length)];
				const testResult = isRoundBeatable(opponentCar, "000", track, playerCars, -9999, 9999, 0, 9999);
				
				rounds.push({
					carID: opponentCar.carID,
					upgrade: "000",
					track: track.trackID,
					reqs: { cr: { start: roundCrStart, end: roundCrEnd }, isPrize: includePrizeCars },
					rewards: generateReward(i, numRounds, roundCrMid),
					_meta: {
						opponentCarName: getCarName(opponentCar),
						opponentCR: opponentCar.cr,
						trackName: track.trackName,
						winMargin: testResult.bestScore,
						winnerCount: testResult.winnerCount,
						verified: false
					}
				});
			}
		}

		rounds.sort((a, b) => a.reqs.cr.start - b.reqs.cr.start);

		setGeneratedEvent({ rounds });
		setWarnings(newWarnings);
		setProgress(100);
		setIsGenerating(false);
	}, [eventName, selectedMakes, crRange, numRounds, forceOpponentMatch, allowUpgradedOpponents, filterTracks, filterCars, isRoundBeatable, includePrizeCars, minWinMargin, maxWinMargin, minWinners, maxWinners, filtersApplyToOpponents, generateReward]);

	// Regenerate single round
	const regenerateSingleRound = useCallback((roundIndex) => {
		if (!generatedEvent) return;
		
		const round = generatedEvent.rounds[roundIndex];
		const availableTracks = filterTracks();
		const opponentUpgrades = allowUpgradedOpponents ? upgradeOptions : stockUpgrades;
		
		const playerCars = filterCars(round.reqs.cr.start, round.reqs.cr.end, selectedMakes, selectedMakes.length > 0, includePrizeCars, true);
		if (playerCars.length === 0) { setError(`No player cars for round ${roundIndex + 1}`); return; }

		const opponentCars = forceOpponentMatch && selectedMakes.length > 0
			? filterCars(round.reqs.cr.start, round.reqs.cr.end, selectedMakes, true, includePrizeCars, filtersApplyToOpponents)
			: filterCars(round.reqs.cr.start, round.reqs.cr.end, [], false, includePrizeCars, filtersApplyToOpponents);

		const opponentPool = opponentCars.filter(c => c.carID !== round.carID);
		const finalPool = opponentPool.length > 0 ? opponentPool : opponentCars;

		let foundBeatable = false;
		let attempts = 0;
		let newRound = null;

		while (!foundBeatable && attempts < 200) {
			attempts++;
			const opponentCar = finalPool[Math.floor(Math.random() * finalPool.length)];
			const opponentUpgrade = opponentUpgrades[Math.floor(Math.random() * opponentUpgrades.length)];
			const track = availableTracks[Math.floor(Math.random() * availableTracks.length)];

			const result = isRoundBeatable(opponentCar, opponentUpgrade, track, playerCars, minWinMargin, maxWinMargin, minWinners, maxWinners);

			if (result.beatable) {
				foundBeatable = true;
				newRound = {
					carID: opponentCar.carID,
					upgrade: opponentUpgrade,
					track: track.trackID,
					reqs: { ...round.reqs },
					rewards: round.rewards,
					_meta: {
						opponentCarName: getCarName(opponentCar),
						opponentCR: opponentCar.cr,
						trackName: track.trackName,
						winMargin: result.bestScore,
						winnerCount: result.winnerCount,
						verified: true
					}
				};
			}
		}

		if (!foundBeatable) { setError(`Could not regenerate round ${roundIndex + 1}`); return; }

		const newRounds = [...generatedEvent.rounds];
		newRounds[roundIndex] = newRound;
		setGeneratedEvent({ rounds: newRounds });
	}, [generatedEvent, filterTracks, filterCars, selectedMakes, includePrizeCars, forceOpponentMatch, allowUpgradedOpponents, isRoundBeatable, minWinMargin, maxWinMargin, minWinners, maxWinners, filtersApplyToOpponents]);

	// Start editing a round
	const startEditing = (idx) => {
		const round = generatedEvent.rounds[idx];
		const rewards = round.rewards;
		
		// Determine reward type and value
		let rewardType = 'money';
		let rewardValue = 100000;
		let rewardPack = '';
		let rewardCar = '';
		
		if (rewards.money) {
			rewardType = 'money';
			rewardValue = rewards.money;
		} else if (rewards.trophies) {
			rewardType = 'trophies';
			rewardValue = rewards.trophies;
		} else if (rewards.pack) {
			rewardType = 'pack';
			rewardPack = rewards.pack;
		} else if (rewards.car) {
			rewardType = 'car';
			rewardCar = typeof rewards.car === 'string' ? rewards.car : rewards.car.carID;
		}
		
		setEditValues({
			crStart: round.reqs.cr.start,
			crEnd: round.reqs.cr.end,
			upgrade: round.upgrade,
			rewardType,
			rewardValue,
			rewardPack,
			rewardCar
		});
		setEditingRoundIndex(idx);
	};

	// Save edited round
	const saveEdit = (idx) => {
		const newRounds = [...generatedEvent.rounds];
		const round = { ...newRounds[idx] };
		
		round.reqs = { ...round.reqs, cr: { start: parseInt(editValues.crStart), end: parseInt(editValues.crEnd) } };
		round.upgrade = editValues.upgrade;
		
		// Update rewards based on type
		if (editValues.rewardType === 'money') {
			round.rewards = { money: parseInt(editValues.rewardValue) || 100000 };
		} else if (editValues.rewardType === 'trophies') {
			round.rewards = { trophies: parseInt(editValues.rewardValue) || 10 };
		} else if (editValues.rewardType === 'pack') {
			round.rewards = { pack: editValues.rewardPack };
		} else if (editValues.rewardType === 'car') {
			round.rewards = { car: editValues.rewardCar };
		}
		
		// Recalculate stats
		const stats = calculateRoundStats(round);
		round._meta = { ...round._meta, winMargin: stats.bestScore, winnerCount: stats.winnerCount };
		
		newRounds[idx] = round;
		setGeneratedEvent({ rounds: newRounds });
		setEditingRoundIndex(null);
	};

	// Copy single round JSON
	const copySingleRound = async (round) => {
		try {
			// Clean up car reward format if needed
			let rewards = { ...round.rewards };
			if (rewards.car && typeof rewards.car === 'object') {
				rewards.car = rewards.car.carID;
			}
			
			const cleanRound = {
				carID: round.carID,
				upgrade: round.upgrade,
				track: round.track,
				reqs: { cr: round.reqs.cr, isPrize: round.reqs.isPrize },
				rewards
			};
			await navigator.clipboard.writeText(JSON.stringify(cleanRound));
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 1500);
		} catch (err) { console.error(err); }
	};

	// Build export JSON
	const buildExportJSON = () => {
		if (!generatedEvent) return [];
		return generatedEvent.rounds.map(r => {
			// Clean up car reward format if needed
			let rewards = { ...r.rewards };
			if (rewards.car && typeof rewards.car === 'object') {
				rewards.car = rewards.car.carID;
			}
			
			return {
				carID: r.carID,
				upgrade: r.upgrade,
				track: r.track,
				reqs: { cr: r.reqs.cr, isPrize: r.reqs.isPrize },
				rewards
			};
		});
	};

	// Export - one line per round
	const exportJSON = () => {
		const data = buildExportJSON();
		const lines = data.map(r => JSON.stringify(r)).join('\n');
		const blob = new Blob([lines], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${eventName.replace(/\s+/g, '_')}_rounds.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const copyJSON = async () => {
		try {
			const data = buildExportJSON();
			const lines = data.map(r => JSON.stringify(r)).join('\n');
			await navigator.clipboard.writeText(lines);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) { console.error(err); }
	};

	const formatReward = (rewards) => {
		if (rewards.money) return `$${rewards.money.toLocaleString()}`;
		if (rewards.trophies) return `${rewards.trophies} ðŸ†`;
		if (rewards.pack) return rewards.pack;
		if (rewards.car) return typeof rewards.car === 'string' ? rewards.car : rewards.car.carID;
		return '-';
	};

	const handleRoundClick = (round, index) => {
		if (editingRoundIndex !== null) return;
		setSelectedRound({ ...round, index });
		setWinningCarsPage(1);
		setWinningCarsModal(true);
	};

	const modalWinningCars = useMemo(() => selectedRound ? getWinningCars(selectedRound) : [], [selectedRound, getWinningCars]);
	const paginatedWinners = useMemo(() => {
		const start = (winningCarsPage - 1) * WINNERS_PER_PAGE;
		return modalWinningCars.slice(start, start + WINNERS_PER_PAGE);
	}, [modalWinningCars, winningCarsPage]);
	const totalWinnerPages = Math.ceil(modalWinningCars.length / WINNERS_PER_PAGE);

	// Reusable components
	const FilterSelect = ({ label, value, setValue, options }) => (
		<FormControl size="small" sx={{ minWidth: 100 }}>
			<InputLabel sx={{ fontSize: '0.8rem' }}>{label}</InputLabel>
			<Select value={value} label={label} onChange={(e) => setValue(e.target.value)} sx={{ fontSize: '0.8rem' }}>
				<MenuItem value="">Any</MenuItem>
				{options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
			</Select>
		</FormControl>
	);

	const TypeableRangeInput = ({ label, value, setValue, min, max, step = 1 }) => (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Typography variant="caption" sx={{ minWidth: 50 }}>{label}:</Typography>
			<TextField
				size="small" type="number" value={value[0]}
				onChange={(e) => setValue([Math.max(min, Math.min(parseInt(e.target.value) || min, value[1])), value[1]])}
				inputProps={{ min, max, step, style: { padding: '4px 8px', width: 60 } }}
			/>
			<Typography variant="caption">-</Typography>
			<TextField
				size="small" type="number" value={value[1]}
				onChange={(e) => setValue([value[0], Math.max(value[0], Math.min(parseInt(e.target.value) || max, max))])}
				inputProps={{ min, max, step, style: { padding: '4px 8px', width: 60 } }}
			/>
		</Box>
	);

	const RangeSlider = ({ label, value, setValue, min, max, step = 1 }) => (
		<Box sx={{ minWidth: 130, px: 1 }}>
			<Typography variant="caption" color="text.secondary">{label}: {value[0]}-{value[1]}</Typography>
			<Slider size="small" value={value} onChange={(e, v) => setValue(v)} min={min} max={max} step={step} valueLabelDisplay="auto" />
		</Box>
	);

	return (
		<Box sx={{ p: 2, maxWidth: 1800, margin: '0 auto' }}>
			{/* Header */}
			<Paper sx={{ p: 1.5, mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.2)', border: '2px solid #ff9800' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<BuildIcon sx={{ color: '#ff9800' }} />
					<Typography variant="h6" fontWeight="bold" sx={{ color: '#ff9800' }}>Event Builder</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Internal tool</Typography>
				</Box>
			</Paper>

			{/* Configuration */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<TextField fullWidth size="small" label="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} sx={{ mb: 2 }} />

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
					<Box sx={{ flex: '1 1 250px' }}>
						<Typography variant="caption">Make(s) <span style={{ color: '#888' }}>(optional)</span></Typography>
						<Autocomplete
							multiple size="small" options={allMakes} value={selectedMakes}
							onChange={(e, v) => setSelectedMakes(v)}
							renderTags={(value, getTagProps) => value.map((option, index) => (
								<Chip {...getTagProps({ index })} key={option} label={option} size="small" />
							))}
							renderInput={(params) => <TextField {...params} placeholder="Any" />}
						/>
					</Box>

					<TypeableRangeInput label="CR" value={crRange} setValue={setCrRange} min={1} max={1200} />

					<Box sx={{ width: 80 }}>
						<Typography variant="caption">Rounds</Typography>
						<TextField type="number" size="small" value={numRounds} fullWidth
							onChange={(e) => setNumRounds(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
							inputProps={{ min: 1, max: 50, style: { padding: '4px 8px' } }} />
					</Box>
				</Box>

				{/* Difficulty Controls */}
				<Accordion sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 1 }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant="body2">Difficulty: Margin +{minWinMargin}-{maxWinMargin === 500 ? 'âˆž' : maxWinMargin}, Winners {minWinners}-{maxWinners === 9999 ? 'âˆž' : maxWinners}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
							<Box>
								<Typography variant="caption">Min Win Margin</Typography>
								<TextField type="number" size="small" value={minWinMargin}
									onChange={(e) => setMinWinMargin(Math.max(0, Math.min(parseInt(e.target.value) || 0, maxWinMargin)))}
									inputProps={{ min: 0, max: 500, style: { padding: '4px 8px', width: 70 } }} />
							</Box>
							<Box>
								<Typography variant="caption">Max Win Margin</Typography>
								<TextField type="number" size="small" value={maxWinMargin}
									onChange={(e) => setMaxWinMargin(Math.max(minWinMargin, parseInt(e.target.value) || 500))}
									inputProps={{ min: 0, max: 9999, style: { padding: '4px 8px', width: 70 } }} />
							</Box>
							<Box>
								<Typography variant="caption">Min Winners</Typography>
								<TextField type="number" size="small" value={minWinners}
									onChange={(e) => setMinWinners(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxWinners)))}
									inputProps={{ min: 1, max: 999, style: { padding: '4px 8px', width: 70 } }} />
							</Box>
							<Box>
								<Typography variant="caption">Max Winners</Typography>
								<TextField type="number" size="small" value={maxWinners}
									onChange={(e) => setMaxWinners(Math.max(minWinners, parseInt(e.target.value) || 9999))}
									inputProps={{ min: 1, max: 9999, style: { padding: '4px 8px', width: 70 } }} />
							</Box>
						</Box>
					</AccordionDetails>
				</Accordion>

				{/* Track/Generation Options */}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
					<FormControl size="small" sx={{ minWidth: 130 }}>
						<InputLabel>Track Type</InputLabel>
						<Select value={trackType} label="Track Type" onChange={(e) => setTrackType(e.target.value)}>
							<MenuItem value="any">Any</MenuItem>
							<MenuItem value="on-road">On-Road</MenuItem>
							<MenuItem value="off-road">Off-Road</MenuItem>
							<MenuItem value="track">Track</MenuItem>
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 100 }}>
						<InputLabel>Weather</InputLabel>
						<Select value={weather} label="Weather" onChange={(e) => setWeather(e.target.value)}>
							<MenuItem value="any">Any</MenuItem>
							<MenuItem value="sunny">Sunny</MenuItem>
							<MenuItem value="rainy">Rainy</MenuItem>
						</Select>
					</FormControl>
					<FormControlLabel control={<Switch size="small" checked={forceOpponentMatch} onChange={(e) => setForceOpponentMatch(e.target.checked)} />} label={<Typography variant="caption">Opponents match make</Typography>} />
					<FormControlLabel control={<Switch size="small" checked={allowUpgradedOpponents} onChange={(e) => setAllowUpgradedOpponents(e.target.checked)} />} label={<Typography variant="caption">Upgraded opponents</Typography>} />
					<FormControlLabel control={<Switch size="small" checked={includePrizeCars} onChange={(e) => setIncludePrizeCars(e.target.checked)} />} label={<Typography variant="caption">Prize cars</Typography>} />
				</Box>

				{/* Car Filters */}
				<Accordion sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 1 }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant="body2">Car Filters (Body, Tyre, Drive, etc.)</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
							<FormControlLabel 
								control={<Switch size="small" checked={filtersApplyToOpponents} onChange={(e) => setFiltersApplyToOpponents(e.target.checked)} />} 
								label={<Typography variant="caption">Apply filters to opponents too</Typography>} 
							/>
							<Button size="small" onClick={resetFilters}>Reset</Button>
						</Box>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
							<FilterSelect label="Body" value={filterBodyStyle} setValue={setFilterBodyStyle} options={allBodyStyles} />
							<FilterSelect label="Tyre" value={filterTyreType} setValue={setFilterTyreType} options={allTyreTypes} />
							<FilterSelect label="Drive" value={filterDriveType} setValue={setFilterDriveType} options={allDriveTypes} />
							<FilterSelect label="Fuel" value={filterFuelType} setValue={setFilterFuelType} options={allFuelTypes} />
							<FilterSelect label="Country" value={filterCountry} setValue={setFilterCountry} options={allCountries} />
							<FilterSelect label="GC" value={filterGc} setValue={setFilterGc} options={allGcs} />
							<FilterSelect label="Engine" value={filterEnginePos} setValue={setFilterEnginePos} options={allEnginePosOptions} />
							<FilterSelect label="Creator" value={filterCreator} setValue={setFilterCreator} options={allCreators} />
							<FilterSelect label="Tag" value={filterTag} setValue={setFilterTag} options={allTags} />
						</Box>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							<RangeSlider label="Top Speed" value={topSpeedRange} setValue={setTopSpeedRange} min={topSpeedBounds.min} max={topSpeedBounds.max} />
							<RangeSlider label="0-60" value={accelRange} setValue={setAccelRange} min={accelBounds.min} max={accelBounds.max} step={0.1} />
							<RangeSlider label="Handling" value={handlingRange} setValue={setHandlingRange} min={handlingBounds.min} max={handlingBounds.max} />
							<RangeSlider label="Weight" value={weightRange} setValue={setWeightRange} min={weightBounds.min} max={weightBounds.max} step={10} />
							<RangeSlider label="MRA" value={mraRange} setValue={setMraRange} min={mraBounds.min} max={mraBounds.max} />
							<RangeSlider label="OLA" value={olaRange} setValue={setOlaRange} min={olaBounds.min} max={olaBounds.max} />
							<TypeableRangeInput label="Year" value={yearRange} setValue={setYearRange} min={yearBounds.min} max={yearBounds.max} />
							<TypeableRangeInput label="Seats" value={seatRange} setValue={setSeatRange} min={seatBounds.min} max={seatBounds.max} />
						</Box>
					</AccordionDetails>
				</Accordion>

				{/* Reward Configuration */}
				<Accordion sx={{ backgroundColor: 'rgba(0,0,0,0.3)', mb: 1 }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant="body2">Reward Settings</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
							<Box>
								<Typography variant="caption">Money Range</Typography>
								<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
									<TextField size="small" type="number" value={rewardMinMoney}
										onChange={(e) => setRewardMinMoney(parseInt(e.target.value) || 0)}
										inputProps={{ style: { padding: '4px 8px', width: 80 } }} />
									<Typography variant="caption">-</Typography>
									<TextField size="small" type="number" value={rewardMaxMoney}
										onChange={(e) => setRewardMaxMoney(parseInt(e.target.value) || 0)}
										inputProps={{ style: { padding: '4px 8px', width: 80 } }} />
								</Box>
							</Box>
							<Box>
								<Typography variant="caption">Trophy Range</Typography>
								<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
									<TextField size="small" type="number" value={rewardMinTrophies}
										onChange={(e) => setRewardMinTrophies(parseInt(e.target.value) || 0)}
										inputProps={{ style: { padding: '4px 8px', width: 60 } }} />
									<Typography variant="caption">-</Typography>
									<TextField size="small" type="number" value={rewardMaxTrophies}
										onChange={(e) => setRewardMaxTrophies(parseInt(e.target.value) || 0)}
										inputProps={{ style: { padding: '4px 8px', width: 60 } }} />
								</Box>
							</Box>
						</Box>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
							<Box sx={{ flex: '1 1 200px' }}>
								<Typography variant="caption">Pack Tags (for pack rewards)</Typography>
								<Autocomplete
									multiple size="small" options={packTags} value={rewardPackTags}
									onChange={(e, v) => setRewardPackTags(v)}
									renderTags={(value, getTagProps) => value.map((option, index) => (
										<Chip {...getTagProps({ index })} key={option} label={option} size="small" />
									))}
									renderInput={(params) => <TextField {...params} placeholder="Any pack" />}
								/>
							</Box>
							<Box sx={{ flex: '1 1 200px' }}>
								<Typography variant="caption">Car Rarities (for car rewards)</Typography>
								<Autocomplete
									multiple size="small" options={CAR_RARITIES}
									getOptionLabel={(opt) => opt.label}
									value={rewardCarRarities}
									onChange={(e, v) => setRewardCarRarities(v)}
									renderTags={(value, getTagProps) => value.map((option, index) => (
										<Chip {...getTagProps({ index })} key={option.label} label={option.label} size="small" />
									))}
									renderInput={(params) => <TextField {...params} placeholder="Any rarity" />}
								/>
							</Box>
						</Box>
					</AccordionDetails>
				</Accordion>

				{/* Generate */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
					<Button variant="contained" color="warning" startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
						onClick={generateEvent} disabled={isGenerating}>
						{isGenerating ? 'Generating...' : 'Generate'}
					</Button>
					{generatedEvent && (
						<Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={generateEvent}>Regenerate All</Button>
					)}
				</Box>

				{isGenerating && <LinearProgress variant="determinate" value={progress} color="warning" sx={{ mt: 1 }} />}
				{error && <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>{error}</Alert>}
				{warnings.length > 0 && (
					<Alert severity="warning" sx={{ mt: 1 }}>
						{warnings.slice(0, 3).map((w, i) => <Typography key={i} variant="caption" display="block">- {w}</Typography>)}
						{warnings.length > 3 && <Typography variant="caption">...and {warnings.length - 3} more</Typography>}
					</Alert>
				)}
			</Paper>

			{/* Results Table - Visual Format */}
			{generatedEvent && (
				<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
						<CheckCircleIcon sx={{ fontSize: 32, color: '#4caf50' }} />
						<Box>
							<Typography variant="h6" sx={{ color: '#4caf50' }}>Generated {generatedEvent.rounds.length} Rounds</Typography>
							<Typography variant="caption" color="text.secondary">Click row to see winning cars</Typography>
						</Box>
					</Box>
					
					<TableContainer sx={{ maxHeight: 500 }}>
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell sx={headerCellSx}>#</TableCell>
									<TableCell sx={headerCellSx}>CR Range</TableCell>
									<TableCell sx={headerCellSx}>Opponent</TableCell>
									<TableCell sx={headerCellSx}>Tune</TableCell>
									<TableCell sx={headerCellSx}>Track</TableCell>
									<TableCell sx={headerCellSx}>Reward</TableCell>
									<TableCell sx={headerCellSx}>Winners</TableCell>
									<TableCell sx={headerCellSx}>Margin</TableCell>
									<TableCell sx={headerCellSx}>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{generatedEvent.rounds.map((round, idx) => {
									const opponentCar = getCarById(round.carID);
									const track = getTrackById(round.track);
									const isEditing = editingRoundIndex === idx;
									const isVerified = round._meta?.verified;
									
									return (
										<TableRow key={idx} hover onClick={() => handleRoundClick(round, idx)}
											sx={{ cursor: editingRoundIndex === null ? 'pointer' : 'default', '&:hover': { backgroundColor: 'rgba(255,152,0,0.08)' } }}>
											<TableCell sx={bodyCellSx}>{idx + 1}</TableCell>
											<TableCell sx={bodyCellSx}>
												{isEditing ? (
													<Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
														<TextField size="small" type="number" value={editValues.crStart}
															onChange={(e) => setEditValues({ ...editValues, crStart: e.target.value })}
															inputProps={{ style: { padding: '2px 6px', width: 45 } }} />
														<span>-</span>
														<TextField size="small" type="number" value={editValues.crEnd}
															onChange={(e) => setEditValues({ ...editValues, crEnd: e.target.value })}
															inputProps={{ style: { padding: '2px 6px', width: 45 } }} />
													</Box>
												) : (
													<Typography variant="body2" fontWeight="bold">{round.reqs.cr.start} - {round.reqs.cr.end}</Typography>
												)}
											</TableCell>
											<TableCell sx={bodyCellSx}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													{opponentCar?.racehud && (
														<img src={getThumbnailUrl(opponentCar.racehud, 50)} alt="" 
															style={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 4 }} />
													)}
													<Box>
														<Typography variant="body2">{round._meta?.opponentCarName || round.carID}</Typography>
														<Typography variant="caption" color="text.secondary">CR {round._meta?.opponentCR || opponentCar?.cr}</Typography>
													</Box>
												</Box>
											</TableCell>
											<TableCell sx={bodyCellSx}>
												{isEditing ? (
													<Select size="small" value={editValues.upgrade} 
														onChange={(e) => setEditValues({ ...editValues, upgrade: e.target.value })}
														onClick={(e) => e.stopPropagation()} sx={{ minWidth: 70 }}>
														{upgradeOptions.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
													</Select>
												) : (
													<Chip label={round.upgrade} size="small" sx={{ height: 22 }} />
												)}
											</TableCell>
											<TableCell sx={bodyCellSx}>
												<Box>
													<Typography variant="body2">{round._meta?.trackName || track?.trackName || round.track}</Typography>
													<Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
														<Chip label={track?.weather || '?'} size="small" 
															color={track?.weather === 'Sunny' ? 'warning' : 'info'} 
															sx={{ height: 18, fontSize: '0.65rem' }} />
														<Chip label={track?.surface || '?'} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
													</Box>
												</Box>
											</TableCell>
											<TableCell sx={bodyCellSx} onClick={(e) => isEditing && e.stopPropagation()}>
												{isEditing ? (
													<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 150 }}>
														<Select size="small" value={editValues.rewardType}
															onChange={(e) => setEditValues({ ...editValues, rewardType: e.target.value })}
															sx={{ fontSize: '0.75rem' }}>
															<MenuItem value="money">Money</MenuItem>
															<MenuItem value="trophies">Trophies</MenuItem>
															<MenuItem value="pack">Pack</MenuItem>
															<MenuItem value="car">Car</MenuItem>
														</Select>
														{(editValues.rewardType === 'money' || editValues.rewardType === 'trophies') && (
															<TextField size="small" type="number" value={editValues.rewardValue}
																onChange={(e) => setEditValues({ ...editValues, rewardValue: e.target.value })}
																inputProps={{ style: { padding: '4px 8px', fontSize: '0.75rem' } }}
																placeholder={editValues.rewardType === 'money' ? 'Amount' : 'Count'} />
														)}
														{editValues.rewardType === 'pack' && (
															<Autocomplete size="small"
																options={rewardPacks.map(p => p.packID)}
																value={editValues.rewardPack}
																onChange={(e, v) => setEditValues({ ...editValues, rewardPack: v || '' })}
																renderInput={(params) => <TextField {...params} placeholder="Pack ID" 
																	inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '4px 8px' } }} />}
															/>
														)}
														{editValues.rewardType === 'car' && (
															<Autocomplete size="small"
																options={raceCars.map(c => c.carID)}
																value={editValues.rewardCar}
																onChange={(e, v) => setEditValues({ ...editValues, rewardCar: v || '' })}
																renderInput={(params) => <TextField {...params} placeholder="Car ID"
																	inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '4px 8px' } }} />}
															/>
														)}
													</Box>
												) : (
													formatReward(round.rewards)
												)}
											</TableCell>
											<TableCell sx={{ ...bodyCellSx, fontWeight: 'bold' }}>
												<Chip label={round._meta?.winnerCount ?? '?'} size="small" color="primary" sx={{ height: 22 }} />
											</TableCell>
											<TableCell sx={{ ...bodyCellSx, color: isVerified ? '#4caf50' : '#ff9800', fontWeight: 'bold' }}>
												{round._meta?.winMargin !== undefined ? `+${round._meta.winMargin.toFixed(1)}` : '-'}
											</TableCell>
											<TableCell sx={bodyCellSx}>
												<Box sx={{ display: 'flex', gap: 0.5 }}>
													{isEditing ? (
														<Tooltip title="Save changes">
															<IconButton size="small" onClick={(e) => { e.stopPropagation(); saveEdit(idx); }} sx={{ color: '#4caf50' }}>
																<SaveIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													) : (
														<Tooltip title="Edit CR/Tune">
															<IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditing(idx); }} sx={{ color: '#90caf9' }}>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													)}
													<Tooltip title="Regenerate round">
														<IconButton size="small" onClick={(e) => { e.stopPropagation(); regenerateSingleRound(idx); }} sx={{ color: '#ff9800' }}>
															<RefreshIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</Box>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			)}

			{/* JSON Output - Compact Format */}
			{generatedEvent && (
				<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography variant="h6">JSON Output</Typography>
						<Box sx={{ display: 'flex', gap: 1 }}>
							<Button size="small" variant="outlined" color="success" startIcon={<DownloadIcon />} onClick={exportJSON}>
								Download
							</Button>
							<Tooltip title={copySuccess ? "Copied!" : "Copy all to clipboard"}>
								<Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyJSON}
									color={copySuccess ? "success" : "primary"}>
									{copySuccess ? "Copied!" : "Copy All"}
								</Button>
							</Tooltip>
						</Box>
					</Box>
					
					<Box sx={{ 
						p: 1.5, backgroundColor: '#0d1117', borderRadius: 1,
						overflow: 'auto', maxHeight: 400,
					}}>
						{buildExportJSON().map((round, idx) => (
							<Box key={idx} sx={{ 
								display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5,
								'&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
								borderRadius: 0.5, p: 0.5
							}}>
								<Tooltip title="Copy this round">
									<IconButton size="small" onClick={() => copySingleRound(generatedEvent.rounds[idx])}
										sx={{ color: '#90caf9', p: 0.25, mt: 0.25 }}>
										<ContentCopyIcon sx={{ fontSize: 14 }} />
									</IconButton>
								</Tooltip>
								<Typography sx={{ 
									fontFamily: 'monospace', fontSize: '0.75rem', 
									color: '#c9d1d9', wordBreak: 'break-all', flex: 1
								}}>
									{JSON.stringify(round)}
								</Typography>
							</Box>
						))}
					</Box>
				</Paper>
			)}

			{/* Winning Cars Modal */}
			<Modal open={winningCarsModal} onClose={() => setWinningCarsModal(false)}>
				<Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
					width: '90%', maxWidth: 800, maxHeight: '80vh', bgcolor: '#1a1a2e', borderRadius: 2, boxShadow: 24, p: 2, overflow: 'auto' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
						<Typography variant="subtitle1">Round {(selectedRound?.index ?? 0) + 1} Winners ({modalWinningCars.length})</Typography>
						<IconButton size="small" onClick={() => setWinningCarsModal(false)}><CloseIcon /></IconButton>
					</Box>
					{selectedRound && (
						<Box sx={{ mb: 1, p: 1, backgroundColor: 'rgba(244,67,54,0.15)', borderRadius: 1, fontSize: '0.8rem' }}>
							<strong>Opponent:</strong> {selectedRound._meta?.opponentCarName} ({selectedRound.upgrade}) |
							<strong> Track:</strong> {selectedRound._meta?.trackName} |
							<strong> CR:</strong> {selectedRound.reqs.cr.start}-{selectedRound.reqs.cr.end}
						</Box>
					)}
					{modalWinningCars.length === 0 ? (
						<Alert severity="warning">No winning cars</Alert>
					) : (
						<>
							<TableContainer sx={{ maxHeight: 350 }}>
								<Table size="small" stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell sx={headerCellSx}>Car</TableCell>
											<TableCell sx={headerCellSx}>CR</TableCell>
											<TableCell sx={headerCellSx}>Tune</TableCell>
											<TableCell sx={headerCellSx}>Margin</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{paginatedWinners.map(({ car, tune, score }) => (
											<TableRow key={car.carID}>
												<TableCell sx={bodyCellSx}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														{car.racehud && <img src={getThumbnailUrl(car.racehud, 40)} alt="" style={{ width: 40, height: 24, objectFit: 'cover', borderRadius: 2 }} />}
														{getCarName(car)}
													</Box>
												</TableCell>
												<TableCell sx={bodyCellSx}>{car.cr}</TableCell>
												<TableCell sx={bodyCellSx}>{tune}</TableCell>
												<TableCell sx={{ ...bodyCellSx, color: '#4caf50', fontWeight: 'bold' }}>+{score.toFixed(1)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
							{totalWinnerPages > 1 && (
								<Stack sx={{ mt: 1, alignItems: 'center' }}>
									<Pagination count={totalWinnerPages} page={winningCarsPage} onChange={(e, v) => setWinningCarsPage(v)} size="small" />
								</Stack>
							)}
						</>
					)}
				</Box>
			</Modal>
		</Box>
	);
};

export default EventBuilder;
