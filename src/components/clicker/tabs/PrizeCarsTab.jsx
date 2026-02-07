import { useState, useMemo } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Chip,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Pagination,
	Stack,
	IconButton,
	Tooltip,
} from '@mui/material';

// Icons
import InfoIcon from '@mui/icons-material/Info';

// Context
import { useGame } from '../context';

// Utils
import { getThumbnailUrl } from '../../imageUtils';
import { fmtNumber } from '../utils/formatters';
import { getCarName } from '../utils/carHelpers';
import { getRarity, getPrizeCarTokenCost, getPrizeBonusById, PRIZE_CARS_PER_PAGE } from '../constants/gameConfig';

const PrizeCarsTab = ({ onShowCarDetail, showSnackbar }) => {
	const game = useGame();
	
	// Filter state
	const [prizeCarFilter, setPrizeCarFilter] = useState('all');
	const [prizeCarSearch, setPrizeCarSearch] = useState('');
	const [prizeCarSort, setPrizeCarSort] = useState('cr-desc');
	const [prizeCarPage, setPrizeCarPage] = useState(1);
	
	// Derived - available prize cars
	const availablePrizeCars = game.prizeCars;
	
	// Filtered prize cars
	const filteredPrizeCars = useMemo(() => {
		let result = [...availablePrizeCars];
		
		// Filter by search
		if (prizeCarSearch.trim()) {
			const search = prizeCarSearch.toLowerCase();
			result = result.filter(car => getCarName(car).toLowerCase().includes(search));
		}
		
		// Filter by rarity
		if (prizeCarFilter !== 'all') {
			const rarity = getRarity(0);
			result = result.filter(car => {
				const carRarity = getRarity(car.cr);
				return carRarity.key === prizeCarFilter;
			});
		}
		
		// Sort
		result.sort((a, b) => {
			switch (prizeCarSort) {
				case 'cr-desc': return b.cr - a.cr;
				case 'cr-asc': return a.cr - b.cr;
				case 'cost-asc': return getPrizeCarTokenCost(a) - getPrizeCarTokenCost(b);
				case 'cost-desc': return getPrizeCarTokenCost(b) - getPrizeCarTokenCost(a);
				case 'name-asc': return getCarName(a).localeCompare(getCarName(b));
				case 'name-desc': return getCarName(b).localeCompare(getCarName(a));
				default: return 0;
			}
		});
		
		return result;
	}, [availablePrizeCars, prizeCarFilter, prizeCarSearch, prizeCarSort]);
	
	// Pagination
	const totalPrizePages = Math.ceil(filteredPrizeCars.length / PRIZE_CARS_PER_PAGE);
	const paginatedPrizeCars = filteredPrizeCars.slice(
		(prizeCarPage - 1) * PRIZE_CARS_PER_PAGE,
		prizeCarPage * PRIZE_CARS_PER_PAGE
	);
	
	const handleBuyPrizeCar = (carId) => {
		const car = game.findCarById(carId);
		if (!car) return;
		
		const cost = getPrizeCarTokenCost(car);
		const result = game.buyPrizeCar(carId, cost);
		
		if (result) {
			if (typeof result === 'object' && result.name) {
				showSnackbar(`Purchased ${getCarName(car)} with bonus: ${result.icon} ${result.name}!`);
			} else {
				showSnackbar(`Purchased ${getCarName(car)}!`);
			}
		} else {
			showSnackbar('Not enough tokens!', 'error');
		}
	};
	
	return (
		<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)', minHeight: 500 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
				<Typography variant="h6">🏆 Prize Cars ({filteredPrizeCars.length})</Typography>
				<Chip 
					label={`🪙 ${game.tokens} Tokens`}
					sx={{ backgroundColor: '#ffd700', color: '#000', fontWeight: 'bold' }}
				/>
			</Box>
			
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Purchase unique prize cars with tokens earned from races! Each prize car gets a random bonus when first purchased.
			</Typography>
			
			{/* Filters */}
			<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
				<TextField
					size="small"
					placeholder="Search..."
					value={prizeCarSearch}
					onChange={e => { setPrizeCarSearch(e.target.value); setPrizeCarPage(1); }}
					sx={{ minWidth: 120 }}
				/>
				<FormControl size="small" sx={{ minWidth: 100 }}>
					<InputLabel>Rarity</InputLabel>
					<Select value={prizeCarFilter} onChange={e => { setPrizeCarFilter(e.target.value); setPrizeCarPage(1); }} label="Rarity">
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="standard">Standard</MenuItem>
						<MenuItem value="common">Common</MenuItem>
						<MenuItem value="uncommon">Uncommon</MenuItem>
						<MenuItem value="rare">Rare</MenuItem>
						<MenuItem value="epic">Epic</MenuItem>
						<MenuItem value="exotic">Exotic</MenuItem>
						<MenuItem value="legendary">Legendary</MenuItem>
					</Select>
				</FormControl>
				<FormControl size="small" sx={{ minWidth: 120 }}>
					<InputLabel>Sort</InputLabel>
					<Select value={prizeCarSort} onChange={e => { setPrizeCarSort(e.target.value); setPrizeCarPage(1); }} label="Sort">
						<MenuItem value="cr-desc">CR (High → Low)</MenuItem>
						<MenuItem value="cr-asc">CR (Low → High)</MenuItem>
						<MenuItem value="cost-asc">Cost (Low → High)</MenuItem>
						<MenuItem value="cost-desc">Cost (High → Low)</MenuItem>
						<MenuItem value="name-asc">Name (A → Z)</MenuItem>
						<MenuItem value="name-desc">Name (Z → A)</MenuItem>
					</Select>
				</FormControl>
			</Box>
			
			{filteredPrizeCars.length === 0 ? (
				<Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
					No prize cars found.
				</Typography>
			) : (
				<>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1.5 }}>
						{paginatedPrizeCars.map((car, idx) => {
							const rarity = getRarity(car.cr);
							const cost = getPrizeCarTokenCost(car);
							const canAfford = game.tokens >= cost;
							const owned = game.getCarCount(car.carID);
							const bonus = game.prizeCarBonuses[car.carID] 
								? getPrizeBonusById(game.prizeCarBonuses[car.carID])
								: null;
							
							return (
								<Paper 
									key={car.carID && car.carID !== 0 ? car.carID : `prize-${idx}`}
									sx={{ 
										p: 1.5, 
										backgroundColor: owned > 0 ? '#3d2914' : 'rgba(30, 30, 30, 0.95)',
										border: `2px solid ${owned > 0 ? '#ffd700' : rarity.color}`,
										borderRadius: 2,
										opacity: canAfford ? 1 : 0.6,
									}}
								>
									<Box sx={{ position: 'relative' }}>
										<img 
											src={getThumbnailUrl(car.racehud, 150, 70)} 
											alt="" 
											style={{ 
												width: '100%', 
												height: 80, 
												objectFit: 'cover', 
												borderRadius: 4,
												cursor: 'pointer',
											}}
											loading="lazy"
											onClick={() => onShowCarDetail(car)}
										/>
										{owned > 0 && (
											<Chip 
												label={`Owned ×${owned}`}
												size="small"
												sx={{ 
													position: 'absolute', 
													top: 4, 
													right: 4, 
													backgroundColor: '#ffd700', 
													color: '#000',
													fontSize: '0.6rem',
												}}
											/>
										)}
									</Box>
									
									<Typography variant="body2" fontWeight="bold" noWrap sx={{ mt: 1 }} title={getCarName(car)}>
										{getCarName(car)}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
										<Chip 
											label={rarity.name}
											size="small"
											sx={{ backgroundColor: rarity.color, color: '#fff', fontSize: '0.55rem', height: 16 }}
										/>
										<Typography variant="caption" sx={{ color: '#aaa' }}>CR {car.cr}</Typography>
									</Box>
									
									{/* Bonus display */}
									{bonus && (
										<Tooltip title={bonus.description}>
											<Chip 
												label={`${bonus.icon} ${bonus.name}`}
												size="small"
												sx={{ 
													mb: 1, 
													backgroundColor: 'rgba(156, 39, 176, 0.3)', 
													color: '#ce93d8',
													fontSize: '0.6rem',
													height: 20,
													width: '100%',
												}}
											/>
										</Tooltip>
									)}
									{!bonus && owned === 0 && (
										<Chip 
											label="🎲 Random Bonus"
											size="small"
											sx={{ 
												mb: 1, 
												backgroundColor: 'rgba(255, 152, 0, 0.2)', 
												color: '#ffb74d',
												fontSize: '0.6rem',
												height: 20,
												width: '100%',
											}}
										/>
									)}
									
									<Box sx={{ display: 'flex', gap: 0.5 }}>
										<Button 
											size="small" 
											variant="contained" 
											color={canAfford ? "warning" : "inherit"}
											onClick={() => handleBuyPrizeCar(car.carID)}
											disabled={!canAfford}
											fullWidth
											sx={{ 
												fontSize: '0.7rem',
												'&.Mui-disabled': { backgroundColor: '#333', color: '#666' },
											}}
										>
											🪙 {fmtNumber(cost)}
										</Button>
										<IconButton 
											size="small" 
											onClick={() => onShowCarDetail(car)}
											sx={{ p: 0.5, color: '#aaa' }}
										>
											<InfoIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Box>
								</Paper>
							);
						})}
					</Box>
					
					{totalPrizePages > 1 && (
						<Stack sx={{ mt: 2 }}>
							<Pagination count={totalPrizePages} page={prizeCarPage} onChange={(e, v) => setPrizeCarPage(v)} sx={{ display: 'flex', justifyContent: 'center' }} />
						</Stack>
					)}
				</>
			)}
		</Paper>
	);
};

export default PrizeCarsTab;
