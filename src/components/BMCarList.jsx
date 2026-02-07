import { useState, useMemo, useEffect, useCallback } from 'react';
import { Pagination, Stack, Typography, Box, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAuth } from '../contexts/AuthContext';

import carData from '../data/data.js';
import BMCarFilter from './BMCarFilter.jsx';
import BMCarCards from './BMCarCards.jsx';

// ============================================================
// ACCENT COLOR MAP (same as Home.jsx)
// ============================================================
const accentColorMap = {
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
// BM CAR DATA - precomputed once at module load
// ============================================================
const bmCarData = carData.filter(car => car.reference);

// Build a lookup map for referenced cars (avoids .find() per filter pass)
const refCarMap = (() => {
	const map = {};
	bmCarData.forEach(car => {
		if (car.reference && !map[car.reference]) {
			const ref = carData.find(c => c.carID === car.reference);
			if (ref) map[car.reference] = ref;
		}
	});
	return map;
})();

// Precompute CR bounds from referenced cars
const bmBounds = (() => {
	const b = { minCr: Infinity, maxCr: -Infinity };
	bmCarData.forEach(car => {
		const ref = refCarMap[car.reference];
		if (ref?.cr != null) {
			b.minCr = Math.min(b.minCr, ref.cr);
			b.maxCr = Math.max(b.maxCr, ref.cr);
		}
	});
	Object.keys(b).forEach(key => { if (!isFinite(b[key])) b[key] = 0; });
	return Object.freeze(b);
})();

// Precompute static filter options
const bmStaticOptions = (() => {
	const makes = new Set();
	const countryCodes = new Set();
	const collections = new Set();
	const creators = new Set();

	bmCarData.forEach(car => {
		if (Array.isArray(car.make)) car.make.forEach(m => makes.add(m));
		else if (car.make) makes.add(car.make);
		if (car.country) countryCodes.add(car.country);
		if (car.creator) creators.add(car.creator);
		if (car.collection) {
			if (Array.isArray(car.collection)) car.collection.forEach(c => collections.add(c));
			else collections.add(car.collection);
		}
	});

	return Object.freeze({
		makes: [...makes].sort(),
		countryCodes,
		collections: [...collections].sort(),
		creators: [...creators].sort(),
	});
})();

// Escape special regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ============================================================
// COMPONENT
// ============================================================
const BMCarList = () => {
	const { user } = useAuth();
	const accentColor = accentColorMap[user?.accent_color] || '#b8860b';

	// --- Filter state ---
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [numOfCars, setNumOfCars] = useState(12);
	const [sortType, setSortType] = useState(1);
	const [collection, setCollection] = useState([]);
	const [creator, setCreator] = useState([]);
	const [activeFilter, setActiveFilter] = useState('all');
	const [crRange, setCrRange] = useState([bmBounds.minCr, bmBounds.maxCr]);
	const [carMake, setCarMake] = useState([]);
	const [carCountryValue, setCarCountryValue] = useState([]);

	// ==========================================================
	// MEMOISED FILTER
	// ==========================================================
	const filteredResults = useMemo(() => {
		let regexSearch;
		try {
			regexSearch = new RegExp(`\\b${escapeRegex(search)}`, 'i');
		} catch {
			regexSearch = new RegExp(escapeRegex(search), 'i');
		}

		return bmCarData.filter(car => {
			const makeStr = Array.isArray(car.make) ? car.make.join(' ') : car.make;
			if (!(
				regexSearch.test(car.model) ||
				regexSearch.test(makeStr) ||
				regexSearch.test(`${makeStr} ${car.model}`) ||
				regexSearch.test(car.carID)
			)) return false;

			// Collection
			if (collection.length > 0) {
				if (!car.collection) return false;
				const carColls = Array.isArray(car.collection) ? car.collection : [car.collection];
				if (!collection.some(c => carColls.includes(c))) return false;
			}

			// Creator
			if (creator.length > 0 && !creator.includes(car.creator)) return false;

			// Active status
			if (activeFilter === 'active' && car.active !== true) return false;
			if (activeFilter === 'inactive' && car.active !== false) return false;

			// CR (from referenced car)
			if (Number(crRange[0]) !== bmBounds.minCr || Number(crRange[1]) !== bmBounds.maxCr) {
				const ref = refCarMap[car.reference];
				if (!ref?.cr || ref.cr < Number(crRange[0]) || ref.cr > Number(crRange[1])) return false;
			}

			// Make
			if (carMake.length > 0) {
				const makes = Array.isArray(car.make) ? car.make : [car.make];
				if (!carMake.some(m => makes.includes(m))) return false;
			}

			// Country
			if (carCountryValue.length > 0) {
				if (!carCountryValue.some(c => c.code === car.country)) return false;
			}

			return true;
		});
	}, [search, collection, creator, activeFilter, crRange, carMake, carCountryValue]);

	// ==========================================================
	// AUTO-RESET PAGE
	// ==========================================================
	useEffect(() => {
		setPage(1);
	}, [search, collection, creator, activeFilter, crRange, carMake, carCountryValue, numOfCars]);

	const totalPages = Math.max(1, Math.ceil(filteredResults.length / numOfCars));
	const safePage = Math.min(page, totalPages);

	// ==========================================================
	// RESET FILTERS
	// ==========================================================
	const hasActiveFilters = useMemo(() => {
		return search !== '' ||
			collection.length > 0 ||
			creator.length > 0 ||
			activeFilter !== 'all' ||
			Number(crRange[0]) !== bmBounds.minCr ||
			Number(crRange[1]) !== bmBounds.maxCr ||
			carMake.length > 0 ||
			carCountryValue.length > 0;
	}, [search, collection, creator, activeFilter, crRange, carMake, carCountryValue]);

	const resetFilters = useCallback(() => {
		setSearch('');
		setCollection([]);
		setCreator([]);
		setActiveFilter('all');
		setCrRange([bmBounds.minCr, bmBounds.maxCr]);
		setCarMake([]);
		setCarCountryValue([]);
		setSortType(1);
		setPage(1);
	}, []);

	// ==========================================================
	// RENDER
	// ==========================================================
	return (
		<>
			<Box sx={{ pt: 2, pb: 1 }}>
				<Typography
					variant='h4'
					sx={{
						fontWeight: 'bold',
						textAlign: 'center',
						mb: 0.5,
						fontFamily: 'Rubik-BoldItalic',
					}}>
					Black Market Car List
				</Typography>
			</Box>

			<BMCarFilter
				accentColor={accentColor}
				bounds={bmBounds}
				search={search} setSearch={setSearch}
				sortType={sortType} setSortType={setSortType}
				numOfCars={numOfCars} setNumOfCars={setNumOfCars}
				collection={collection} setCollection={setCollection}
				collectionOptions={bmStaticOptions.collections}
				creator={creator} setCreator={setCreator}
				creatorOptions={bmStaticOptions.creators}
				activeFilter={activeFilter} setActiveFilter={setActiveFilter}
				crRange={crRange} setCrRange={setCrRange}
				carMake={carMake} setCarMake={setCarMake}
				makeOptions={bmStaticOptions.makes}
				carCountryValue={carCountryValue} setCarCountryValue={setCarCountryValue}
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
					of {bmCarData.length} BM cars
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

			<BMCarCards
				accentColor={accentColor}
				filteredCars={filteredResults}
				page={safePage}
				numOfCars={numOfCars}
				sortType={sortType}
				allCarData={carData}
			/>

			<Stack sx={{ py: 2, pb: 4 }}>
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

export default BMCarList;
