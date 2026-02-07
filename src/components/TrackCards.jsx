import React, { useState } from 'react';
import {
	Box,
	Button,
	Modal,
	Typography,
	Chip,
	LinearProgress,
} from '@mui/material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Image optimization utilities
import { getThumbnailUrl, getMediumUrl, getPlaceholderUrl } from './imageUtils';

// Icons for stats
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import TuneIcon from '@mui/icons-material/Tune';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const TrackCards = ({
	filteredTracks,
	page,
	numOfTracks,
	tracksSortType,
}) => {
	const [modalTrack, setModalTrack] = useState(null);
	const [open, setOpen] = useState(false);

	const handleOpen = (track) => {
		setModalTrack(track);
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

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
			'TT OffRoad': '#654321',
			'TT OnRoad': '#333333',
		};
		return colors[surfaceType] || '#666666';
	};

	const getWeatherColor = (weatherType) => {
		return weatherType === 'Sunny' ? '#FFD700' : '#4169E1';
	};

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 600, xs: '90%' },
		bgcolor: 'background.paper',
		border: '2px solid #fff',
		boxShadow: 24,
		p: 3,
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflow: 'auto',
	};

	// Stat bar component
	const StatBar = ({ label, value, icon: Icon, color }) => (
		<Box sx={{ mb: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Icon sx={{ fontSize: 18, color: color }} />
					<Typography variant="body2">{label}</Typography>
				</Box>
				<Typography variant="body2" fontWeight="bold">{value}%</Typography>
			</Box>
			<LinearProgress 
				variant="determinate" 
				value={value} 
				sx={{ 
					height: 8, 
					borderRadius: 4,
					backgroundColor: 'rgba(255,255,255,0.1)',
					'& .MuiLinearProgress-bar': {
						backgroundColor: color,
						borderRadius: 4,
					}
				}} 
			/>
		</Box>
	);

	const sortedTracks = () => {
		return filteredTracks().sort((a, b) => {
			switch (tracksSortType) {
				case 1: // Name A-Z
					return a.trackName.localeCompare(b.trackName);
				case 2: // Name Z-A
					return b.trackName.localeCompare(a.trackName);
				case 3: // Surface A-Z
					return a.surface.localeCompare(b.surface);
				case 4: // Weather
					return a.weather.localeCompare(b.weather);
				default:
					return 0;
			}
		});
	};

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '1rem',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				{sortedTracks().map((track, i) =>
					i >= numOfTracks * page - numOfTracks &&
					i < numOfTracks * page && (
						<Button
							key={i}
							onClick={() => handleOpen(track)}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								padding: 0,
								borderRadius: 2,
								overflow: 'hidden',
								backgroundColor: 'rgba(0,0,0,0.3)',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.5)',
									transform: 'scale(1.02)',
								},
								transition: 'all 0.2s ease',
							}}
						>
							<Box sx={{ position: 'relative', width: '280px' }}>
								<LazyLoadImage
									threshold={200}
									effect="blur"
									src={getThumbnailUrl(track.background, 280, 70)}
									placeholderSrc={getPlaceholderUrl(track.background)}
									style={{
										width: '280px',
										height: '158px',
										objectFit: 'cover',
									}}
								/>
								{/* Weather & Surface chips overlay */}
								<Box
									sx={{
										position: 'absolute',
										top: 8,
										left: 8,
										display: 'flex',
										gap: 0.5,
									}}
								>
									<Chip
										label={track.weather}
										size="small"
										sx={{
											backgroundColor: getWeatherColor(track.weather),
											color: track.weather === 'Sunny' ? '#000' : '#fff',
											fontWeight: 'bold',
											fontSize: '0.7rem',
										}}
									/>
									<Chip
										label={track.surface}
										size="small"
										sx={{
											backgroundColor: getSurfaceColor(track.surface),
											color: '#fff',
											fontWeight: 'bold',
											fontSize: '0.7rem',
										}}
									/>
								</Box>
								{/* Speedbumps/Humps indicators */}
								{(track.speedbumps > 0 || track.humps > 0) && (
									<Box
										sx={{
											position: 'absolute',
											top: 8,
											right: 8,
											display: 'flex',
											gap: 0.5,
										}}
									>
										{track.speedbumps > 0 && (
											<Chip
												label={`SB: ${track.speedbumps}`}
												size="small"
												sx={{
													backgroundColor: '#ff5722',
													color: '#fff',
													fontWeight: 'bold',
													fontSize: '0.65rem',
												}}
											/>
										)}
										{track.humps > 0 && (
											<Chip
												label={`H: ${track.humps}`}
												size="small"
												sx={{
													backgroundColor: '#9c27b0',
													color: '#fff',
													fontWeight: 'bold',
													fontSize: '0.65rem',
												}}
											/>
										)}
									</Box>
								)}
							</Box>
							<Typography
								sx={{
									padding: '8px',
									fontWeight: 'bold',
									fontSize: '0.85rem',
									color: '#fff',
									textAlign: 'center',
									width: '100%',
								}}
							>
								{track.trackName}
							</Typography>
						</Button>
					)
				)}
			</Box>

			{/* Track Detail Modal */}
			{modalTrack && (
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="track-modal-title"
				>
					<Box sx={modalStyle}>
						{/* Track Image */}
						<Box sx={{ position: 'relative' }}>
							<LazyLoadImage
								src={getMediumUrl(modalTrack.background, 600, 85)}
								style={{ width: '100%', borderRadius: '8px' }}
							/>
							{/* Map thumbnail overlay if exists */}
							{modalTrack.map && (
								<Box
									sx={{
										position: 'absolute',
										bottom: 10,
										right: 10,
										border: '2px solid white',
										borderRadius: 1,
										overflow: 'hidden',
									}}
								>
									<LazyLoadImage
										src={getThumbnailUrl(modalTrack.map, 80, 70)}
										style={{ width: '80px', height: '80px', objectFit: 'cover' }}
									/>
								</Box>
							)}
						</Box>

						{/* Track Name */}
						<Typography variant="h5" fontWeight="bold" textAlign="center">
							{modalTrack.trackName}
						</Typography>

						{/* Weather & Surface Tags */}
						<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
							<Chip
								label={modalTrack.weather}
								sx={{
									backgroundColor: getWeatherColor(modalTrack.weather),
									color: modalTrack.weather === 'Sunny' ? '#000' : '#fff',
									fontWeight: 'bold',
								}}
							/>
							<Chip
								label={modalTrack.surface}
								sx={{
									backgroundColor: getSurfaceColor(modalTrack.surface),
									color: '#fff',
									fontWeight: 'bold',
								}}
							/>
							{modalTrack.speedbumps > 0 && (
								<Chip
									label={`Speedbumps: ${modalTrack.speedbumps}`}
									sx={{ backgroundColor: '#ff5722', color: '#fff' }}
								/>
							)}
							{modalTrack.humps > 0 && (
								<Chip
									label={`Humps: ${modalTrack.humps}`}
									sx={{ backgroundColor: '#9c27b0', color: '#fff' }}
								/>
							)}
						</Box>

						{/* Stats Distribution */}
						<Box sx={{ mt: 1 }}>
							<Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
								Stats Distribution
							</Typography>
							
							{modalTrack.specsDistr?.topSpeed > 0 && (
								<StatBar 
									label="Top Speed" 
									value={modalTrack.specsDistr.topSpeed} 
									icon={SpeedIcon}
									color="#4CAF50"
								/>
							)}
							{modalTrack.specsDistr?.['0to60'] > 0 && (
								<StatBar 
									label="0-60" 
									value={modalTrack.specsDistr['0to60']} 
									icon={TimerIcon}
									color="#2196F3"
								/>
							)}
							{modalTrack.specsDistr?.handling > 0 && (
								<StatBar 
									label="Handling" 
									value={modalTrack.specsDistr.handling} 
									icon={TuneIcon}
									color="#FF9800"
								/>
							)}
							{modalTrack.specsDistr?.weight > 0 && (
								<StatBar 
									label="Weight" 
									value={modalTrack.specsDistr.weight} 
									icon={FitnessCenterIcon}
									color="#9C27B0"
								/>
							)}
							{modalTrack.specsDistr?.mra > 0 && (
								<StatBar 
									label="MRA" 
									value={modalTrack.specsDistr.mra} 
									icon={TrendingUpIcon}
									color="#00BCD4"
								/>
							)}
							{modalTrack.specsDistr?.ola > 0 && (
								<StatBar 
									label="OLA" 
									value={modalTrack.specsDistr.ola} 
									icon={RocketLaunchIcon}
									color="#E91E63"
								/>
							)}

							{/* Show message if no stats */}
							{!modalTrack.specsDistr?.topSpeed && 
							 !modalTrack.specsDistr?.['0to60'] && 
							 !modalTrack.specsDistr?.handling && 
							 !modalTrack.specsDistr?.weight && 
							 !modalTrack.specsDistr?.mra && 
							 !modalTrack.specsDistr?.ola && (
								<Typography color="text.secondary" textAlign="center">
									No stat distribution data available
								</Typography>
							)}
						</Box>
					</Box>
				</Modal>
			)}
		</>
	);
};

export default TrackCards;
