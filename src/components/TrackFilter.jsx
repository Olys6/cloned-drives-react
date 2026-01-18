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

const TrackFilter = ({
	search,
	setSearch,
	weather,
	setWeather,
	weatherOptions,
	surface,
	setSurface,
	surfaceOptions,
	tracksSortType,
	setTracksSortType,
	numOfTracks,
	setNumOfTracks,
	hasSpeedbumps,
	setHasSpeedbumps,
	hasHumps,
	setHasHumps,
	setPage,
}) => {
	// Helper to get chip color based on surface type
	const getSurfaceColor = (surfaceType) => {
		const colors = {
			'Asphalt': '#555555',
			'Dirt': '#8B4513',
			'Gravel': '#A0522D',
			'Sand': '#DEB887',
			'Snow': '#87CEEB',
			'Ice': '#ADD8E6',
			'Drag': '#333333',
			'Track': '#444444',
		};
		return colors[surfaceType] || '#666666';
	};

	const getWeatherColor = (weatherType) => {
		return weatherType === 'Sunny' ? '#FFD700' : '#4169E1';
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
					label="Search tracks..."
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
						value={tracksSortType}
						label="Sort by"
						onChange={(e) => setTracksSortType(e.target.value)}
					>
						<MenuItem value={1}>Name (A-Z)</MenuItem>
						<MenuItem value={2}>Name (Z-A)</MenuItem>
						<MenuItem value={3}>Surface (A-Z)</MenuItem>
						<MenuItem value={4}>Weather</MenuItem>
					</Select>
				</FormControl>

				<FormControl sx={{ minWidth: 150 }}>
					<InputLabel>Per page</InputLabel>
					<Select
						value={numOfTracks}
						label="Per page"
						onChange={(e) => {
							setNumOfTracks(e.target.value);
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

			{/* Row 2: Weather and Surface filters */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
					alignItems: 'center',
				}}
			>
				<Autocomplete
					multiple
					fullWidth
					value={weather}
					options={weatherOptions}
					onChange={(event, newValue) => {
						setWeather(newValue);
						setPage(1);
					}}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip
								{...getTagProps({ index })}
								key={option}
								label={option}
								sx={{ 
									backgroundColor: getWeatherColor(option),
									color: option === 'Sunny' ? '#000' : '#fff',
								}}
							/>
						))
					}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Weather"
							placeholder="Select weather..."
						/>
					)}
				/>

				<Autocomplete
					multiple
					fullWidth
					value={surface}
					options={surfaceOptions}
					onChange={(event, newValue) => {
						setSurface(newValue);
						setPage(1);
					}}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip
								{...getTagProps({ index })}
								key={option}
								label={option}
								sx={{ 
									backgroundColor: getSurfaceColor(option),
									color: '#fff',
								}}
							/>
						))
					}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Surface"
							placeholder="Select surface..."
						/>
					)}
				/>
			</Box>

			{/* Row 3: Speedbumps and Humps filters */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
					alignItems: 'center',
				}}
			>
				<FormControl fullWidth>
					<InputLabel>Speedbumps</InputLabel>
					<Select
						value={hasSpeedbumps}
						label="Speedbumps"
						onChange={(e) => {
							setHasSpeedbumps(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="yes">Has Speedbumps</MenuItem>
						<MenuItem value="no">No Speedbumps</MenuItem>
					</Select>
				</FormControl>

				<FormControl fullWidth>
					<InputLabel>Humps</InputLabel>
					<Select
						value={hasHumps}
						label="Humps"
						onChange={(e) => {
							setHasHumps(e.target.value);
							setPage(1);
						}}
					>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="yes">Has Humps</MenuItem>
						<MenuItem value="no">No Humps</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default TrackFilter;
