import { useState, useMemo, useEffect, useCallback } from 'react';
import carData from '../data/data.js';
import { Pagination, Stack, Box, Typography, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAuth } from '../contexts/AuthContext';

import CarFilter from './CarFilter.jsx';
import Cards from './Cards.jsx';

// ============================================================
// ACCENT COLOR MAP
// Matches Settings.jsx / Profile.jsx colorOptions
// ============================================================
export const accentColorMap = {
	gold: '#b8860b',
	blue: '#2196f3',
	red: '#f44336',
	green: '#4caf50',
	purple: '#9c27b0',
	pink: '#e91e63',
	orange: '#ff9800',
	teal: '#009688',
	silver: '#9e9e9e',
};

// ============================================================
// PRECOMPUTED BOUNDS - runs once at module load
// Replaces the old mutable module-level variables
// ============================================================
export const bounds = (() => {
	const b = {
		minCr: Infinity, maxCr: -Infinity,
		minTopSpeed: Infinity, maxTopSpeed: -Infinity,
		min0to60: Infinity, max0to60: -Infinity,
		minHandling: Infinity, maxHandling: -Infinity,
		minYear: Infinity, maxYear: -Infinity,
		minMra: Infinity, maxMra: -Infinity,
		minOla: Infinity, maxOla: -Infinity,
		minWeight: Infinity, maxWeight: -Infinity,
		minSeatCount: Infinity, maxSeatCount: -Infinity,
	};

	carData.forEach(car => {
		if (car.cr != null) { b.minCr = Math.min(b.minCr, car.cr); b.maxCr = Math.max(b.maxCr, car.cr); }
		if (car.topSpeed != null) { b.minTopSpeed = Math.min(b.minTopSpeed, car.topSpeed); b.maxTopSpeed = Math.max(b.maxTopSpeed, car.topSpeed); }
		if (car['0to60'] != null) { b.min0to60 = Math.min(b.min0to60, car['0to60']); b.max0to60 = Math.max(b.max0to60, car['0to60']); }
		if (car.handling != null) { b.minHandling = Math.min(b.minHandling, car.handling); b.maxHandling = Math.max(b.maxHandling, car.handling); }
		if (car.modelYear != null) { b.minYear = Math.min(b.minYear, car.modelYear); b.maxYear = Math.max(b.maxYear, car.modelYear); }
		if (car.mra != null) { b.minMra = Math.min(b.minMra, car.mra); b.maxMra = Math.max(b.maxMra, car.mra); }
		if (car.ola != null) { b.minOla = Math.min(b.minOla, car.ola); b.maxOla = Math.max(b.maxOla, car.ola); }
		if (car.weight != null) { b.minWeight = Math.min(b.minWeight, car.weight); b.maxWeight = Math.max(b.maxWeight, car.weight); }
		if (car.seatCount) { b.minSeatCount = Math.min(b.minSeatCount, car.seatCount); b.maxSeatCount = Math.max(b.maxSeatCount, car.seatCount); }
	});

	// Replace any leftover Infinity with 0
	Object.keys(b).forEach(key => { if (!isFinite(b[key])) b[key] = 0; });
	return Object.freeze(b);
})();

// Escape special regex characters in user search input
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ============================================================
// DATA INTEGRITY CHECK - warn about cars with missing/falsy carID
// ============================================================
if (typeof window !== 'undefined') {
	const badCars = carData.filter(car => !car.carID || car.carID === 0);
	if (badCars.length > 0) {
		console.warn(
			`[CD Club] Found ${badCars.length} car(s) with missing or falsy carID:`,
			badCars.map(c => ({
				make: Array.isArray(c.make) ? c.make[0] : c.make,
				model: c.model,
				year: c.modelYear,
				carID: c.carID,
			}))
		);
	}
}

