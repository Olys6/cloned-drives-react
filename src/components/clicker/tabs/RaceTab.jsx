import { useState, useMemo, useCallback } from 'react';
import {
	Box, Typography, Paper, Button, Chip, TextField, FormControl, InputLabel, Select, MenuItem,
	LinearProgress, Pagination, IconButton,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import InfoIcon from '@mui/icons-material/Info';

import { useGame } from '../context';
import { RACE_DIFFICULTIES, generateRandomRestriction } from '../constants/raceDifficulties';
import { getRarity, getTrackColor, RACE_CARS_PER_PAGE } from '../constants/gameConfig';
import { evaluateRace, getRaceAdvantages, generateOpponent } from '../utils/raceEngine';
import { findCarById, getCarName } from '../utils/carHelpers';
import { fmtNumber } from '../utils/formatters';
import { getThumbnailUrl } from '../../imageUtils';
import trackData from '../../../data/trackData.js';

const RaceTab = ({ onShowCarDetail, showSnackbar }) => {
	const game = useGame();
	
	// Race state
	const [racePhase, setRacePhase] = useState('select_difficulty');
	const [selectedDifficulty, setSelectedDifficulty] = useState(null);
	const [currentRaceTrack, setCurrentRaceTrack] = useState(null);
	const [currentRaceOpponent, setCurrentRaceOpponent] = useState(null);
	const [currentRaceRestriction, setCurrentRaceRestriction] = useState(null);
	const [selectedRaceCar, setSelectedRaceCar] = useState(null);
	const [raceResult, setRaceResult] = useState(null);
	
	// Car selection filters
	const [raceCarSearch, setRaceCarSearch] = useState('');
	const [raceCarFilter, setRaceCarFilter] = useState('all');
	const [raceCarDriveFilter, setRaceCarDriveFilter] = useState('all');
	const [raceCarBodyFilter, setRaceCarBodyFilter] = useState('all');
	const [raceCarCountryFilter, setRaceCarCountryFilter] = useState('all');
	const [raceCarTyreFilter, setRaceCarTyreFilter] = useState('all');
	const [raceCarPrizeFilter, setRaceCarPrizeFilter] = useState('all');
	const [raceCarSort, setRaceCarSort] = useState('cr-desc');
	const [raceCarPage, setRaceCarPage] = useState(1);
	
	// Get tracks for racing
	const raceTracks = useMemo(() => 
		trackData.filter(t => t.trackName && t.surface && t.weather && t.specsDistr),
		[]
	);
	
	// Eligible cars for current race
	const eligibleRaceCars = useMemo(() => {
		if (!selectedDifficulty) return [];
		
		const [minCR, maxCR] = selectedDifficulty.crRange;
		
		// Get unique cars from collection
		const uniqueCarIds = Object.keys(game.collection);
		let cars = uniqueCarIds.map(id => findCarById(id)).filter(Boolean);
		
		// Filter by CR range
		cars = cars.filter(car => car.cr >= minCR && car.cr <= maxCR);
		
		// Apply restriction if present
		if (currentRaceRestriction) {
			cars = cars.filter(currentRaceRestriction.type.getFilter(currentRaceRestriction.value));
		}
		
		// Apply user filters
		if (raceCarSearch) {
			const search = raceCarSearch.toLowerCase();
			cars = cars.filter(car => getCarName(car).toLowerCase().includes(search));
		}
		
		if (raceCarFilter !== 'all') {
			cars = cars.filter(car => getRarity(car.cr).key === raceCarFilter);
		}
		
		if (raceCarDriveFilter !== 'all') {
			cars = cars.filter(car => car.driveType === raceCarDriveFilter);
		}
		
		if (raceCarBodyFilter !== 'all') {
			cars = cars.filter(car => {
				if (Array.isArray(car.bodyStyle)) return car.bodyStyle.includes(raceCarBodyFilter);
				return car.bodyStyle === raceCarBodyFilter;
			});
		}
		
		if (raceCarCountryFilter !== 'all') {
			cars = cars.filter(car => car.country === raceCarCountryFilter);
		}
		
		if (raceCarTyreFilter !== 'all') {
			cars = cars.filter(car => car.tyreType === raceCarTyreFilter);
		}
		
		if (raceCarPrizeFilter === 'prize') {
			cars = cars.filter(car => car.isPrize);
		} else if (raceCarPrizeFilter === 'regular') {
			cars = cars.filter(car => !car.isPrize);
		}
		
		// Sort
		const [sortKey, sortDir] = raceCarSort.split('-');
		cars.sort((a, b) => {
			let aVal, bVal;
			switch (sortKey) {
				case 'cr': aVal = a.cr; bVal = b.cr; break;
				case 'speed': aVal = a.topSpeed; bVal = b.topSpeed; break;
				case 'accel': aVal = a["0to60"]; bVal = b["0to60"]; break;
				case 'handling': aVal = a.handling; bVal = b.handling; break;
				default: aVal = a.cr; bVal = b.cr;
			}
			return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
		});
		
		return cars;
	}, [selectedDifficulty, game.collection, currentRaceRestriction, raceCarSearch, raceCarFilter, 
		raceCarDriveFilter, raceCarBodyFilter, raceCarCountryFilter, raceCarTyreFilter, raceCarPrizeFilter, raceCarSort]);
	
	// Pagination
	const totalRaceCarPages = Math.ceil(eligibleRaceCars.length / RACE_CARS_PER_PAGE);
	const paginatedRaceCars = eligibleRaceCars.slice((raceCarPage - 1) * RACE_CARS_PER_PAGE, raceCarPage * RACE_CARS_PER_PAGE);
	
	// Initiate race
	const initiateRace = useCallback((difficulty) => {
		setSelectedDifficulty(difficulty);
		
		// Select random track
		const track = raceTracks[Math.floor(Math.random() * raceTracks.length)];
		setCurrentRaceTrack(track);
		
		// Generate restriction if needed
		let restriction = null;
		if (difficulty.restrictions === 'random') {
			restriction = generateRandomRestriction();
		}
		setCurrentRaceRestriction(restriction);
		
		// Generate opponent
		const opponent = generateOpponent(game.gameCars, difficulty.crRange);
		setCurrentRaceOpponent(opponent);
		
		// Reset selection
		setSelectedRaceCar(null);
		setRaceCarPage(1);
		setRacePhase('select_car');
	}, [raceTracks, game.gameCars]);
	
	// Execute race
	const executeRace = useCallback(() => {
		if (!selectedRaceCar || !currentRaceOpponent || !currentRaceTrack) return;
		
		const playerCar = findCarById(selectedRaceCar);
		if (!playerCar) return;
		
		setRacePhase('racing');
		
		// Simulate race delay
		setTimeout(() => {
			const score = evaluateRace(playerCar, currentRaceOpponent, currentRaceTrack);
			const won = score > 0;
			const advantages = getRaceAdvantages(playerCar, currentRaceOpponent, currentRaceTrack, won);
			
			// Calculate rewards
			let tokensEarned = 0;
			let tuneTokensEarned = 0;
			
			if (won) {
				tokensEarned = selectedDifficulty.tokenReward + game.tokenBoostLevel;
				tuneTokensEarned = selectedDifficulty.tuneTokenReward || 0;
			}
			
			// Update game state
			game.addRaceRewards(tokensEarned, tuneTokensEarned, won);
			
			setRaceResult({
				won,
				score,
				advantages,
				tokensEarned,
				tuneTokensEarned,
			});
			
			setRacePhase('results');
		}, 1500);
	}, [selectedRaceCar, currentRaceOpponent, currentRaceTrack, selectedDifficulty, game]);
	
	// Race again with same difficulty
	const raceAgain = useCallback(() => {
		if (selectedDifficulty) {
			initiateRace(selectedDifficulty);
		}
	}, [selectedDifficulty, initiateRace]);
	
	// Reset to difficulty selection
	const resetRaceToStart = useCallback(() => {
		setRacePhase('select_difficulty');
		setSelectedDifficulty(null);
		setCurrentRaceTrack(null);
		setCurrentRaceOpponent(null);
		setCurrentRaceRestriction(null);
		setSelectedRaceCar(null);
		setRaceResult(null);
	}, []);
	
	// Unlock difficulty
	const handleUnlockDifficulty = (diffId) => {
		const diff = RACE_DIFFICULTIES.find(d => d.id === diffId);
		if (diff && game.unlockDifficulty(diffId, diff.unlockCost)) {
			showSnackbar(`Unlocked ${diff.name}!`);
		} else {
			showSnackbar(`Need more tokens!`, 'error');
		}
	};
	
	return (
		<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)', minHeight: 500 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
				<Typography variant="h6"> Race Mode</Typography>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
					<Chip icon={<EmojiEventsIcon />} label={`${game.racesWon} Won`} sx={{ backgroundColor: '#4caf50', color: '#fff' }} />
					<Chip label={`${game.racesLost} Lost`} sx={{ backgroundColor: '#f44336', color: '#fff' }} />
					<Chip label={`${game.tokens} 🪙`} sx={{ backgroundColor: '#ffd700', color: '#000', fontWeight: 'bold' }} />
					{game.tuneTokens > 0 && (
						<Chip label={`${game.tuneTokens} â­`} sx={{ backgroundColor: '#9c27b0', color: '#fff', fontWeight: 'bold' }} />
					)}
				</Box>
			</Box>
			
			{/* Phase: Select Difficulty */}
			{racePhase === 'select_difficulty' && (
				<Box>
					<Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
						Select Difficulty & Press Race
					</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
						{RACE_DIFFICULTIES.map(diff => {
							const isUnlocked = game.unlockedDifficulties.includes(diff.id);
							const canAfford = game.tokens >= diff.unlockCost;
							
							return (
								<Paper 
									key={diff.id} 
									sx={{ 
										p: 2, 
										backgroundColor: isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
										border: `2px solid ${isUnlocked ? diff.color : '#555'}`,
										opacity: isUnlocked ? 1 : 0.8,
										position: 'relative',
									}}
								>
									{!isUnlocked && (
										<Box sx={{ position: 'absolute', top: 8, right: 8 }}>
											<Chip label="🪙 LOCKED" size="small" sx={{ backgroundColor: '#333', color: '#888' }} />
										</Box>
									)}
									
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
										<Typography variant="h5">{diff.icon}</Typography>
										<Box>
											<Typography variant="subtitle1" fontWeight="bold" sx={{ color: diff.color }}>
												{diff.name}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												CR Range: {diff.crRange[0]} - {diff.crRange[1] === 9999 ? 'âˆž' : diff.crRange[1]}
											</Typography>
										</Box>
									</Box>
									
									<Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 40 }}>
										{diff.description}
									</Typography>
									
									<Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
										<Chip 
											label={`+${diff.tokenReward} 🪙`} 
											size="small" 
											sx={{ backgroundColor: 'rgba(255,215,0,0.2)', color: '#ffd700' }} 
										/>
										{diff.tuneTokenReward && (
											<Chip 
												label={`+${diff.tuneTokenReward} â­ Tune Token`} 
												size="small" 
												sx={{ backgroundColor: 'rgba(156,39,176,0.2)', color: '#ce93d8' }} 
											/>
										)}
										{diff.restrictions === 'random' && (
											<Chip label="🏎️ Random Restrictions" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
										)}
									</Box>
									
									{isUnlocked ? (
										<Button
											variant="contained"
											fullWidth
											onClick={() => initiateRace(diff)}
											startIcon={<SportsScoreIcon />}
											sx={{ 
												backgroundColor: diff.color,
												'&:hover': { backgroundColor: diff.color, filter: 'brightness(1.2)' },
											}}
										>
											Race!
										</Button>
									) : (
										<Button
											variant="outlined"
											fullWidth
											onClick={() => handleUnlockDifficulty(diff.id)}
											disabled={!canAfford}
											sx={{ 
												borderColor: canAfford ? diff.color : '#555',
												color: canAfford ? diff.color : '#666',
											}}
										>
											Unlock ({diff.unlockCost})
										</Button>
									)}
								</Paper>
							);
						})}
					</Box>
				</Box>
			)}
			
			{/* Phase: Select Car */}
			{racePhase === 'select_car' && selectedDifficulty && (
				<Box>
					{/* Race Info Header */}
					<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255,255,255,0.05)', border: `2px solid ${selectedDifficulty.color}` }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
								{currentRaceTrack?.background && (
									<img 
										src={getThumbnailUrl(currentRaceTrack.background, 100, 70)} 
										alt={currentRaceTrack.trackName}
										style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4, border: `2px solid ${getTrackColor(currentRaceTrack?.surface)}` }}
									/>
								)}
								<Box>
									<Typography variant="h6" sx={{ color: selectedDifficulty.color }}>
										{selectedDifficulty.icon} {selectedDifficulty.name}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Track: <strong style={{ color: getTrackColor(currentRaceTrack?.surface) }}>{currentRaceTrack?.trackName}</strong> ({currentRaceTrack?.weather} {currentRaceTrack?.surface})
									</Typography>
									{currentRaceRestriction && (
										<Chip 
											label={`🏎️${currentRaceRestriction.type.display(currentRaceRestriction.value)}`}
											size="small"
											sx={{ mt: 1, backgroundColor: 'rgba(255,152,0,0.2)', color: '#ff9800' }}
										/>
									)}
								</Box>
							</Box>
							
							{/* Opponent Preview */}
							<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1, backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 1, border: '1px solid #f44336' }}>
								<img 
									src={getThumbnailUrl(currentRaceOpponent?.racehud, 80, 70)} 
									alt="" 
									style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }} 
									onClick={() => onShowCarDetail(currentRaceOpponent)}
								/>
								<Box>
									<Typography variant="caption" color="text.secondary">Opponent (click image for details)</Typography>
									<Typography variant="subtitle2" fontWeight="bold">{currentRaceOpponent && getCarName(currentRaceOpponent)}</Typography>
									<Chip label={`CR ${currentRaceOpponent?.cr}`} size="small" sx={{ backgroundColor: getRarity(currentRaceOpponent?.cr || 1).color, color: '#fff', fontSize: '0.6rem' }} />
								</Box>
							</Box>
						</Box>
						
						{/* Track Priorities */}
						{currentRaceTrack?.specsDistr && (
							<Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
								<Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 1, color: getTrackColor(currentRaceTrack?.surface) }}>
									Track Stat Priorities
								</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{Object.entries(currentRaceTrack.specsDistr)
										.filter(([key, value]) => value > 0)
										.sort((a, b) => b[1] - a[1])
										.map(([stat, value]) => {
											const statLabels = { topSpeed: 'Top Speed', '0to60': '0-60', handling: 'Handling', weight: 'Weight', mra: 'MRA', ola: 'OLA' };
											const statColors = { topSpeed: '#2196f3', '0to60': '#ff9800', handling: '#4caf50', weight: '#9c27b0', mra: '#e91e63', ola: '#00bcd4' };
											return (
												<Chip
													key={stat}
													label={`${statLabels[stat] || stat}: ${value}%`}
													size="small"
													sx={{ backgroundColor: `${statColors[stat] || '#666'}22`, color: statColors[stat] || '#fff', fontWeight: 'bold', fontSize: '0.7rem' }}
												/>
											);
										})}
								</Box>
							</Box>
						)}
					</Paper>
					
					{/* Car Selection Filters */}
					<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle1" gutterBottom fontWeight="bold">Select Your Car</Typography>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
							<TextField
								size="small"
								placeholder="Search cars..."
								value={raceCarSearch}
								onChange={e => { setRaceCarSearch(e.target.value); setRaceCarPage(1); }}
								sx={{ minWidth: 150 }}
							/>
							<FormControl size="small" sx={{ minWidth: 90 }}>
								<InputLabel>Rarity</InputLabel>
								<Select value={raceCarFilter} onChange={e => { setRaceCarFilter(e.target.value); setRaceCarPage(1); }} label="Rarity">
									<MenuItem value="all">All</MenuItem>
									<MenuItem value="standard">Standard</MenuItem>
									<MenuItem value="common">Common</MenuItem>
									<MenuItem value="uncommon">Uncommon</MenuItem>
									<MenuItem value="rare">Rare</MenuItem>
									<MenuItem value="epic">Epic</MenuItem>
									<MenuItem value="exotic">Exotic</MenuItem>
									<MenuItem value="legendary">Legendary</MenuItem>
									<MenuItem value="mystic">Mystic</MenuItem>
								</Select>
							</FormControl>
							<FormControl size="small" sx={{ minWidth: 80 }}>
								<InputLabel>Drive</InputLabel>
								<Select value={raceCarDriveFilter} onChange={e => { setRaceCarDriveFilter(e.target.value); setRaceCarPage(1); }} label="Drive">
									<MenuItem value="all">All</MenuItem>
									<MenuItem value="FWD">FWD</MenuItem>
									<MenuItem value="RWD">RWD</MenuItem>
									<MenuItem value="AWD">AWD</MenuItem>
									<MenuItem value="4WD">4WD</MenuItem>
								</Select>
							</FormControl>
							<FormControl size="small" sx={{ minWidth: 110 }}>
								<InputLabel>Sort</InputLabel>
								<Select value={raceCarSort} onChange={e => { setRaceCarSort(e.target.value); setRaceCarPage(1); }} label="Sort">
									<MenuItem value="cr-desc">CR â†“</MenuItem>
									<MenuItem value="cr-asc">CR â†‘</MenuItem>
									<MenuItem value="speed-desc">Speed â†“</MenuItem>
									<MenuItem value="speed-asc">Speed â†‘</MenuItem>
									<MenuItem value="accel-asc">0-60 (Fast)</MenuItem>
									<MenuItem value="accel-desc">0-60 (Slow)</MenuItem>
									<MenuItem value="handling-desc">Handling â†“</MenuItem>
									<MenuItem value="handling-asc">Handling â†‘</MenuItem>
								</Select>
							</FormControl>
						</Box>
						
						{eligibleRaceCars.length === 0 ? (
							<Box sx={{ textAlign: 'center', p: 3 }}>
								<Typography color="text.secondary">No eligible cars found for this race!</Typography>
								<Typography variant="caption" color="text.secondary">
									{currentRaceRestriction ? `Restriction: ${currentRaceRestriction.type.display(currentRaceRestriction.value)}` : ''}
									{' | '}CR Range: {selectedDifficulty.crRange[0]}-{selectedDifficulty.crRange[1]}
								</Typography>
							</Box>
						) : (
							<>
								<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
									{eligibleRaceCars.length} eligible car(s) found
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5, mb: 2 }}>
									{paginatedRaceCars.map(car => (
										<Paper 
											key={car.carID}
											onClick={() => setSelectedRaceCar(car.carID)}
											sx={{ 
												p: 1.5, 
												cursor: 'pointer',
												backgroundColor: selectedRaceCar === car.carID ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
												border: selectedRaceCar === car.carID ? '2px solid #4caf50' : '2px solid transparent',
												'&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
												position: 'relative',
											}}
										>
											<IconButton 
												size="small" 
												onClick={(e) => { e.stopPropagation(); onShowCarDetail(car); }} 
												sx={{ position: 'absolute', top: 4, right: 4, p: 0.3, backgroundColor: 'rgba(0,0,0,0.5)' }}
											>
												<InfoIcon sx={{ fontSize: 14, color: '#aaa' }} />
											</IconButton>
											<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
												<img src={getThumbnailUrl(car.racehud, 60, 70)} alt="" style={{ width: 60, height: 38, objectFit: 'cover', borderRadius: 2 }} />
												<Box sx={{ overflow: 'hidden' }}>
													<Typography variant="body2" fontWeight="bold" noWrap>{getCarName(car)}</Typography>
													<Chip label={`CR ${car.cr}`} size="small" sx={{ backgroundColor: getRarity(car.cr).color, color: '#fff', fontSize: '0.6rem', height: 18 }} />
												</Box>
											</Box>
											<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
												{car.topSpeed}mph | {car["0to60"]}s | {car.driveType}
											</Typography>
										</Paper>
									))}
								</Box>
								
								{totalRaceCarPages > 1 && (
									<Box sx={{ display: 'flex', justifyContent: 'center' }}>
										<Pagination count={totalRaceCarPages} page={raceCarPage} onChange={(e, p) => setRaceCarPage(p)} color="primary" size="small" />
									</Box>
								)}
							</>
						)}
					</Paper>
					
					{/* Action Buttons */}
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Button
							variant="contained"
							size="large"
							onClick={executeRace}
							disabled={!selectedRaceCar}
							startIcon={<SportsScoreIcon />}
							sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' }, '&.Mui-disabled': { backgroundColor: '#444', color: '#888' } }}
						>
							Start Race!
						</Button>
						<Button variant="outlined" color="error" onClick={resetRaceToStart}>
							Cancel
						</Button>
					</Box>
				</Box>
			)}
			
			{/* Phase: Racing */}
			{racePhase === 'racing' && (
				<Box sx={{ textAlign: 'center', py: 8 }}>
					<Typography variant="h4" sx={{ mb: 3 }}>🏎️ Racing...</Typography>
					<LinearProgress sx={{ maxWidth: 400, mx: 'auto', height: 8, borderRadius: 4 }} />
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Simulating race on {currentRaceTrack?.trackName}
					</Typography>
				</Box>
			)}
			
			{/* Phase: Results */}
			{racePhase === 'results' && raceResult && (
				<Box>
					<Paper sx={{ 
						p: 4, 
						textAlign: 'center',
						backgroundColor: raceResult.won ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
						border: `3px solid ${raceResult.won ? '#4caf50' : '#f44336'}`,
						borderRadius: 2,
						mb: 3,
					}}>
						<Typography variant="h3" sx={{ color: raceResult.won ? '#4caf50' : '#f44336', fontWeight: 'bold', mb: 2 }}>
							{raceResult.won ? 'VICTORY!' : 'DEFEAT'}
						</Typography>
						
						<Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
							{Math.abs(raceResult.score).toFixed(1)} points {raceResult.won ? 'ahead' : 'behind'}
						</Typography>
						
						<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
							{Array.isArray(raceResult.advantages) ? raceResult.advantages.join(", ") : raceResult.advantages}
						</Typography>
						
						{raceResult.won && (
							<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
								<Chip 
									label={`+${raceResult.tokensEarned} 🪙 Tokens`}
									sx={{ backgroundColor: '#ffd700', color: '#000', fontWeight: 'bold', fontSize: '1.1rem', py: 2.5 }}
								/>
								{raceResult.tuneTokensEarned > 0 && (
									<Chip 
										label={`+${raceResult.tuneTokensEarned} â­ Tune Token`}
										sx={{ backgroundColor: '#9c27b0', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', py: 2.5 }}
									/>
								)}
							</Box>
						)}
					</Paper>
					
					{/* Race Summary */}
					<Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" gutterBottom>Race Summary</Typography>
						<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							<Box>
								<Typography variant="caption" color="text.secondary">Track</Typography>
								<Typography>{currentRaceTrack?.trackName}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">Conditions</Typography>
								<Typography>{currentRaceTrack?.weather} {currentRaceTrack?.surface}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="text.secondary">Difficulty</Typography>
								<Typography sx={{ color: selectedDifficulty?.color }}>{selectedDifficulty?.name}</Typography>
							</Box>
							{currentRaceRestriction && (
								<Box>
									<Typography variant="caption" color="text.secondary">Restriction</Typography>
									<Typography>{currentRaceRestriction.type.display(currentRaceRestriction.value)}</Typography>
								</Box>
							)}
						</Box>
					</Paper>
					
					{/* Action Buttons */}
					<Box sx={{ display: 'flex', gap: 2 }}>
						<Button
							variant="contained"
							size="large"
							onClick={raceAgain}
							startIcon={<SportsScoreIcon />}
							sx={{ backgroundColor: selectedDifficulty?.color }}
						>
							Race Again ({selectedDifficulty?.name})
						</Button>
						<Button variant="outlined" onClick={resetRaceToStart}>
							Choose Different Difficulty
						</Button>
					</Box>
				</Box>
			)}
		</Paper>
	);
};

export default RaceTab;
