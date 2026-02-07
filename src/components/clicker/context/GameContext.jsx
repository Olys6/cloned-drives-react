import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

import { UPGRADES, getUpgradeValue } from '../constants/upgrades';
import { CHALLENGES } from '../constants/challenges';
import { ENHANCEMENT_COSTS, getEnhancementBonus, getSellValue, getRandomPrizeBonus, BASE_COOLDOWN_SECONDS, MIN_COOLDOWN_SECONDS, BASE_EARNINGS } from '../constants/gameConfig';
import { getAllGameCars, getGameCars, getPrizeCars, getAllPacks, findCarById, getRandomCarFromSlot, getCarName } from '../utils/carHelpers';
import { compressSave, decompressSave, getDefaultGameState, SAVE_KEY, addToCollection, removeFromCollection, getCarCount, getTotalCarCount, getUniqueCarCount } from '../utils/saveSystem';

const GameContext = createContext(null);

// Constants for cooldown
const OVERCLOCK_MIN_COOLDOWN = 1; // When cooldown breaker is unlocked

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};

export const GameProvider = ({ children }) => {
	// Core game state
	const [money, setMoney] = useState(1000);
	const [garage, setGarage] = useState([]);
	const [collection, setCollection] = useState({});  // {carId: count} format
	const [upgrades, setUpgrades] = useState({});
	const [totalCollects, setTotalCollects] = useState(0);
	const [totalEarnings, setTotalEarnings] = useState(0);
	const [hasClaimedStarter, setHasClaimedStarter] = useState(false);
	const [packPurchases, setPackPurchases] = useState({});
	const [packsOpened, setPacksOpened] = useState(0);
	const [carsSold, setCarsSold] = useState(0);
	const [moneyFromSales, setMoneyFromSales] = useState(0);
	const [activeChallenge, setActiveChallenge] = useState(null);
	const [purchasedChallenges, setPurchasedChallenges] = useState([]);
	
	// Race state
	const [tokens, setTokens] = useState(0);
	const [tuneTokens, setTuneTokens] = useState(0);
	const [racesWon, setRacesWon] = useState(0);
	const [racesLost, setRacesLost] = useState(0);
	const [unlockedDifficulties, setUnlockedDifficulties] = useState(['low_cr']);
	
	// Enhancement state
	const [carEnhancements, setCarEnhancements] = useState({});
	const [lockedCars, setLockedCars] = useState(new Set());
	const [prizeCarBonuses, setPrizeCarBonuses] = useState({});
	
	// Cooldown state
	const [lastCollect, setLastCollect] = useState(0);
	const [now, setNow] = useState(Date.now());
	
	// Static data
	const allGameCars = useMemo(() => getAllGameCars(), []);
	const gameCars = useMemo(() => getGameCars(), []);
	const prizeCars = useMemo(() => getPrizeCars(), []);
	const allPacks = useMemo(() => getAllPacks(), []);
	
	// Timer for cooldown
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 100);
		return () => clearInterval(interval);
	}, []);
	
	// Load save on mount (localStorage - keeps backwards compatibility)
	useEffect(() => {
		const saved = localStorage.getItem(SAVE_KEY);
		if (saved) {
			const data = decompressSave(saved);
			if (data) {
				setMoney(data.money || 1000);
				setGarage(data.garage || []);
				setCollection(data.collection || {});
				setUpgrades(data.upgrades || {});
				setTotalCollects(data.totalCollects || 0);
				setTotalEarnings(data.totalEarnings || 0);
				setLastCollect(data.lastCollect || 0);
				setHasClaimedStarter(data.hasClaimedStarter || false);
				setPackPurchases(data.packPurchases || {});
				setPacksOpened(data.packsOpened || 0);
				setCarsSold(data.carsSold || 0);
				setMoneyFromSales(data.moneyFromSales || 0);
				setActiveChallenge(data.activeChallenge || null);
				setPurchasedChallenges(data.purchasedChallenges || []);
				setTokens(data.tokens || 0);
				setTuneTokens(data.tuneTokens || 0);
				setRacesWon(data.racesWon || 0);
				setRacesLost(data.racesLost || 0);
				setUnlockedDifficulties(data.unlockedDifficulties || ['low_cr']);
				setCarEnhancements(data.carEnhancements || {});
				setLockedCars(data.lockedCars instanceof Set ? data.lockedCars : new Set(data.lockedCars || []));
				setPrizeCarBonuses(data.prizeCarBonuses || {});
			}
		}
	}, []);
	
	// Auto-save to localStorage
	useEffect(() => {
		const data = {
			money, garage, collection, upgrades, totalCollects, totalEarnings,
			lastCollect, hasClaimedStarter, packPurchases, packsOpened, carsSold,
			moneyFromSales, activeChallenge, purchasedChallenges, tokens, tuneTokens,
			racesWon, racesLost, unlockedDifficulties, carEnhancements, lockedCars,
			prizeCarBonuses
		};
		const compressed = compressSave(data);
		if (compressed) {
			localStorage.setItem(SAVE_KEY, compressed);
		}
	}, [money, garage, collection, upgrades, totalCollects, totalEarnings, lastCollect,
		hasClaimedStarter, packPurchases, packsOpened, carsSold, moneyFromSales,
		activeChallenge, purchasedChallenges, tokens, tuneTokens, racesWon, racesLost,
		unlockedDifficulties, carEnhancements, lockedCars, prizeCarBonuses]);
	
	// ============================================================
	// GAME STATE OBJECT - Used by cloud save system
	// Clean format with actual carIDs (not indices)
	// ============================================================
	const gameState = useMemo(() => ({
		money,
		tokens,
		tuneTokens,
		garage,
		collection,
		carEnhancements,
		lockedCars,
		prizeCarBonuses,
		upgrades,
		packPurchases,
		purchasedChallenges,
		unlockedDifficulties,
		activeChallenge,
		totalCollects,
		totalEarnings,
		packsOpened,
		carsSold,
		moneyFromSales,
		racesWon,
		racesLost,
		hasClaimedStarter,
		lastCollect,
	}), [
		money, tokens, tuneTokens, garage, collection, carEnhancements,
		lockedCars, prizeCarBonuses, upgrades, packPurchases, purchasedChallenges,
		unlockedDifficulties, activeChallenge, totalCollects, totalEarnings,
		packsOpened, carsSold, moneyFromSales, racesWon, racesLost,
		hasClaimedStarter, lastCollect
	]);
	
	// ============================================================
	// LOAD CLOUD SAVE - Accepts clean format from cloud
	// ============================================================
	const loadCloudSave = useCallback((data) => {
		if (!data) return false;
		
		setMoney(data.money || 1000);
		setTokens(data.tokens || 0);
		setTuneTokens(data.tuneTokens || 0);
		setGarage(data.garage || []);
		setCollection(data.collection || {});
		setCarEnhancements(data.carEnhancements || {});
		setLockedCars(data.lockedCars instanceof Set ? data.lockedCars : new Set(data.lockedCars || []));
		setPrizeCarBonuses(data.prizeCarBonuses || {});
		setUpgrades(data.upgrades || {});
		setPackPurchases(data.packPurchases || {});
		setPurchasedChallenges(data.purchasedChallenges || []);
		setUnlockedDifficulties(data.unlockedDifficulties || ['low_cr']);
		setActiveChallenge(data.activeChallenge || null);
		setTotalCollects(data.totalCollects || 0);
		setTotalEarnings(data.totalEarnings || 0);
		setPacksOpened(data.packsOpened || 0);
		setCarsSold(data.carsSold || 0);
		setMoneyFromSales(data.moneyFromSales || 0);
		setRacesWon(data.racesWon || 0);
		setRacesLost(data.racesLost || 0);
		setHasClaimedStarter(data.hasClaimedStarter || false);
		setLastCollect(data.lastCollect || 0);
		
		return true;
	}, []);
	
	// Upgrade helpers
	const getUpgradeLevel = useCallback((key) => upgrades[key] || 0, [upgrades]);
	
	const getEffectiveMaxLevel = useCallback((key) => {
		const upgrade = UPGRADES[key];
		if (!upgrade) return 0;
		if (!upgrade.extendable) return upgrade.maxLevel;
		const extensionLevel = upgrades['upgradeExtension'] || 0;
		return upgrade.maxLevel + extensionLevel;
	}, [upgrades]);
	
	const getUpgradeValueForLevel = useCallback((key) => {
		const upgrade = UPGRADES[key];
		if (!upgrade) return 0;
		const level = getUpgradeLevel(key);
		return upgrade.baseValue + (upgrade.increment * level);
	}, [getUpgradeLevel]);
	
	// ============================================================
	// DERIVED UPGRADE VALUES
	// ============================================================
	const maxGarageSlots = getUpgradeValueForLevel('garageSlots');
	const passiveIncomePerCar = getUpgradeValueForLevel('passiveIncome');
	const bonusLuck = getUpgradeValueForLevel('luckBonus');
	const earningsMultiplier = getUpgradeValueForLevel('earningsMultiplier');
	const tokenBoostLevel = getUpgradeLevel('tokenBoost');
	const hasMultiPackAccess = getUpgradeLevel('multiPackAccess') > 0;
	const prizeCarIncomePerCar = getUpgradeValueForLevel('prizeCarIncome');
	
	// NEW UPGRADE VALUES
	const vipStatusMultiplier = getUpgradeValueForLevel('vipStatus'); // 1 + 0.03 per level
	const sellBonusMultiplier = getUpgradeValueForLevel('sellBonus'); // 1 + 0.02 per level
	const cooldownReductionUpgrade = getUpgradeValueForLevel('cooldownReduction'); // 0.15s per level
	const hasCooldownBreaker = getUpgradeLevel('cooldownBreaker') > 0;
	const tuneMasteryLevel = getUpgradeLevel('tuneMastery'); // +1 tune token per level
	const trophyHunterChance = getUpgradeValueForLevel('trophyHunter'); // 2% per level
	const bonusExtenderCap = getUpgradeValueForLevel('bonusExtender'); // 5 + 1 per level
	
	// Collection stats
	const totalCarCount = useMemo(() => getTotalCarCount(collection), [collection]);
	const uniqueCarCount = useMemo(() => {
		let count = 0;
		for (const carId of Object.keys(collection)) {
			const car = findCarById(carId);
			if (car && !car.isPrize) count++;
		}
		return count;
	}, [collection]);
	
	const uniquePrizeCarCount = useMemo(() => {
		let count = 0;
		for (const carId of Object.keys(collection)) {
			const car = findCarById(carId);
			if (car && car.isPrize) count++;
		}
		return count;
	}, [collection]);
	
	// Set bonuses from garage (with Bonus Extender support)
	const setBonuses = useMemo(() => {
		const bonuses = {
			brand: { count: 0, name: null, bonus: 0 },
			country: { count: 0, name: null, bonus: 0 },
			driveType: { count: 0, name: null, bonus: 0 },
			tyreType: { count: 0, name: null, bonus: 0 },
			bodyStyle: { count: 0, name: null, bonus: 0 },
		};
		
		if (garage.length < 3) return bonuses;
		
		const counts = {
			brand: {},
			country: {},
			driveType: {},
			tyreType: {},
			bodyStyle: {},
		};
		
		for (const carId of garage) {
			const car = findCarById(carId);
			if (!car) continue;
			
			const make = Array.isArray(car.make) ? car.make[0] : car.make;
			if (make) counts.brand[make] = (counts.brand[make] || 0) + 1;
			if (car.country) counts.country[car.country] = (counts.country[car.country] || 0) + 1;
			if (car.driveType) counts.driveType[car.driveType] = (counts.driveType[car.driveType] || 0) + 1;
			if (car.tyreType) counts.tyreType[car.tyreType] = (counts.tyreType[car.tyreType] || 0) + 1;
			if (car.bodyStyle) {
				if (Array.isArray(car.bodyStyle)) {
					car.bodyStyle.forEach(b => counts.bodyStyle[b] = (counts.bodyStyle[b] || 0) + 1);
				} else {
					counts.bodyStyle[car.bodyStyle] = (counts.bodyStyle[car.bodyStyle] || 0) + 1;
				}
			}
		}
		
		// Calculate bonuses with Bonus Extender support
		// Base: 3 cars = 10%, 4 cars = 20%, 5 cars = 35%
		// With extender: 6+ cars give additional 5% per car beyond 5
		const calculateBonus = (count) => {
			if (count < 3) return 0;
			if (count === 3) return 0.10;
			if (count === 4) return 0.20;
			if (count === 5) return 0.35;
			// Beyond 5 (only with Bonus Extender)
			const effectiveCount = Math.min(count, bonusExtenderCap);
			if (effectiveCount <= 5) return 0.35;
			// +5% for each car beyond 5
			return 0.35 + ((effectiveCount - 5) * 0.05);
		};
		
		for (const [category, items] of Object.entries(counts)) {
			let maxCount = 0;
			let maxName = null;
			for (const [name, count] of Object.entries(items)) {
				if (count > maxCount) {
					maxCount = count;
					maxName = name;
				}
			}
			if (maxCount >= 3) {
				bonuses[category].count = maxCount;
				bonuses[category].name = maxName;
				bonuses[category].bonus = calculateBonus(maxCount);
			}
		}
		
		return bonuses;
	}, [garage, bonusExtenderCap]);
	
	// Garage stats
	const garageStats = useMemo(() => {
		let luck = bonusLuck;
		let cooldownReduction = cooldownReductionUpgrade; // Start with upgrade value
		let earnings = 1;
		let enhancementBonus = 0;
		
		for (const carId of garage) {
			const car = findCarById(carId);
			if (!car) continue;
			
			luck += car.topSpeed / 30;
			cooldownReduction += (15 - Math.min(15, car["0to60"])) * 0.03;
			earnings += car.handling / 40;
			earnings += car.topSpeed / 100;
			earnings += car.cr / 500;
			earnings += (car.mra || 50) / 300;
			luck += (100 - (car.ola || 50)) / 300;
			
			// Enhancement bonus
			const stars = carEnhancements[carId] || 0;
			if (stars > 0) {
				enhancementBonus += getEnhancementBonus(stars);
			}
		}
		
		// Apply set bonuses
		if (setBonuses.brand.bonus > 0) earnings *= (1 + setBonuses.brand.bonus);
		if (setBonuses.country.bonus > 0) luck *= (1 + setBonuses.country.bonus);
		if (setBonuses.driveType.bonus > 0) cooldownReduction += setBonuses.driveType.bonus * 0.5;
		if (setBonuses.tyreType.bonus > 0) earnings *= (1 + setBonuses.tyreType.bonus * 0.5);
		
		// Apply enhancement bonus to earnings
		earnings *= (1 + enhancementBonus);
		earnings *= earningsMultiplier;
		
		return { luck, cooldownReduction, earnings, enhancementBonus };
	}, [garage, bonusLuck, earningsMultiplier, setBonuses, carEnhancements, cooldownReductionUpgrade]);
	
	// Passive income calculation
	const bodyStyleBonus = setBonuses.bodyStyle.bonus > 0 ? (1 + setBonuses.bodyStyle.bonus) : 1;
	const passiveIncomePerSecond = uniqueCarCount * passiveIncomePerCar * earningsMultiplier * bodyStyleBonus;
	const prizeCarPassiveIncomePerSecond = uniquePrizeCarCount * prizeCarIncomePerCar * earningsMultiplier;
	const totalPassiveIncomePerSecond = passiveIncomePerSecond + prizeCarPassiveIncomePerSecond;
	
	// Passive income tick
	useEffect(() => {
		if (totalPassiveIncomePerSecond <= 0) return;
		
		const interval = setInterval(() => {
			setMoney(prev => prev + totalPassiveIncomePerSecond / 10);
			setTotalEarnings(prev => prev + totalPassiveIncomePerSecond / 10);
		}, 100);
		
		return () => clearInterval(interval);
	}, [totalPassiveIncomePerSecond]);
	
	// Cooldown (with Speed Collector and Overclock support)
	const minCooldown = hasCooldownBreaker ? OVERCLOCK_MIN_COOLDOWN : MIN_COOLDOWN_SECONDS;
	const cooldownSeconds = Math.max(minCooldown, BASE_COOLDOWN_SECONDS - garageStats.cooldownReduction);
	const cooldownMs = cooldownSeconds * 1000;
	const timeLeft = Math.max(0, (lastCollect + cooldownMs) - now);
	const canCollect = timeLeft <= 0;
	const cooldownProgress = 100 - (timeLeft / cooldownMs * 100);
	
	// Challenge
	const activeChallengeData = activeChallenge ? CHALLENGES.find(c => c.id === activeChallenge) : null;
	const challengeMet = activeChallengeData ? activeChallengeData.requirement(garage, allGameCars, maxGarageSlots) : false;
	const challengeMultiplier = (activeChallengeData && challengeMet) ? activeChallengeData.multiplier : 1;
	
	// Current earnings per click (with VIP Status)
	const currentEarnings = Math.round(BASE_EARNINGS * vipStatusMultiplier * garageStats.earnings * challengeMultiplier);
	
	// ============================================================
	// ACTIONS
	// ============================================================
	const handleCollect = useCallback(() => {
		if (!canCollect) return;
		setMoney(prev => prev + currentEarnings);
		setTotalCollects(prev => prev + 1);
		setTotalEarnings(prev => prev + currentEarnings);
		setLastCollect(Date.now());
	}, [canCollect, currentEarnings]);
	
	const addCarToGarage = useCallback((carId) => {
		if (garage.length >= maxGarageSlots) return false;
		if (garage.includes(carId)) return false;
		setGarage(prev => [...prev, carId]);
		return true;
	}, [garage, maxGarageSlots]);
	
	const removeCarFromGarage = useCallback((carId) => {
		setGarage(prev => prev.filter(id => id !== carId));
	}, []);
	
	const addCarsToCollection = useCallback((carIds) => {
		setCollection(prev => {
			let newCollection = { ...prev };
			for (const carId of carIds) {
				newCollection = addToCollection(newCollection, carId);
			}
			return newCollection;
		});
	}, []);
	
	// Sell car with Bulk Seller bonus
	const sellCar = useCallback((carId) => {
		if (lockedCars.has(carId)) return false;
		
		const car = findCarById(carId);
		if (!car) return false;
		
		const count = getCarCount(collection, carId);
		if (count <= 0) return false;
		
		// Apply sell bonus multiplier
		const baseValue = getSellValue(car);
		const value = Math.floor(baseValue * sellBonusMultiplier);
		
		if (garage.includes(carId)) {
			setGarage(prev => prev.filter(id => id !== carId));
		}
		
		setCollection(prev => removeFromCollection(prev, carId));
		setMoney(prev => prev + value);
		setCarsSold(prev => prev + 1);
		setMoneyFromSales(prev => prev + value);
		
		return value;
	}, [collection, garage, lockedCars, sellBonusMultiplier]);
	
	// Sell all duplicates with Bulk Seller bonus
	const sellAllDuplicates = useCallback(() => {
		let totalValue = 0;
		let totalSold = 0;
		const newCollection = {};
		
		for (const [carId, count] of Object.entries(collection)) {
			if (lockedCars.has(carId)) {
				newCollection[carId] = count;
			} else if (count > 1) {
				newCollection[carId] = 1;
				const car = findCarById(carId);
				if (car) {
					const soldCount = count - 1;
					const baseValue = getSellValue(car);
					// Apply sell bonus multiplier
					totalValue += Math.floor(baseValue * sellBonusMultiplier) * soldCount;
					totalSold += soldCount;
				}
			} else {
				newCollection[carId] = count;
			}
		}
		
		if (totalSold === 0) return { totalSold: 0, totalValue: 0 };
		
		setCollection(newCollection);
		setMoney(prev => prev + totalValue);
		setCarsSold(prev => prev + totalSold);
		setMoneyFromSales(prev => prev + totalValue);
		
		return { totalSold, totalValue };
	}, [collection, lockedCars, sellBonusMultiplier]);
	
	const toggleCarLock = useCallback((carId) => {
		setLockedCars(prev => {
			const newSet = new Set(prev);
			if (newSet.has(carId)) {
				newSet.delete(carId);
			} else {
				newSet.add(carId);
			}
			return newSet;
		});
	}, []);
	
	// Derived: check if advanced enhancement is unlocked
	const hasAdvancedEnhancement = useMemo(() => {
		return (upgrades['advancedEnhancement'] || 0) > 0;
	}, [upgrades]);
	
	const enhanceCar = useCallback((carId) => {
		const car = findCarById(carId);
		if (!car) return false;
		
		const currentStars = carEnhancements[carId] || 0;
		const maxStars = hasAdvancedEnhancement ? 10 : 5;
		if (currentStars >= maxStars) return false;
		
		const nextStar = currentStars + 1;
		const cost = ENHANCEMENT_COSTS[nextStar];
		if (!cost) return false;
		
		// Check if this requires advanced enhancement unlock
		if (cost.requiresAdvanced && !hasAdvancedEnhancement) return false;
		
		const dupeCount = getCarCount(collection, carId);
		const availableDupes = dupeCount - 1;
		
		if (availableDupes < cost.dupes) return false;
		if (tuneTokens < cost.tuneTokens) return false;
		
		// Consume duplicates
		setCollection(prev => removeFromCollection(prev, carId, cost.dupes));
		setTuneTokens(prev => prev - cost.tuneTokens);
		setCarEnhancements(prev => ({ ...prev, [carId]: nextStar }));
		
		return true;
	}, [collection, tuneTokens, carEnhancements, hasAdvancedEnhancement]);
	
	const buyUpgrade = useCallback((key) => {
		const upgrade = UPGRADES[key];
		if (!upgrade) return false;
		const level = getUpgradeLevel(key);
		const effectiveMax = getEffectiveMaxLevel(key);
		if (level >= effectiveMax) return false;
		
		const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
		if (money < cost) return false;
		
		setMoney(prev => prev - cost);
		setUpgrades(prev => ({ ...prev, [key]: level + 1 }));
		return true;
	}, [money, getUpgradeLevel, getEffectiveMaxLevel]);
	
	const buyTokenUpgrade = useCallback((key) => {
		const upgrade = UPGRADES[key];
		if (!upgrade || !upgrade.tokenCost) return false;
		
		const level = getUpgradeLevel(key);
		const effectiveMax = getEffectiveMaxLevel(key);
		if (level >= effectiveMax) return false;
		
		const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
		if (tokens < cost) return false;
		
		setTokens(prev => prev - cost);
		setUpgrades(prev => ({ ...prev, [key]: level + 1 }));
		return true;
	}, [tokens, getUpgradeLevel, getEffectiveMaxLevel]);
	
	const purchaseChallenge = useCallback((challengeId) => {
		const challenge = CHALLENGES.find(c => c.id === challengeId);
		if (!challenge || purchasedChallenges.includes(challengeId)) return false;
		if (money < challenge.price) return false;
		
		setMoney(prev => prev - challenge.price);
		setPurchasedChallenges(prev => [...prev, challengeId]);
		return true;
	}, [money, purchasedChallenges]);
	
	const claimStarterPack = useCallback(() => {
		if (hasClaimedStarter) return false;
		
		const starterWeights = { standard: 30, common: 50, uncommon: 20, rare: 0, epic: 0, exotic: 0, legendary: 0, mystic: 0 };
		const starterCars = [];
		for (let i = 0; i < 5; i++) {
			starterCars.push(getRandomCarFromSlot(starterWeights, {}, 0));
		}
		
		addCarsToCollection(starterCars.map(c => c.carID));
		setHasClaimedStarter(true);
		return starterCars;
	}, [hasClaimedStarter, addCarsToCollection]);
	
	const openPack = useCallback((pack) => {
		if (money < pack.price) return null;
		
		if (pack.maxPurchases) {
			const purchased = packPurchases[pack.packID] || 0;
			if (purchased >= pack.maxPurchases) return null;
			setPackPurchases(prev => ({ ...prev, [pack.packID]: purchased + 1 }));
		}
		
		setMoney(prev => prev - pack.price);
		setPacksOpened(prev => prev + 1);
		
		const repetition = pack.repetition || 1;
		const cards = [];
		for (let r = 0; r < repetition; r++) {
			for (const slot of pack.packSequence) {
				cards.push(getRandomCarFromSlot(slot, pack.filter, garageStats.luck));
			}
		}
		
		return cards;
	}, [money, packPurchases, garageStats.luck]);
	
	const buyPrizeCar = useCallback((carId, tokenCost) => {
		if (tokens < tokenCost) return null;
		
		const car = findCarById(carId);
		if (!car) return null;
		
		setTokens(prev => prev - tokenCost);
		addCarsToCollection([carId]);
		
		if (!prizeCarBonuses[carId]) {
			const bonus = getRandomPrizeBonus();
			setPrizeCarBonuses(prev => ({ ...prev, [carId]: bonus.id }));
			return bonus;
		}
		
		return true;
	}, [tokens, prizeCarBonuses, addCarsToCollection]);
	
	const unlockDifficulty = useCallback((difficultyId, unlockCost) => {
		if (unlockedDifficulties.includes(difficultyId)) return false;
		if (tokens < unlockCost) return false;
		
		setTokens(prev => prev - unlockCost);
		setUnlockedDifficulties(prev => [...prev, difficultyId]);
		return true;
	}, [tokens, unlockedDifficulties]);
	
	// Calculate race rewards with Tune Mastery and Trophy Hunter
	const calculateRaceRewards = useCallback((difficulty, won) => {
		if (!won) {
			return { tokensEarned: 0, tuneTokensEarned: 0, bonusTokens: 0 };
		}
		
		// Base tokens from difficulty + Racing Sponsor upgrade
		let tokensEarned = difficulty.tokenReward + tokenBoostLevel;
		
		// Tune tokens from difficulty + Tune Mastery upgrade
		let tuneTokensEarned = (difficulty.tuneTokenReward || 0) + tuneMasteryLevel;
		
		// Trophy Hunter: chance for bonus tokens
		let bonusTokens = 0;
		if (trophyHunterChance > 0) {
			const roll = Math.random() * 100;
			if (roll < trophyHunterChance) {
				bonusTokens = 10;
				tokensEarned += bonusTokens;
			}
		}
		
		return { tokensEarned, tuneTokensEarned, bonusTokens };
	}, [tokenBoostLevel, tuneMasteryLevel, trophyHunterChance]);
	
	const addRaceRewards = useCallback((tokensEarned, tuneTokensEarned, won) => {
		if (tokensEarned > 0) setTokens(prev => prev + tokensEarned);
		if (tuneTokensEarned > 0) setTuneTokens(prev => prev + tuneTokensEarned);
		if (won) {
			setRacesWon(prev => prev + 1);
		} else {
			setRacesLost(prev => prev + 1);
		}
	}, []);
	
	const unequipAll = useCallback(() => {
		setGarage([]);
	}, []);
	
	// Legacy export/import for localStorage backwards compatibility
	const exportSave = useCallback(() => {
		const data = {
			money, garage, collection, upgrades, totalCollects, totalEarnings,
			lastCollect, hasClaimedStarter, packPurchases, packsOpened, carsSold,
			moneyFromSales, activeChallenge, purchasedChallenges, tokens, tuneTokens,
			racesWon, racesLost, unlockedDifficulties, carEnhancements, lockedCars,
			prizeCarBonuses
		};
		return compressSave(data);
	}, [money, garage, collection, upgrades, totalCollects, totalEarnings, lastCollect,
		hasClaimedStarter, packPurchases, packsOpened, carsSold, moneyFromSales,
		activeChallenge, purchasedChallenges, tokens, tuneTokens, racesWon, racesLost,
		unlockedDifficulties, carEnhancements, lockedCars, prizeCarBonuses]);
	
	const importSave = useCallback((code) => {
		const data = decompressSave(code);
		if (!data) return false;
		
		setMoney(data.money || 1000);
		setGarage(data.garage || []);
		setCollection(data.collection || {});
		setUpgrades(data.upgrades || {});
		setTotalCollects(data.totalCollects || 0);
		setTotalEarnings(data.totalEarnings || 0);
		setLastCollect(data.lastCollect || 0);
		setHasClaimedStarter(data.hasClaimedStarter || false);
		setPackPurchases(data.packPurchases || {});
		setPacksOpened(data.packsOpened || 0);
		setCarsSold(data.carsSold || 0);
		setMoneyFromSales(data.moneyFromSales || 0);
		setActiveChallenge(data.activeChallenge || null);
		setPurchasedChallenges(data.purchasedChallenges || []);
		setTokens(data.tokens || 0);
		setTuneTokens(data.tuneTokens || 0);
		setRacesWon(data.racesWon || 0);
		setRacesLost(data.racesLost || 0);
		setUnlockedDifficulties(data.unlockedDifficulties || ['low_cr']);
		setCarEnhancements(data.carEnhancements || {});
		setLockedCars(data.lockedCars instanceof Set ? data.lockedCars : new Set(data.lockedCars || []));
		setPrizeCarBonuses(data.prizeCarBonuses || {});
		
		return true;
	}, []);
	
	const resetGame = useCallback(() => {
		const defaultState = getDefaultGameState();
		setMoney(defaultState.money);
		setGarage(defaultState.garage);
		setCollection(defaultState.collection);
		setUpgrades(defaultState.upgrades);
		setTotalCollects(defaultState.totalCollects);
		setTotalEarnings(defaultState.totalEarnings);
		setLastCollect(defaultState.lastCollect);
		setHasClaimedStarter(defaultState.hasClaimedStarter);
		setPackPurchases(defaultState.packPurchases);
		setPacksOpened(defaultState.packsOpened);
		setCarsSold(defaultState.carsSold);
		setMoneyFromSales(defaultState.moneyFromSales);
		setActiveChallenge(defaultState.activeChallenge);
		setPurchasedChallenges(defaultState.purchasedChallenges);
		setTokens(defaultState.tokens);
		setTuneTokens(defaultState.tuneTokens);
		setRacesWon(defaultState.racesWon);
		setRacesLost(defaultState.racesLost);
		setUnlockedDifficulties(defaultState.unlockedDifficulties);
		setCarEnhancements(defaultState.carEnhancements);
		setLockedCars(defaultState.lockedCars);
		setPrizeCarBonuses(defaultState.prizeCarBonuses);
		localStorage.removeItem(SAVE_KEY);
	}, []);
	
	const value = {
		// State
		money, garage, collection, upgrades, totalCollects, totalEarnings,
		hasClaimedStarter, packPurchases, packsOpened, carsSold, moneyFromSales,
		activeChallenge, purchasedChallenges, tokens, tuneTokens, racesWon, racesLost,
		unlockedDifficulties, carEnhancements, lockedCars, prizeCarBonuses,
		
		// Game state object (for cloud save - clean format)
		gameState,
		
		// Derived values
		maxGarageSlots, bonusLuck, earningsMultiplier, tokenBoostLevel, hasMultiPackAccess, hasAdvancedEnhancement,
		totalCarCount, uniqueCarCount, uniquePrizeCarCount, setBonuses, garageStats,
		passiveIncomePerSecond, prizeCarPassiveIncomePerSecond, totalPassiveIncomePerSecond,
		cooldownSeconds, timeLeft, canCollect, cooldownProgress,
		activeChallengeData, challengeMet, challengeMultiplier, currentEarnings,
		
		// NEW derived values
		vipStatusMultiplier, sellBonusMultiplier, hasCooldownBreaker,
		tuneMasteryLevel, trophyHunterChance, bonusExtenderCap, minCooldown,
		
		// Static data
		allGameCars, gameCars, prizeCars, allPacks,
		
		// Helper functions
		getUpgradeLevel, getEffectiveMaxLevel, getUpgradeValueForLevel, findCarById, getCarCount: (carId) => getCarCount(collection, carId),
		
		// Actions
		handleCollect, addCarToGarage, removeCarFromGarage, addCarsToCollection,
		sellCar, sellAllDuplicates, toggleCarLock, enhanceCar, buyUpgrade, buyTokenUpgrade,
		purchaseChallenge, claimStarterPack, openPack, buyPrizeCar, unlockDifficulty,
		addRaceRewards, unequipAll, setActiveChallenge, calculateRaceRewards,
		
		// Save/Load (localStorage - legacy)
		exportSave, importSave, resetGame,
		
		// Cloud Save (clean format)
		loadCloudSave,
	};
	
	return (
		<GameContext.Provider value={value}>
			{children}
		</GameContext.Provider>
	);
};
