import { useState } from 'react';
import { Pagination, Stack, Typography, Box } from '@mui/material';

// You'll need to create this file by running packsmerge.js
// and saving the output as packData.js in your data folder
import packData from '../data/packData.js';

import PackFilter from './PackFilter.jsx';
import PackCards from './PackCards.jsx';

// Get price range
const getPriceRange = () => {
	let min = Infinity;
	let max = 0;
	packData.forEach(pack => {
		if (pack.price !== undefined && pack.price > 0) {
			if (pack.price < min) min = pack.price;
			if (pack.price > max) max = pack.price;
		}
	});
	return [min === Infinity ? 0 : min, max];
};

// Get all unique pack filter values
const getPackFilterOptions = () => {
	const options = {
		make: new Set(),
		country: new Set(),
		tags: new Set(),
		driveType: new Set(),
		tyreType: new Set(),
		fuelType: new Set(),
		bodyStyle: new Set(),
		enginePos: new Set(),
		creator: new Set(),
	};

	packData.forEach(pack => {
		if (pack.filter) {
			Object.keys(options).forEach(key => {
				const value = pack.filter[key];
				if (value && value !== 'None' && typeof value === 'string') {
					options[key].add(value);
				}
			});
		}
	});

	// Convert sets to sorted arrays
	const result = {};
	Object.keys(options).forEach(key => {
		result[key] = Array.from(options[key]).sort();
	});
	return result;
};

const [minPrice, maxPrice] = getPriceRange();
const packFilterOptions = getPackFilterOptions();

const PackList = () => {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [numOfPacks, setNumOfPacks] = useState(12);
	const [packsSortType, setPacksSortType] = useState(1);
	const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
	const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'event', 'paid'
	const [hasGuaranteedRarity, setHasGuaranteedRarity] = useState('all');
	
	// Pack filter filters (filter packs by their internal filters)
	const [filterMake, setFilterMake] = useState([]);
	const [filterCountry, setFilterCountry] = useState([]);
	const [filterTags, setFilterTags] = useState([]);
	const [filterDriveType, setFilterDriveType] = useState([]);
	const [filterTyreType, setFilterTyreType] = useState([]);
	const [filterFuelType, setFilterFuelType] = useState([]);
	const [filterBodyStyle, setFilterBodyStyle] = useState([]);

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	// Check if pack has guaranteed rarity (any slot with 100% for a rarity)
	const hasGuaranteed = (pack, rarity) => {
		if (!pack.packSequence) return false;
		return pack.packSequence.some(slot => slot[rarity] === 100);
	};

	const filteredPacks = () => {
		const regexSearch = new RegExp(search, 'i');
		return packData.filter(pack => {
			const matchesSearch = regexSearch.test(pack.packName) || 
				(pack.description && regexSearch.test(pack.description));
			
			// Price filter logic
			let matchesPrice = true;
			if (priceFilter === 'event') {
				matchesPrice = pack.price === undefined || pack.price === 0;
			} else if (priceFilter === 'paid') {
				matchesPrice = pack.price !== undefined && pack.price > 0;
			}
			
			// Price range (only applies to paid packs)
			const matchesPriceRange = priceFilter !== 'paid' || 
				(pack.price >= priceRange[0] && pack.price <= priceRange[1]);

			// Guaranteed rarity filter
			let matchesGuaranteed = true;
			if (hasGuaranteedRarity !== 'all') {
				matchesGuaranteed = hasGuaranteed(pack, hasGuaranteedRarity);
			}

			// Pack filter filters
			const matchesFilterMake = filterMake.length === 0 || 
				(pack.filter?.make && filterMake.includes(pack.filter.make));
			
			const matchesFilterCountry = filterCountry.length === 0 || 
				(pack.filter?.country && filterCountry.includes(pack.filter.country));
			
			const matchesFilterTags = filterTags.length === 0 || 
				(pack.filter?.tags && filterTags.includes(pack.filter.tags));
			
			const matchesFilterDriveType = filterDriveType.length === 0 || 
				(pack.filter?.driveType && filterDriveType.includes(pack.filter.driveType));
			
			const matchesFilterTyreType = filterTyreType.length === 0 || 
				(pack.filter?.tyreType && filterTyreType.includes(pack.filter.tyreType));
			
			const matchesFilterFuelType = filterFuelType.length === 0 || 
				(pack.filter?.fuelType && filterFuelType.includes(pack.filter.fuelType));
			
			const matchesFilterBodyStyle = filterBodyStyle.length === 0 || 
				(pack.filter?.bodyStyle && filterBodyStyle.includes(pack.filter.bodyStyle));

			return matchesSearch && 
				matchesPrice && 
				matchesPriceRange && 
				matchesGuaranteed &&
				matchesFilterMake &&
				matchesFilterCountry &&
				matchesFilterTags &&
				matchesFilterDriveType &&
				matchesFilterTyreType &&
				matchesFilterFuelType &&
				matchesFilterBodyStyle;
		});
	};

	return (
		<>
			<Box sx={{ pt: 2, pb: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
					Pack List ({filteredPacks().length} packs)
				</Typography>
			</Box>

			<PackFilter
				search={search}
				setSearch={setSearch}
				packsSortType={packsSortType}
				setPacksSortType={setPacksSortType}
				numOfPacks={numOfPacks}
				setNumOfPacks={setNumOfPacks}
				priceRange={priceRange}
				setPriceRange={setPriceRange}
				minPrice={minPrice}
				maxPrice={maxPrice}
				priceFilter={priceFilter}
				setPriceFilter={setPriceFilter}
				hasGuaranteedRarity={hasGuaranteedRarity}
				setHasGuaranteedRarity={setHasGuaranteedRarity}
				setPage={setPage}
				// Pack filter options
				packFilterOptions={packFilterOptions}
				filterMake={filterMake}
				setFilterMake={setFilterMake}
				filterCountry={filterCountry}
				setFilterCountry={setFilterCountry}
				filterTags={filterTags}
				setFilterTags={setFilterTags}
				filterDriveType={filterDriveType}
				setFilterDriveType={setFilterDriveType}
				filterTyreType={filterTyreType}
				setFilterTyreType={setFilterTyreType}
				filterFuelType={filterFuelType}
				setFilterFuelType={setFilterFuelType}
				filterBodyStyle={filterBodyStyle}
				setFilterBodyStyle={setFilterBodyStyle}
			/>

			<PackCards
				filteredPacks={filteredPacks}
				page={page}
				numOfPacks={numOfPacks}
				packsSortType={packsSortType}
			/>

			<Stack sx={{ pb: 4 }}>
				<Pagination
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
					size="large"
					count={Math.ceil(filteredPacks().length / numOfPacks)}
					onChange={handlePageChange}
					page={page}
					variant="outlined"
					color="primary"
					shape="rounded"
				/>
			</Stack>
		</>
	);
};

export default PackList;