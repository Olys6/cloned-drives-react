import React from 'react';
import {
	TextField,
	Select,
	MenuItem,
	Box,
	FormControl,
	InputLabel,
	Autocomplete,
	Chip,
} from '@mui/material';

const BMCarFilter = ({
	search,
	setSearch,
	sortType,
	setSortType,
	numOfCars,
	setNumOfCars,
	collection,
	setCollection,
	collectionOptions,
	creator,
	setCreator,
	creatorOptions,
	activeFilter,
	setActiveFilter,
	setPage,
}) => {
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
			{/* Row 1: Search, Sort, Per Page */}
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
					label="Search BM cars..."
					variant="outlined"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
					placeholder="Search by name, make, or car ID"
				/>

				<FormControl sx={{ minWidth: 200 }}>
					<InputLabel>Sort by</InputLabel>
					<Select
						value={sortType}
						label="Sort by"
						onChange={(e) => setSortType(e.target.value)}
					>
						<MenuItem value={1}>Name (A-Z)</MenuItem>
						<MenuItem value={2}>Name (Z-A)</MenuItem>
						<MenuItem value={3}>Collection (A-Z)</MenuItem>
						<MenuItem value={4}>Car ID</MenuItem>
					</Select>
				</FormControl>

				<FormControl sx={{ minWidth: 150 }}>
					<InputLabel>Per page</InputLabel>
					<Select
						value={numOfCars}
						label="Per page"
						onChange={(e) => {
							setNumOfCars(e.target.value);
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

			{/* Row 2: Collection, Creator, Active filter */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
					alignItems: 'center',
				}}
			>
				{collectionOptions.length > 0 && (
					<Autocomplete
						multiple
						fullWidth
						limitTags={2}
						value={collection}
						options={collectionOptions}
						onChange={(event, newValue) => {
							setCollection(newValue);
							setPage(1);
						}}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									{...getTagProps({ index })}
									key={option}
									label={option}
									sx={{ 
										backgroundColor: '#9c27b0',
										color: '#fff',
									}}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Collection"
								placeholder="Filter by collection..."
							/>
						)}
					/>
				)}

				{creatorOptions.length > 0 && (
					<Autocomplete
						multiple
						fullWidth
						limitTags={2}
						value={creator}
						options={creatorOptions}
						onChange={(event, newValue) => {
							setCreator(newValue);
							setPage(1);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Creator"
								placeholder="Filter by creator..."
							/>
						)}
					/>
				)}

				<FormControl sx={{ minWidth: 180 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={activeFilter}
						label="Status"
						onChange={(e) => {
							setActiveFilter(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="all">All Cars</MenuItem>
						<MenuItem value="active">Active Only</MenuItem>
						<MenuItem value="inactive">Inactive Only</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default BMCarFilter;
