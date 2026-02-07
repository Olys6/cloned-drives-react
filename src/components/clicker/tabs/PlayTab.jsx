import { useState } from 'react';
import {
	Box, Typography, Button, Paper, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
	useMediaQuery,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import TimerIcon from '@mui/icons-material/Timer';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RemoveIcon from '@mui/icons-material/Remove';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BoltIcon from '@mui/icons-material/Bolt';

import { useGame } from '../context';
import { StatBox } from '../components';
import GarageCarCard from '../components/GarageCarCard';
import { fmtMoney } from '../utils/formatters';
import { findCarById } from '../utils/carHelpers';

const PlayTab = ({ onShowCarDetail, showSnackbar }) => {
	const game = useGame();
	const isDesktop = useMediaQuery('(min-width:900px)');
	
	const handleClaimStarter = () => {
		const cars = game.claimStarterPack();
		if (cars) {
			showSnackbar(`\uD83C\uDF81 Claimed ${cars.length} starter cars!`);
		}
	};

	// Calculate total click multiplier from all sources
	const totalMultiplier = (1 + (game.setBonuses?.brand?.bonus || 0) + (game.setBonuses?.tyreType?.bonus * 0.5 || 0) + (game.garageStats?.enhancementBonus || 0)) * (game.challengeMet && game.activeChallengeData ? game.activeChallengeData.multiplier : 1);

	// Build active bonuses list
	const activeBonuses = [];
	if (game.setBonuses?.brand?.bonus > 0) {
		activeBonuses.push({ label: `${game.setBonuses.brand.name} (${game.setBonuses.brand.count})`, value: `+${Math.round(game.setBonuses.brand.bonus * 100)}% Earnings`, color: '#ff9800' });
	}
	if (game.setBonuses?.country?.bonus > 0) {
		activeBonuses.push({ label: `${game.setBonuses.country.name} (${game.setBonuses.country.count})`, value: `+${Math.round(game.setBonuses.country.bonus * 100)}% Luck`, color: '#2196f3' });
	}
	if (game.setBonuses?.driveType?.bonus > 0) {
		activeBonuses.push({ label: `${game.setBonuses.driveType.name} (${game.setBonuses.driveType.count})`, value: `-${(game.setBonuses.driveType.bonus * 0.5).toFixed(1)}s Cooldown`, color: '#00bcd4' });
	}
	if (game.setBonuses?.tyreType?.bonus > 0) {
		activeBonuses.push({ label: `${game.setBonuses.tyreType.name} (${game.setBonuses.tyreType.count})`, value: `+${Math.round(game.setBonuses.tyreType.bonus * 50)}% Earnings`, color: '#4caf50' });
	}
	if (game.setBonuses?.bodyStyle?.bonus > 0) {
		activeBonuses.push({ label: `${game.setBonuses.bodyStyle.name} (${game.setBonuses.bodyStyle.count})`, value: `+${Math.round(game.setBonuses.bodyStyle.bonus * 100)}% Passive`, color: '#9c27b0' });
	}
	if (game.garageStats?.enhancementBonus > 0) {
		activeBonuses.push({ label: 'Enhanced Cars', value: `+${Math.round(game.garageStats.enhancementBonus * 100)}% Earnings`, color: '#ffd700', icon: '\u2B50' });
	}
	if (game.activeChallengeData) {
		activeBonuses.push({ 
			label: game.activeChallengeData.name, 
			value: game.challengeMet ? `${game.activeChallengeData.multiplier}x Active!` : 'Not Met', 
			color: game.challengeMet ? game.activeChallengeData.color : '#666',
			icon: '\uD83C\uDFC6',
		});
	}

	// Bonuses content (reused in both layouts)
	const BonusesContent = () => (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
			{activeBonuses.length === 0 ? (
				<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
					No active bonuses. Add 3+ matching cars to your garage!
				</Typography>
			) : (
				activeBonuses.map((bonus, i) => (
					<Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.25 }}>
						<Typography sx={{ fontSize: '0.8rem', color: '#ccc' }}>
							{bonus.icon && `${bonus.icon} `}{bonus.label}
						</Typography>
						<Typography sx={{ fontSize: '0.8rem', color: bonus.color, fontWeight: 'bold' }}>
							{bonus.value}
						</Typography>
					</Box>
				))
			)}
		</Box>
	);
	
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			{/* Starter Pack */}
			{!game.hasClaimedStarter && (
				<Paper sx={{ p: 1.5, backgroundColor: 'rgba(76, 175, 80, 0.2)', border: '2px solid #4caf50' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
						<Box>
							<Typography variant="h6" sx={{ color: '#4caf50', fontSize: '1rem' }}>{'\uD83C\uDF81'} Welcome Gift!</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Claim your free starter pack with 5 cars!</Typography>
						</Box>
						<Button variant="contained" color="success" size="small" startIcon={<CardGiftcardIcon />} onClick={handleClaimStarter}>
							Claim Free Pack
						</Button>
					</Box>
				</Paper>
			)}
			
			{/* Main Play Area: 3-column on desktop, stacked on mobile */}
			<Paper sx={{ p: { xs: 1, sm: 1.5 }, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				{isDesktop ? (
					// Desktop: 3-column layout
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 3, alignItems: 'center' }}>
						{/* Left: Core Stats */}
						<Box>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Garage Stats</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<LocalAtmIcon sx={{ color: '#4caf50', fontSize: 20 }} />
									<Typography sx={{ fontSize: '0.85rem', color: '#aaa', minWidth: 80 }}>Per Click</Typography>
									<Typography sx={{ fontSize: '0.95rem', color: '#4caf50', fontWeight: 'bold' }}>{fmtMoney(game.currentEarnings || 0)}</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<TimerIcon sx={{ color: '#00bcd4', fontSize: 20 }} />
									<Typography sx={{ fontSize: '0.85rem', color: '#aaa', minWidth: 80 }}>Cooldown</Typography>
									<Typography sx={{ fontSize: '0.95rem', color: '#00bcd4', fontWeight: 'bold' }}>{game.cooldownSeconds?.toFixed(1) || 5}s</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<BoltIcon sx={{ color: '#ff9800', fontSize: 20 }} />
									<Typography sx={{ fontSize: '0.85rem', color: '#aaa', minWidth: 80 }}>Multiplier</Typography>
									<Typography sx={{ fontSize: '0.95rem', color: '#ff9800', fontWeight: 'bold' }}>{totalMultiplier.toFixed(2)}x</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<CasinoIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
									<Typography sx={{ fontSize: '0.85rem', color: '#aaa', minWidth: 80 }}>Pack Luck</Typography>
									<Typography sx={{ fontSize: '0.95rem', color: '#9c27b0', fontWeight: 'bold' }}>+{game.garageStats?.luck?.toFixed(0) || 0}%</Typography>
								</Box>
							</Box>
						</Box>
						
						{/* Center: Collect Button */}
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 280 }}>
							<Button
								variant="contained"
								size="large"
								onClick={game.handleCollect}
								disabled={!game.canCollect}
								sx={{ 
									py: 2, 
									px: 6,
									fontSize: '1.25rem', 
									minWidth: 260,
									bgcolor: game.canCollect ? '#4caf50' : '#555',
									color: '#fff',
									fontWeight: 'bold',
									border: '3px solid',
									borderColor: game.canCollect ? '#66bb6a' : '#666',
									boxShadow: game.canCollect ? '0 0 20px rgba(76, 175, 80, 0.4)' : 'none',
									'&:hover': { bgcolor: game.canCollect ? '#45a049' : '#555' },
									'&.Mui-disabled': { bgcolor: '#444', color: '#888', borderColor: '#555' },
								}}
							>
								{game.canCollect 
									? `COLLECT ${fmtMoney(game.currentEarnings || 0)}` 
									: `${((game.timeLeft || 0) / 1000).toFixed(1)}s`
								}
							</Button>
							<LinearProgress 
								variant="determinate" 
								value={game.cooldownProgress || 0} 
								sx={{ mt: 1, height: 8, borderRadius: 4, width: '100%', maxWidth: 260 }} 
							/>
							{game.challengeMet && game.activeChallengeData && (
								<Typography variant="caption" sx={{ mt: 0.5, color: game.activeChallengeData.color }}>
									{'\uD83C\uDFC6'} {game.activeChallengeData.multiplier}x multiplier active!
								</Typography>
							)}
						</Box>
						
						{/* Right: Active Bonuses */}
						<Box>
							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Active Bonuses</Typography>
							<BonusesContent />
						</Box>
					</Box>
				) : (
					// Mobile: Stacked layout with dropdown for bonuses
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{/* Stats Row */}
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							<StatBox icon={<LocalAtmIcon sx={{ color: '#4caf50' }} />} label="Per Click" value={fmtMoney(game.currentEarnings || 0)} color="#4caf50" small />
							<StatBox icon={<TimerIcon sx={{ color: '#00bcd4' }} />} label="Cooldown" value={`${game.cooldownSeconds?.toFixed(1) || 5}s`} color="#00bcd4" small />
							<StatBox icon={<BoltIcon sx={{ color: '#ff9800' }} />} label="Multiplier" value={`${totalMultiplier.toFixed(1)}x`} color="#ff9800" small />
							<StatBox icon={<CasinoIcon sx={{ color: '#9c27b0' }} />} label="Pack Luck" value={`+${game.garageStats?.luck?.toFixed(0) || 0}%`} color="#9c27b0" small />
						</Box>
						
						{/* Collect Button */}
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
							<Button
								variant="contained"
								size="large"
								onClick={game.handleCollect}
								disabled={!game.canCollect}
								fullWidth
								sx={{ 
									py: 1.5, 
									fontSize: '1.1rem', 
									maxWidth: 400,
									bgcolor: game.canCollect ? '#4caf50' : '#555',
									color: '#fff',
									fontWeight: 'bold',
									border: '2px solid',
									borderColor: game.canCollect ? '#66bb6a' : '#666',
									'&:hover': { bgcolor: game.canCollect ? '#45a049' : '#555' },
									'&.Mui-disabled': { bgcolor: '#444', color: '#888', borderColor: '#555' },
								}}
							>
								{game.canCollect 
									? `COLLECT ${fmtMoney(game.currentEarnings || 0)}` 
									: `${((game.timeLeft || 0) / 1000).toFixed(1)}s`
								}
							</Button>
							<LinearProgress 
								variant="determinate" 
								value={game.cooldownProgress || 0} 
								sx={{ mt: 0.75, height: 6, borderRadius: 3, width: '100%', maxWidth: 400 }} 
							/>
						</Box>
						
						{/* Bonuses Dropdown */}
						{activeBonuses.length > 0 && (
							<Accordion 
								sx={{ 
									bgcolor: 'rgba(255,255,255,0.05)', 
									'&:before': { display: 'none' },
									borderRadius: '8px !important',
								}}
								defaultExpanded={false}
							>
								<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
									<Typography sx={{ fontSize: '0.85rem' }}>
										Active Bonuses ({activeBonuses.length})
									</Typography>
								</AccordionSummary>
								<AccordionDetails sx={{ pt: 0 }}>
									<BonusesContent />
								</AccordionDetails>
							</Accordion>
						)}
						
						{/* Hint for new players */}
						{game.garage?.length >= 1 && game.garage?.length < 3 && activeBonuses.length === 0 && (
							<Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.7rem' }}>
								{'\uD83D\uDCA1'} Add 3+ matching cars for set bonuses!
							</Typography>
						)}
					</Box>
				)}
			</Paper>
			
			{/* Garage Display */}
			<Paper sx={{ p: { xs: 1, sm: 1.5 }, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
					<Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
						Garage ({game.garage?.length || 0}/{game.maxGarageSlots || 5})
					</Typography>
					{game.garage?.length > 0 && (
						<Button 
							variant="outlined" 
							color="warning" 
							size="small" 
							onClick={game.unequipAll}
							startIcon={<RemoveIcon sx={{ fontSize: '1rem !important' }} />}
							sx={{ fontSize: '0.7rem', py: 0.25 }}
						>
							Unequip All
						</Button>
					)}
				</Box>
				{!game.garage?.length ? (
					<Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: '0.85rem' }}>
						Add cars from Collection to boost stats!
					</Typography>
				) : (
					<Box sx={{ 
						display: 'grid', 
						gridTemplateColumns: {
							xs: 'repeat(auto-fill, minmax(160px, 1fr))',
							sm: 'repeat(auto-fill, minmax(180px, 1fr))',
							md: 'repeat(auto-fill, minmax(200px, 1fr))',
							lg: 'repeat(auto-fill, minmax(220px, 1fr))',
						},
						gap: 1.5,
					}}>
						{game.garage.map(carId => {
							const car = findCarById(carId);
							if (!car) return null;
							const stars = game.carEnhancements?.[carId] || 0;
							// Calculate this car's contribution to per-click earnings
							// Base: CR * 0.5, then enhancement bonus
							const baseContribution = car.cr * 0.5;
							const enhancementMult = 1 + (stars * 0.05);
							const perClickContribution = baseContribution * enhancementMult;
							
							return (
								<GarageCarCard
									key={carId}
									car={car}
									stars={stars}
									onRemove={() => game.removeCarFromGarage(carId)}
									onInfo={() => onShowCarDetail(car)}
									perClickContribution={perClickContribution}
								/>
							);
						})}
					</Box>
				)}
			</Paper>
		</Box>
	);
};

export default PlayTab;
