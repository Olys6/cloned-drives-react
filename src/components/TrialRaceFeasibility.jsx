/**
 * INTERNAL TESTING PAGE - Trial Race Feasibility
 * 
 * Purpose: Test whether a race is beatable by any car in the game 
 * given selected constraints.
 * 
 * Access: Direct URL only (/testingmode123)
 * NOT linked in navigation - INTERNAL USE ONLY
 * 
 * To remove: Delete this file and remove route from App.jsx
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
	Pagination,
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
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Slider,
} from '@mui/material';

// Data imports
import trackData from '../data/trackData.js';
import carData from '../data/data.js';

// Race engine
import { evaluateRace, getCarStats } from '../utils/raceEngine';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ============================================================
// IMAGE OPTIMIZATION HELPER
// Uses weserv.nl as a free image proxy/CDN for thumbnails
// ============================================================
const getThumbnailUrl = (originalUrl, width = 100, quality = 70) => {
	if (!originalUrl) return originalUrl;
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we&il`;
};

// ========== FILTER OPTIONS ==========
const raceCars = carData.filter(car => !car.reference);

// Extract unique values for dropdown filters
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

// Get numeric bounds for range filters
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

const RESULTS_PER_PAGE = 20;
const OPPONENT_CARS_PER_PAGE = 20;
const upgradeOptions = ["000", "333", "666", "699", "969", "996"];

// Table header style to fix white-on-white issue
const headerCellSx = { fontWeight: 'bold', backgroundColor: '#1a1a2e', color: '#fff' };
const bodyCellSx = { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' };

// ========== COMPONENT ==========
const TrialRaceFeasibility = () => {
	// Track & Opponent
	const [selectedTrack, setSelectedTrack] = useState(null);
	const [opponentCar, setOpponentCar] = useState(null);
	const [opponentUpgrade, setOpponentUpgrade] = useState("000");
	const [opponentSearch, setOpponentSearch] = useState('');
	const [opponentPage, setOpponentPage] = useState(1);

	// Player car filters (all filters from CarFilter.jsx)
	const [crRange, setCrRange] = useState([crBounds.min, crBounds.max]);
	const [filterBodyStyle, setFilterBodyStyle] = useState('');
	const [filterTyreType, setFilterTyreType] = useState('');
	const [filterMake, setFilterMake] = useState('');
	const [filterFuelType, setFilterFuelType] = useState('');
	const [filterCountry, setFilterCountry] = useState('');
	const [filterDriveType, setFilterDriveType] = useState('');
	const [filterGc, setFilterGc] = useState('');
	const [filterCreator, setFilterCreator] = useState('');
	const [filterEnginePos, setFilterEnginePos] = useState('');
	const [filterTag, setFilterTag] = useState('');
	const [filterPrize, setFilterPrize] = useState('');
	const [weightRange, setWeightRange] = useState([weightBounds.min, weightBounds.max]);
	const [mraRange, setMraRange] = useState([mraBounds.min, mraBounds.max]);
	const [olaRange, setOlaRange] = useState([olaBounds.min, olaBounds.max]);
	const [yearRange, setYearRange] = useState([yearBounds.min, yearBounds.max]);
	const [handlingRange, setHandlingRange] = useState([handlingBounds.min, handlingBounds.max]);
	const [accelRange, setAccelRange] = useState([accelBounds.min, accelBounds.max]);
	const [topSpeedRange, setTopSpeedRange] = useState([topSpeedBounds.min, topSpeedBounds.max]);
	const [seatRange, setSeatRange] = useState([seatBounds.min, seatBounds.max]);

	// Simulation state
	const [isRunning, setIsRunning] = useState(false);
	const [progress, setProgress] = useState(0);
	const [results, setResults] = useState(null);
	const [error, setError] = useState(null);
	const [resultsPage, setResultsPage] = useState(1);

	// Filtered opponent cars
	const filteredOpponentCars = useMemo(() => {
		if (!opponentSearch.trim()) return raceCars;
		const query = opponentSearch.toLowerCase();
		return raceCars.filter(car => {
			const make = Array.isArray(car.make) ? car.make.join(' ') : car.make;
			const searchStr = `${make} ${car.model} ${car.carID || ''}`.toLowerCase();
			return searchStr.includes(query);
		});
	}, [opponentSearch]);

	const paginatedOpponentCars = useMemo(() => {
		const start = (opponentPage - 1) * OPPONENT_CARS_PER_PAGE;
		return filteredOpponentCars.slice(start, start + OPPONENT_CARS_PER_PAGE);
	}, [filteredOpponentCars, opponentPage]);

	const totalOpponentPages = Math.ceil(filteredOpponentCars.length / OPPONENT_CARS_PER_PAGE);

	// Filter cars based on ALL requirements
	const filteredCars = useMemo(() => {
		return raceCars.filter(car => {
			if (car.cr < crRange[0] || car.cr > crRange[1]) return false;
			if (filterBodyStyle && car.bodyStyle !== filterBodyStyle) return false;
			if (filterTyreType && car.tyreType !== filterTyreType) return false;
			if (filterMake) {
				const makes = Array.isArray(car.make) ? car.make : [car.make];
				if (!makes.some(m => m?.toLowerCase().includes(filterMake.toLowerCase()))) return false;
			}
			if (filterFuelType && car.fuelType !== filterFuelType) return false;
			if (filterCountry && car.country !== filterCountry) return false;
			if (filterDriveType && car.driveType !== filterDriveType) return false;
			if (filterGc && car.gc !== filterGc) return false;
			if (filterCreator && car.creator !== filterCreator) return false;
			if (filterEnginePos && car.enginePos !== filterEnginePos) return false;
			if (filterTag && (!car.tags || !car.tags.includes(filterTag))) return false;
			if (filterPrize === 'prize' && !car.isPrize) return false;
			if (filterPrize === 'nonprize' && car.isPrize) return false;
			if (car.weight && (car.weight < weightRange[0] || car.weight > weightRange[1])) return false;
			if (car.mra && (car.mra < mraRange[0] || car.mra > mraRange[1])) return false;
			if (car.ola && (car.ola < olaRange[0] || car.ola > olaRange[1])) return false;
			if (car.modelYear && (car.modelYear < yearRange[0] || car.modelYear > yearRange[1])) return false;
			if (car.handling && (car.handling < handlingRange[0] || car.handling > handlingRange[1])) return false;
			if (car["0to60"] && (car["0to60"] < accelRange[0] || car["0to60"] > accelRange[1])) return false;
			if (car.topSpeed && (car.topSpeed < topSpeedRange[0] || car.topSpeed > topSpeedRange[1])) return false;
			if (car.seatCount && (car.seatCount < seatRange[0] || car.seatCount > seatRange[1])) return false;
			if (!car.topSpeed || !car["0to60"] || !car.handling) return false;
			return true;
		});
	}, [crRange, filterBodyStyle, filterTyreType, filterMake, filterFuelType, filterCountry, filterDriveType, filterGc, filterCreator, filterEnginePos, filterTag, filterPrize, weightRange, mraRange, olaRange, yearRange, handlingRange, accelRange, topSpeedRange, seatRange]);

	const getCarName = (car) => {
		if (!car) return "";
		const make = Array.isArray(car.make) ? car.make[0] : car.make;
		return `${make} ${car.model}`;
	};

	// Run simulation - tests ALL tunes for each car
	const runSimulation = useCallback(async () => {
		if (!selectedTrack) { setError("Please select a track"); return; }
		if (!opponentCar) { setError("Please select an opponent car"); return; }
		if (filteredCars.length === 0) { setError("No cars match the current filters"); return; }

		setError(null);
		setIsRunning(true);
		setProgress(0);
		setResults(null);

		const opponentStats = getCarStats(opponentCar, opponentUpgrade);
		const winningCars = [];
		const losingCars = [];
		const total = filteredCars.length;
		const batchSize = 50;

		for (let i = 0; i < total; i += batchSize) {
			const batch = filteredCars.slice(i, i + batchSize);
			batch.forEach(car => {
				try {
					let bestScore = -Infinity;
					let bestTune = "000";
					for (const tune of upgradeOptions) {
						const playerStats = getCarStats(car, tune);
						if (!playerStats) continue;
						const score = evaluateRace(playerStats, opponentStats, selectedTrack);
						if (score > bestScore) { bestScore = score; bestTune = tune; }
					}
					if (bestScore === -Infinity) {
						losingCars.push({ car, score: null, tune: null, error: "Missing stats" });
						return;
					}
					if (bestScore > 0) {
						winningCars.push({ car, score: bestScore, tune: bestTune });
					} else {
						losingCars.push({ car, score: bestScore, tune: bestTune });
					}
				} catch (err) {
					losingCars.push({ car, score: null, tune: null, error: err.message });
				}
			});
			setProgress(Math.min(100, ((i + batch.length) / total) * 100));
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		winningCars.sort((a, b) => b.score - a.score);
		losingCars.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));

		setResults({
			beatable: winningCars.length > 0,
			totalTested: total,
			winningCars,
			losingCars,
			closestLosers: losingCars.slice(0, 10),
			track: selectedTrack,
			opponent: opponentCar,
		});
		setIsRunning(false);
		setResultsPage(1);
	}, [selectedTrack, opponentCar, opponentUpgrade, filteredCars]);

	const paginatedWinners = useMemo(() => {
		if (!results?.winningCars) return [];
		const start = (resultsPage - 1) * RESULTS_PER_PAGE;
		return results.winningCars.slice(start, start + RESULTS_PER_PAGE);
	}, [results, resultsPage]);

	const totalResultPages = results ? Math.ceil(results.winningCars.length / RESULTS_PER_PAGE) : 0;

	// Reset all filters
	const resetFilters = () => {
		setCrRange([crBounds.min, crBounds.max]);
		setFilterBodyStyle(''); setFilterTyreType(''); setFilterMake('');
		setFilterFuelType(''); setFilterCountry(''); setFilterDriveType('');
		setFilterGc(''); setFilterCreator(''); setFilterEnginePos('');
		setFilterTag(''); setFilterPrize('');
		setWeightRange([weightBounds.min, weightBounds.max]);
		setMraRange([mraBounds.min, mraBounds.max]);
		setOlaRange([olaBounds.min, olaBounds.max]);
		setYearRange([yearBounds.min, yearBounds.max]);
		setHandlingRange([handlingBounds.min, handlingBounds.max]);
		setAccelRange([accelBounds.min, accelBounds.max]);
		setTopSpeedRange([topSpeedBounds.min, topSpeedBounds.max]);
		setSeatRange([seatBounds.min, seatBounds.max]);
	};

	// Dropdown filter component
	const FilterSelect = ({ label, value, setValue, options }) => (
		<FormControl size="small" sx={{ minWidth: 130 }}>
			<InputLabel>{label}</InputLabel>
			<Select value={value} label={label} onChange={(e) => setValue(e.target.value)}>
				<MenuItem value="">Any</MenuItem>
				{options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
			</Select>
		</FormControl>
	);

	// Range slider component
	const RangeSlider = ({ label, value, setValue, min, max, step = 1 }) => (
		<Box sx={{ minWidth: 150, px: 1 }}>
			<Typography variant="caption" color="text.secondary">{label}: {value[0]} - {value[1]}</Typography>
			<Slider
				size="small"
				value={value}
				onChange={(e, newVal) => setValue(newVal)}
				min={min}
				max={max}
				step={step}
				valueLabelDisplay="auto"
			/>
		</Box>
	);

	return (
		<Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
			{/* Header */}
			<Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(156, 39, 176, 0.2)', border: '2px solid #9c27b0' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
					<ScienceIcon sx={{ color: '#9c27b0' }} />
					<Typography variant="h5" fontWeight="bold" sx={{ color: '#9c27b0' }}>
						Trial Race Feasibility Tester
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary">
					Internal testing tool - Tests ALL 6 tune configurations for each car automatically
				</Typography>
			</Paper>

			{/* Configuration */}
			<Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>Track & Opponent</Typography>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
					{/* Track Selector */}
					<Box sx={{ flex: '1 1 300px' }}>
						<Typography variant="subtitle2" gutterBottom>Track</Typography>
						<Autocomplete
							size="small"
							value={selectedTrack}
							options={trackData}
							getOptionLabel={(track) => track.trackName || ''}
							onChange={(e, newValue) => setSelectedTrack(newValue)}
							renderOption={(props, track) => (
								<Box component="li" {...props} sx={{ fontSize: '0.8rem' }}>
									{track.trackName}
									<Chip label={track.surface} size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
								</Box>
							)}
							renderInput={(params) => <TextField {...params} label="Select Track" placeholder="Search tracks..." />}
						/>
						{selectedTrack && (
							<Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
								<Chip label={selectedTrack.weather} size="small" color={selectedTrack.weather === "Sunny" ? "warning" : "info"} />
								<Chip label={selectedTrack.surface} size="small" />
								{selectedTrack.speedbumps > 0 && <Chip label={`SB: ${selectedTrack.speedbumps}`} size="small" color="error" />}
								{selectedTrack.humps > 0 && <Chip label={`Humps: ${selectedTrack.humps}`} size="small" color="secondary" />}
							</Box>
						)}
					</Box>

					{/* Opponent Selector - Paginated */}
					<Box sx={{ flex: '1 1 400px' }}>
						<Typography variant="subtitle2" gutterBottom>Opponent Car</Typography>
						<TextField
							size="small" fullWidth placeholder="Search opponent cars..."
							value={opponentSearch}
							onChange={(e) => { setOpponentSearch(e.target.value); setOpponentPage(1); }}
							sx={{ mb: 1 }}
						/>
						{opponentCar && (
							<Box sx={{ mb: 1, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.2)', borderRadius: 1, border: '1px solid #f44336' }}>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
									Selected: {getCarName(opponentCar)} (CR {opponentCar.cr}) - ID: {opponentCar.carID}
								</Typography>
							</Box>
						)}
						<Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 1, mb: 1 }}>
							{paginatedOpponentCars.map(car => (
								<Box
									key={car.carID}
									onClick={() => setOpponentCar(car)}
									sx={{
										p: 0.75, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1,
										backgroundColor: opponentCar?.carID === car.carID ? 'rgba(244, 67, 54, 0.3)' : 'transparent',
										'&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
										borderBottom: '1px solid rgba(255,255,255,0.05)',
									}}
								>
									{car.racehud && <img src={getThumbnailUrl(car.racehud, 60)} alt="" style={{ width: 40, height: 24, objectFit: 'cover', borderRadius: 2 }} />}
									<Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem' }}>{getCarName(car)}</Typography>
									<Chip label={`CR ${car.cr}`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
								</Box>
							))}
						</Box>
						{totalOpponentPages > 1 && (
							<Pagination size="small" count={totalOpponentPages} page={opponentPage} onChange={(e, value) => setOpponentPage(value)} sx={{ display: 'flex', justifyContent: 'center' }} />
						)}
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
							{filteredOpponentCars.length} cars
						</Typography>
						<FormControl size="small" sx={{ mt: 1, minWidth: 100 }}>
							<InputLabel>Opponent Tune</InputLabel>
							<Select value={opponentUpgrade} label="Opponent Tune" onChange={(e) => setOpponentUpgrade(e.target.value)}>
								{upgradeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
							</Select>
						</FormControl>
					</Box>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* Race Requirements (All Filters) */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6">Race Requirements (Player Car Filters)</Typography>
					<Button size="small" variant="outlined" onClick={resetFilters}>Reset Filters</Button>
				</Box>

				{/* Basic Filters Row */}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
					<FilterSelect label="Body Style" value={filterBodyStyle} setValue={setFilterBodyStyle} options={allBodyStyles} />
					<FilterSelect label="Tyre Type" value={filterTyreType} setValue={setFilterTyreType} options={allTyreTypes} />
					<FilterSelect label="Drive Type" value={filterDriveType} setValue={setFilterDriveType} options={allDriveTypes} />
					<FilterSelect label="Fuel Type" value={filterFuelType} setValue={setFilterFuelType} options={allFuelTypes} />
					<FilterSelect label="Country" value={filterCountry} setValue={setFilterCountry} options={allCountries} />
					<FilterSelect label="GC" value={filterGc} setValue={setFilterGc} options={allGcs} />
					<FilterSelect label="Engine Pos" value={filterEnginePos} setValue={setFilterEnginePos} options={allEnginePosOptions} />
					<FilterSelect label="Creator" value={filterCreator} setValue={setFilterCreator} options={allCreators} />
					<FilterSelect label="Tag" value={filterTag} setValue={setFilterTag} options={allTags} />
					<FormControl size="small" sx={{ minWidth: 130 }}>
						<InputLabel>Prize</InputLabel>
						<Select value={filterPrize} label="Prize" onChange={(e) => setFilterPrize(e.target.value)}>
							<MenuItem value="">Any</MenuItem>
							<MenuItem value="prize">Prize Only</MenuItem>
							<MenuItem value="nonprize">Non-Prize Only</MenuItem>
						</Select>
					</FormControl>
					<Autocomplete
						size="small" freeSolo options={allMakes} value={filterMake}
						onInputChange={(e, newValue) => setFilterMake(newValue || '')}
						sx={{ minWidth: 150 }}
						renderInput={(params) => <TextField {...params} label="Make" placeholder="Search..." />}
					/>
				</Box>

				{/* Range Filters Accordion */}
				<Accordion sx={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>Range Filters (CR, Stats, Year, etc.)</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
							<RangeSlider label="CR" value={crRange} setValue={setCrRange} min={crBounds.min} max={crBounds.max} />
							<RangeSlider label="Top Speed" value={topSpeedRange} setValue={setTopSpeedRange} min={topSpeedBounds.min} max={topSpeedBounds.max} />
							<RangeSlider label="0-60" value={accelRange} setValue={setAccelRange} min={accelBounds.min} max={accelBounds.max} step={0.1} />
							<RangeSlider label="Handling" value={handlingRange} setValue={setHandlingRange} min={handlingBounds.min} max={handlingBounds.max} />
							<RangeSlider label="Weight" value={weightRange} setValue={setWeightRange} min={weightBounds.min} max={weightBounds.max} step={10} />
							<RangeSlider label="MRA" value={mraRange} setValue={setMraRange} min={mraBounds.min} max={mraBounds.max} />
							<RangeSlider label="OLA" value={olaRange} setValue={setOlaRange} min={olaBounds.min} max={olaBounds.max} />
							<RangeSlider label="Year" value={yearRange} setValue={setYearRange} min={yearBounds.min} max={yearBounds.max} />
							<RangeSlider label="Seats" value={seatRange} setValue={setSeatRange} min={seatBounds.min} max={seatBounds.max} />
						</Box>
					</AccordionDetails>
				</Accordion>

				{/* Filter Summary & Run */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
					<Typography variant="body2" color="text.secondary">
						<strong>{filteredCars.length}</strong> cars match filters (testing {filteredCars.length * 6} car/tune combinations)
					</Typography>
					<Button
						variant="contained" color="secondary"
						startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
						onClick={runSimulation} disabled={isRunning} sx={{ ml: 'auto' }}
					>
						{isRunning ? 'Running...' : 'Run Simulation'}
					</Button>
				</Box>

				{isRunning && (
					<Box sx={{ mt: 2 }}>
						<LinearProgress variant="determinate" value={progress} color="secondary" />
						<Typography variant="caption" color="text.secondary">Testing {Math.round(progress)}%...</Typography>
					</Box>
				)}

				{error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>{error}</Alert>}
			</Paper>

			{/* Results */}
			{results && (
				<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					{/* Summary */}
					<Box sx={{
						display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, borderRadius: 2,
						backgroundColor: results.beatable ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
						border: `2px solid ${results.beatable ? '#4caf50' : '#f44336'}`,
					}}>
						{results.beatable ? <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} /> : <CancelIcon sx={{ fontSize: 40, color: '#f44336' }} />}
						<Box>
							<Typography variant="h5" fontWeight="bold" sx={{ color: results.beatable ? '#4caf50' : '#f44336' }}>
								{results.beatable ? 'BEATABLE' : 'NOT BEATABLE'}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{results.winningCars.length} of {results.totalTested} cars can win
								{results.beatable && ` (${((results.winningCars.length / results.totalTested) * 100).toFixed(1)}%)`}
							</Typography>
						</Box>
						<Box sx={{ ml: 'auto', textAlign: 'right' }}>
							<Typography variant="body2" color="text.secondary">Track: <strong>{results.track.trackName}</strong></Typography>
							<Typography variant="body2" color="text.secondary">vs: <strong>{getCarName(results.opponent)}</strong></Typography>
						</Box>
					</Box>

					{/* Winning Cars Table */}
					{results.winningCars.length > 0 && (
						<>
							<Typography variant="h6" gutterBottom sx={{ color: '#4caf50' }}>Winning Cars ({results.winningCars.length})</Typography>
							<TableContainer sx={{ maxHeight: 500 }}>
								<Table size="small" stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell sx={headerCellSx}>Car ID</TableCell>
											<TableCell sx={headerCellSx}>Car</TableCell>
											<TableCell sx={headerCellSx}>CR</TableCell>
											<TableCell sx={headerCellSx}>Best Tune</TableCell>
											<TableCell sx={headerCellSx}>Body Style</TableCell>
											<TableCell sx={headerCellSx}>Tyre</TableCell>
											<TableCell sx={headerCellSx}>Drive</TableCell>
											<TableCell sx={{ ...headerCellSx, textAlign: 'right' }}>Score</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{paginatedWinners.map(({ car, score, tune }, idx) => (
											<TableRow key={car.carID || idx} hover>
												<TableCell sx={bodyCellSx}>{car.carID}</TableCell>
												<TableCell sx={bodyCellSx}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														{car.racehud && <img src={getThumbnailUrl(car.racehud, 80)} alt="" style={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 4 }} />}
														<Typography variant="body2">{getCarName(car)}</Typography>
													</Box>
												</TableCell>
												<TableCell sx={bodyCellSx}>{car.cr}</TableCell>
												<TableCell sx={bodyCellSx}><Chip label={tune} size="small" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
												<TableCell sx={bodyCellSx}>{car.bodyStyle}</TableCell>
												<TableCell sx={bodyCellSx}>{car.tyreType}</TableCell>
												<TableCell sx={bodyCellSx}>{car.driveType}</TableCell>
												<TableCell sx={{ ...bodyCellSx, textAlign: 'right', color: '#4caf50', fontWeight: 'bold' }}>+{score.toFixed(1)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
							{totalResultPages > 1 && (
								<Stack sx={{ mt: 2 }}>
									<Pagination sx={{ display: 'flex', justifyContent: 'center' }} count={totalResultPages} page={resultsPage} onChange={(e, value) => setResultsPage(value)} variant="outlined" color="secondary" size="small" />
								</Stack>
							)}
						</>
					)}

					{/* Closest Losers - shown when no winners */}
					{results.winningCars.length === 0 && results.closestLosers && results.closestLosers.length > 0 && (
						<>
							<Alert severity="warning" sx={{ mb: 2 }}>
								No cars can beat this race with the selected filters. Showing the 10 closest finishes below.
							</Alert>
							<Typography variant="h6" gutterBottom sx={{ color: '#ff9800' }}>Closest Losing Cars (Top 10)</Typography>
							<TableContainer sx={{ maxHeight: 400 }}>
								<Table size="small" stickyHeader>
									<TableHead>
										<TableRow>
											<TableCell sx={headerCellSx}>Car ID</TableCell>
											<TableCell sx={headerCellSx}>Car</TableCell>
											<TableCell sx={headerCellSx}>CR</TableCell>
											<TableCell sx={headerCellSx}>Best Tune</TableCell>
											<TableCell sx={headerCellSx}>Body Style</TableCell>
											<TableCell sx={headerCellSx}>Tyre</TableCell>
											<TableCell sx={headerCellSx}>Drive</TableCell>
											<TableCell sx={{ ...headerCellSx, textAlign: 'right' }}>Margin</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{results.closestLosers.map(({ car, score, tune }, idx) => (
											<TableRow key={car.carID || idx} hover>
												<TableCell sx={bodyCellSx}>{car.carID}</TableCell>
												<TableCell sx={bodyCellSx}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														{car.racehud && <img src={getThumbnailUrl(car.racehud, 80)} alt="" style={{ width: 50, height: 30, objectFit: 'cover', borderRadius: 4 }} />}
														<Typography variant="body2">{getCarName(car)}</Typography>
													</Box>
												</TableCell>
												<TableCell sx={bodyCellSx}>{car.cr}</TableCell>
												<TableCell sx={bodyCellSx}><Chip label={tune || '000'} size="small" sx={{ height: 20, fontSize: '0.7rem' }} /></TableCell>
												<TableCell sx={bodyCellSx}>{car.bodyStyle}</TableCell>
												<TableCell sx={bodyCellSx}>{car.tyreType}</TableCell>
												<TableCell sx={bodyCellSx}>{car.driveType}</TableCell>
												<TableCell sx={{ ...bodyCellSx, textAlign: 'right', color: '#f44336', fontWeight: 'bold' }}>
													{score !== null ? score.toFixed(1) : 'ERR'}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}
				</Paper>
			)}
		</Box>
	);
};

export default TrialRaceFeasibility;
