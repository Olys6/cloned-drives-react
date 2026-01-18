import React, { useState } from 'react';
import {
	TextField,
	Select,
	MenuItem,
	Box,
	FormControl,
	InputLabel,
	Slider,
	Typography,
	Autocomplete,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PackFilter = ({
	search,
	setSearch,
	packsSortType,
	setPacksSortType,
	numOfPacks,
	setNumOfPacks,
	priceRange,
	setPriceRange,
	minPrice,
	maxPrice,
	priceFilter,
	setPriceFilter,
	hasGuaranteedRarity,
	setHasGuaranteedRarity,
	setPage,
	// Pack filter options
	packFilterOptions,
	filterMake,
	setFilterMake,
	filterCountry,
	setFilterCountry,
	filterTags,
	setFilterTags,
	filterDriveType,
	setFilterDriveType,
	filterTyreType,
	setFilterTyreType,
	filterFuelType,
	setFilterFuelType,
	filterBodyStyle,
	setFilterBodyStyle,
}) => {
	const [expanded, setExpanded] = useState(false);

	const handlePriceChange = (event, newValue) => {
		setPriceRange(newValue);
		setPage(1);
	};

	const formatPrice = (value) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		} else if (value >= 1000) {
			return `${(value / 1000).toFixed(0)}K`;
		}
		return value.toString();
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				padding: '20px',
				backgroundColor: 'rgba(0,0,0,0.5)',
				borderRadius: 2,
				margin: '0 20px 20px 20px',
			}}
		>
			{/* Row 1: Search and Sort */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
					alignItems: 'center',
				}}
			>
				<TextField
					fullWidth
					label="Search packs..."
					variant="outlined"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
				/>

				<FormControl sx={{ minWidth: 200 }}>
					<InputLabel>Sort by</InputLabel>
					<Select
						value={packsSortType}
						label="Sort by"
						onChange={(e) => setPacksSortType(e.target.value)}
					>
						<MenuItem value={1}>Name (A-Z)</MenuItem>
						<MenuItem value={2}>Name (Z-A)</MenuItem>
						<MenuItem value={3}>Price (Low to High)</MenuItem>
						<MenuItem value={4}>Price (High to Low)</MenuItem>
						<MenuItem value={5}>Cards per Pack</MenuItem>
					</Select>
				</FormControl>

				<FormControl sx={{ minWidth: 150 }}>
					<InputLabel>Per page</InputLabel>
					<Select
						value={numOfPacks}
						label="Per page"
						onChange={(e) => {
							setNumOfPacks(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value={6}>6</MenuItem>
						<MenuItem value={12}>12</MenuItem>
						<MenuItem value={24}>24</MenuItem>
						<MenuItem value={48}>48</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Row 2: Price filter and Guaranteed rarity */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
					alignItems: 'center',
				}}
			>
				{/* Price type filter */}
				<FormControl sx={{ minWidth: 180 }}>
					<InputLabel>Pack Type</InputLabel>
					<Select
						value={priceFilter}
						label="Pack Type"
						onChange={(e) => {
							setPriceFilter(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="all">All Packs</MenuItem>
						<MenuItem value="event">Event/Daily Only</MenuItem>
						<MenuItem value="paid">Paid Only</MenuItem>
					</Select>
				</FormControl>

				{/* Price Range Slider - only show when "Paid Only" is selected */}
				{priceFilter === 'paid' && (
					<Box sx={{ width: '100%', px: 2 }}>
						<Typography gutterBottom>
							Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
						</Typography>
						<Slider
							value={priceRange}
							onChange={handlePriceChange}
							valueLabelDisplay="auto"
							valueLabelFormat={formatPrice}
							min={minPrice}
							max={maxPrice}
							sx={{
								'& .MuiSlider-thumb': {
									backgroundColor: '#4caf50',
								},
								'& .MuiSlider-track': {
									backgroundColor: '#4caf50',
								},
							}}
						/>
					</Box>
				)}

				{/* Guaranteed rarity filter */}
				<FormControl sx={{ minWidth: 220 }}>
					<InputLabel>Guaranteed Rarity</InputLabel>
					<Select
						value={hasGuaranteedRarity}
						label="Guaranteed Rarity"
						onChange={(e) => {
							setHasGuaranteedRarity(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="all">All Packs</MenuItem>
						<MenuItem value="mystic">🟣 Guaranteed Mystic</MenuItem>
						<MenuItem value="legendary">🟡 Guaranteed Legendary</MenuItem>
						<MenuItem value="exotic">🟠 Guaranteed Exotic</MenuItem>
						<MenuItem value="epic">🟣 Guaranteed Epic</MenuItem>
						<MenuItem value="rare">🔵 Guaranteed Rare</MenuItem>
						<MenuItem value="uncommon">🟢 Guaranteed Uncommon</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* Collapsible: Pack Content Filters */}
			<Accordion 
				expanded={expanded} 
				onChange={() => setExpanded(!expanded)}
				sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography fontWeight="bold">
						Pack Content Filters
					</Typography>
					<Typography sx={{ ml: 2, color: 'text.secondary' }}>
						(Filter by what cars the pack contains)
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					{/* Row: Make and Country */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
							mb: 2,
						}}
					>
						{packFilterOptions.make?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterMake}
								options={packFilterOptions.make}
								onChange={(event, newValue) => {
									setFilterMake(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Make"
										placeholder="e.g. Aston Martin"
									/>
								)}
							/>
						)}

						{packFilterOptions.country?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterCountry}
								options={packFilterOptions.country}
								onChange={(event, newValue) => {
									setFilterCountry(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Country"
										placeholder="e.g. GB, DE, JP"
									/>
								)}
							/>
						)}
					</Box>

					{/* Row: Tags and Body Style */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
							mb: 2,
						}}
					>
						{packFilterOptions.tags?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterTags}
								options={packFilterOptions.tags}
								onChange={(event, newValue) => {
									setFilterTags(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Tags"
										placeholder="e.g. Rally, Track Day"
									/>
								)}
							/>
						)}

						{packFilterOptions.bodyStyle?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterBodyStyle}
								options={packFilterOptions.bodyStyle}
								onChange={(event, newValue) => {
									setFilterBodyStyle(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Body Style"
										placeholder="e.g. SUV, Convertible"
									/>
								)}
							/>
						)}
					</Box>

					{/* Row: Drive Type, Tyre Type, Fuel Type */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}
					>
						{packFilterOptions.driveType?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterDriveType}
								options={packFilterOptions.driveType}
								onChange={(event, newValue) => {
									setFilterDriveType(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Drive Type"
										placeholder="e.g. AWD, RWD"
									/>
								)}
							/>
						)}

						{packFilterOptions.tyreType?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterTyreType}
								options={packFilterOptions.tyreType}
								onChange={(event, newValue) => {
									setFilterTyreType(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Tyre Type"
										placeholder="e.g. Performance, Off-Road"
									/>
								)}
							/>
						)}

						{packFilterOptions.fuelType?.length > 0 && (
							<Autocomplete
								multiple
								fullWidth
								limitTags={2}
								value={filterFuelType}
								options={packFilterOptions.fuelType}
								onChange={(event, newValue) => {
									setFilterFuelType(newValue);
									setPage(1);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Fuel Type"
										placeholder="e.g. Petrol, Electric"
									/>
								)}
							/>
						)}
					</Box>
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};

export default PackFilter;