// ============================================================
// HOME COMPONENT
// ============================================================
const Home = () => {
	// --- Auth & accent color ---
	const { user } = useAuth();
	const accentColor = accentColorMap[user?.accent_color] || '#b8860b';

	// --- Filter state ---
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [carsSortType, setCarsSortType] = useState(2);
	const [numOfCars, setNumOfCars] = useState(10);
	const [prize, setPrize] = useState(1);

	// Range filters (all initialised to full bounds)
	const [rqValue, setRqValue] = useState([bounds.minCr, bounds.maxCr]);
	const [topSpeed, setTopSpeed] = useState([bounds.minTopSpeed, bounds.maxTopSpeed]);
	const [zeroTo60, setZeroTo60] = useState([bounds.min0to60, bounds.max0to60]);
	const [handling, setHandling] = useState([bounds.minHandling, bounds.maxHandling]);
	const [year, setYear] = useState([bounds.minYear, bounds.maxYear]);
	const [mra, setMra] = useState([bounds.minMra, bounds.maxMra]);
	const [ola, setOla] = useState([bounds.minOla, bounds.maxOla]);
	const [weight, setWeight] = useState([bounds.minWeight, bounds.maxWeight]);
	const [seatCount, setSeatCount] = useState([bounds.minSeatCount, bounds.maxSeatCount]);

	// Multi-select filters
	const [carTag, setCarTag] = useState([]);
	const [carCountryValue, setCarCountryValue] = useState([]);
	const [carMake, setCarMake] = useState([]);
	const [carTyre, setCarTyre] = useState([]);
	const [carDriveType, setCarDriveType] = useState([]);
	const [bodyStyle, setBodyStyle] = useState([]);
	const [creator, setCreator] = useState([]);
	const [fuelType, setFuelType] = useState([]);
	const [gc, setGc] = useState([]);
	const [enginePos, setEnginePos] = useState([]);

	// ==========================================================
	// MEMOISED FILTER - the single biggest performance win.
	// Previously this was a plain function called 3-4x per render.
	// ==========================================================
	const filteredResults = useMemo(() => {
		let regexSearch;
		try {
			regexSearch = new RegExp(`\\b${escapeRegex(search)}`, 'i');
		} catch {
			regexSearch = new RegExp(escapeRegex(search), 'i');
		}

		return carData.filter(car => {
			const makePrimary = Array.isArray(car.make) ? car.make[0] : car.make;
			return (
				(regexSearch.test(makePrimary) ||
					regexSearch.test(car.model) ||
					regexSearch.test(`${makePrimary} ${car.model}`)) &&
				car.cr <= rqValue[1] && car.cr >= rqValue[0] &&
				car.topSpeed <= topSpeed[1] && car.topSpeed >= topSpeed[0] &&
				car['0to60'] <= zeroTo60[1] && car['0to60'] >= zeroTo60[0] &&
				car.handling <= handling[1] && car.handling >= handling[0] &&
				car.modelYear <= year[1] && car.modelYear >= year[0] &&
				car.mra <= mra[1] && car.mra >= mra[0] &&
				car.ola <= ola[1] && car.ola >= ola[0] &&
				car.weight <= weight[1] && car.weight >= weight[0] &&
				(car.seatCount
					? car.seatCount >= seatCount[0] && car.seatCount <= seatCount[1]
					: true) &&
				(enginePos.length > 0 ? enginePos.includes(car.enginePos) : true) &&
				(carMake.length > 0 ? carMake.some(m => car.make.includes(m)) : true) &&
				(carTag.length > 0 ? carTag.some(t => car.tags.includes(t)) : true) &&
				(carCountryValue.length > 0
					? carCountryValue.some(c => c.code === car.country) : true) &&
				(carTyre.length > 0 ? carTyre.includes(car.tyreType) : true) &&
				(carDriveType.length > 0 ? carDriveType.includes(car.driveType) : true) &&
				(bodyStyle.length > 0 ? bodyStyle.includes(car.bodyStyle) : true) &&
				(creator.length > 0 ? creator.includes(car.creator) : true) &&
				(fuelType.length > 0 ? fuelType.includes(car.fuelType) : true) &&
				(gc.length > 0 ? gc.includes(car.gc) : true) &&
				(prize > 1
					? prize === 2 ? car.isPrize : car.isPrize === false
					: true)
			);
		});
	}, [
		search, rqValue, topSpeed, zeroTo60, handling, year, mra, ola, weight,
		seatCount, enginePos, carMake, carTag, carCountryValue, carTyre,
		carDriveType, bodyStyle, creator, fuelType, gc, prize,
	]);

	// ==========================================================
	// AUTO-RESET PAGE when any filter or page-size changes
	// ==========================================================
	useEffect(() => {
		setPage(1);
	}, [
		search, rqValue, topSpeed, zeroTo60, handling, year, mra, ola, weight,
		seatCount, enginePos, carMake, carTag, carCountryValue, carTyre,
		carDriveType, bodyStyle, creator, fuelType, gc, prize, numOfCars,
	]);

	// Clamp page to valid range (prevents blank page for one frame)
	const totalPages = Math.max(1, Math.ceil(filteredResults.length / numOfCars));
	const safePage = Math.min(page, totalPages);

	// ==========================================================
	// RESET ALL FILTERS
	// ==========================================================
	const hasActiveFilters = useMemo(() => {
		return search !== '' ||
			rqValue[0] !== bounds.minCr || rqValue[1] !== bounds.maxCr ||
			topSpeed[0] !== bounds.minTopSpeed || topSpeed[1] !== bounds.maxTopSpeed ||
			zeroTo60[0] !== bounds.min0to60 || zeroTo60[1] !== bounds.max0to60 ||
			handling[0] !== bounds.minHandling || handling[1] !== bounds.maxHandling ||
			year[0] !== bounds.minYear || year[1] !== bounds.maxYear ||
			mra[0] !== bounds.minMra || mra[1] !== bounds.maxMra ||
			ola[0] !== bounds.minOla || ola[1] !== bounds.maxOla ||
			weight[0] !== bounds.minWeight || weight[1] !== bounds.maxWeight ||
			seatCount[0] !== bounds.minSeatCount || seatCount[1] !== bounds.maxSeatCount ||
			carMake.length > 0 || carTag.length > 0 || carCountryValue.length > 0 ||
			carTyre.length > 0 || carDriveType.length > 0 || bodyStyle.length > 0 ||
			creator.length > 0 || fuelType.length > 0 || gc.length > 0 ||
			enginePos.length > 0 || prize !== 1;
	}, [
		search, rqValue, topSpeed, zeroTo60, handling, year, mra, ola, weight,
		seatCount, enginePos, carMake, carTag, carCountryValue, carTyre,
		carDriveType, bodyStyle, creator, fuelType, gc, prize,
	]);

	const resetFilters = useCallback(() => {
		setSearch('');
		setRqValue([bounds.minCr, bounds.maxCr]);
		setTopSpeed([bounds.minTopSpeed, bounds.maxTopSpeed]);
		setZeroTo60([bounds.min0to60, bounds.max0to60]);
		setHandling([bounds.minHandling, bounds.maxHandling]);
		setYear([bounds.minYear, bounds.maxYear]);
		setMra([bounds.minMra, bounds.maxMra]);
		setOla([bounds.minOla, bounds.maxOla]);
		setWeight([bounds.minWeight, bounds.maxWeight]);
		setSeatCount([bounds.minSeatCount, bounds.maxSeatCount]);
		setCarMake([]);
		setCarTag([]);
		setCarCountryValue([]);
		setCarTyre([]);
		setCarDriveType([]);
		setBodyStyle([]);
		setCreator([]);
		setFuelType([]);
		setGc([]);
		setEnginePos([]);
		setPrize(1);
		setCarsSortType(2);
		setPage(1);
	}, []);

	// ==========================================================
	// RENDER
	// ==========================================================
	return (
		<>
			<CarFilter
				accentColor={accentColor}
				bounds={bounds}
				// Search
				search={search} setSearch={setSearch}
				// Sort
				carsSortType={carsSortType} setCarsSortType={setCarsSortType}
				// Range filters
				rqValue={rqValue} setRqValue={setRqValue}
				topSpeed={topSpeed} setTopSpeed={setTopSpeed}
				zeroTo60={zeroTo60} setZeroTo60={setZeroTo60}
				handling={handling} setHandling={setHandling}
				year={year} setYear={setYear}
				mra={mra} setMra={setMra}
				ola={ola} setOla={setOla}
				weight={weight} setWeight={setWeight}
				seatCount={seatCount} setSeatCount={setSeatCount}
				// Multi-select filters
				carTag={carTag} setCarTag={setCarTag}
				carCountryValue={carCountryValue} setCarCountryValue={setCarCountryValue}
				carMake={carMake} setCarMake={setCarMake}
				carTyre={carTyre} setCarTyre={setCarTyre}
				carDriveType={carDriveType} setCarDriveType={setCarDriveType}
				bodyStyle={bodyStyle} setBodyStyle={setBodyStyle}
				creator={creator} setCreator={setCreator}
				fuelType={fuelType} setFuelType={setFuelType}
				gc={gc} setGc={setGc}
				enginePos={enginePos} setEnginePos={setEnginePos}
				// Other
				numOfCars={numOfCars} setNumOfCars={setNumOfCars}
				prize={prize} setPrize={setPrize}
				setPage={setPage}
			/>

			{/* ========== RESULT BAR ========== */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					px: { xs: 1.5, md: 2 },
					py: 1,
					mx: 'auto',
					maxWidth: '98%',
				}}>
				<Typography
					variant='body2'
					sx={{ color: 'text.secondary', fontFamily: 'Rubik-BoldItalic' }}>
					Showing{' '}
					<span style={{ color: accentColor, fontWeight: 'bold' }}>
						{filteredResults.length}
					</span>{' '}
					of {carData.length} cars
				</Typography>
				{hasActiveFilters && (
					<Button
						size='small'
						startIcon={<RestartAltIcon />}
						onClick={resetFilters}
						sx={{
							color: accentColor,
							borderColor: accentColor,
							textTransform: 'none',
							'&:hover': {
								bgcolor: `${accentColor}22`,
								borderColor: accentColor,
							},
						}}
						variant='outlined'>
						Reset Filters
					</Button>
				)}
			</Box>

			{/* ========== CAR GRID ========== */}
			<Cards
				accentColor={accentColor}
				carsSortType={carsSortType}
				filteredCars={filteredResults}
				page={safePage}
				numOfCars={numOfCars}
			/>

			{/* ========== PAGINATION ========== */}
			<Stack sx={{ py: 2 }}>
				<Pagination
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						'& .MuiPaginationItem-root': {
							color: 'white',
							borderColor: 'rgba(255,255,255,0.3)',
						},
						'& .Mui-selected': {
							bgcolor: `${accentColor} !important`,
							color: '#fff !important',
						},
					}}
					size='large'
					count={totalPages}
					onChange={(e, value) => setPage(value)}
					page={safePage}
					variant='outlined'
					shape='rounded'
				/>
			</Stack>
		</>
	);
};

export default Home;
