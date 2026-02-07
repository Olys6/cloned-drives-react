import { useState, useMemo, useCallback, memo } from 'react';
import { Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, Pagination, Stack } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import SellIcon from '@mui/icons-material/Sell';

import { useGame } from '../context';
import CollectionCarCard from '../components/CollectionCarCard';
import { getRarity, CARS_PER_PAGE, getEnhancementBonus, ENHANCEMENT_COSTS } from '../constants/gameConfig';
import { findCarById, getCarName } from '../utils/carHelpers';
import { fmtMoney } from '../utils/formatters';

// Memoized filter dropdown
const FilterSelect = memo(({ label, value, onChange, children, minWidth = 90 }) => (
	<FormControl size="small" sx={{ minWidth }}>
		<InputLabel sx={{ color: '#aaa', '&.Mui-focused': { color: '#fff' } }}>{label}</InputLabel>
		<Select 
			value={value} 
			onChange={onChange} 
			label={label}
			sx={{ 
				color: '#fff',
				'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
				'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
				'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
			}}
		>
			{children}
		</Select>
	</FormControl>
));

const CollectionTab = ({ onShowCarDetail, showSnackbar }) => {
	const game = useGame();
	
	// Filter state
	const [search, setSearch] = useState('');
	const [rarity, setRarity] = useState('all');
	const [make, setMake] = useState('all');
	const [country, setCountry] = useState('all');
	const [drive, setDrive] = useState('all');
	const [tyre, setTyre] = useState('all');
	const [body, setBody] = useState('all');
	const [enhanced, setEnhanced] = useState('all');
	const [prizeFilter, setPrizeFilter] = useState('all');
	const [sort, setSort] = useState('cr-desc');
	const [page, setPage] = useState(1);
	const [showSell, setShowSell] = useState(false);
	
	// Build collection list - only when collection changes
	const collectionList = useMemo(() => {
		const list = [];
		for (const carId in game.collection) {
			const car = findCarById(carId);
			if (car) list.push({ car, count: game.collection[carId], id: carId });
		}
		return list;
	}, [game.collection]);
	
	// Extract unique filter options
	const filterOptions = useMemo(() => {
		const makes = new Set(), countries = new Set(), drives = new Set(), tyres = new Set(), bodies = new Set();
		for (const { car } of collectionList) {
			const m = Array.isArray(car.make) ? car.make[0] : car.make;
			if (m) makes.add(m);
			if (car.country) countries.add(car.country);
			if (car.driveType) drives.add(car.driveType);
			if (car.tyreType) tyres.add(car.tyreType);
			if (car.bodyStyle) {
				(Array.isArray(car.bodyStyle) ? car.bodyStyle : [car.bodyStyle]).forEach(b => bodies.add(b));
			}
		}
		return {
			makes: [...makes].sort(),
			countries: [...countries].sort(),
			drives: [...drives].sort(),
			tyres: [...tyres].sort(),
			bodies: [...bodies].sort(),
		};
	}, [collectionList]);
	
	// Filter and sort
	const filtered = useMemo(() => {
		let result = collectionList;
		
		if (search) {
			const s = search.toLowerCase();
			result = result.filter(({ car }) => getCarName(car).toLowerCase().includes(s) || car.tags?.some(t => t.toLowerCase().includes(s)));
		}
		if (rarity !== 'all') result = result.filter(({ car }) => getRarity(car.cr).key === rarity);
		if (make !== 'all') result = result.filter(({ car }) => (Array.isArray(car.make) ? car.make : [car.make]).includes(make));
		if (country !== 'all') result = result.filter(({ car }) => car.country === country);
		if (drive !== 'all') result = result.filter(({ car }) => car.driveType === drive);
		if (tyre !== 'all') result = result.filter(({ car }) => car.tyreType === tyre);
		if (body !== 'all') result = result.filter(({ car }) => (Array.isArray(car.bodyStyle) ? car.bodyStyle : [car.bodyStyle]).includes(body));
		if (enhanced === 'enhanced') result = result.filter(({ car }) => (game.carEnhancements[car.carID] || 0) > 0);
		else if (enhanced === 'unenhanced') result = result.filter(({ car }) => (game.carEnhancements[car.carID] || 0) === 0);
		if (prizeFilter === 'prize') result = result.filter(({ car }) => car.isPrize);
		else if (prizeFilter === 'regular') result = result.filter(({ car }) => !car.isPrize);
		
		// Sort
		const [key, dir] = sort.split('-');
		result = [...result].sort((a, b) => {
			let av, bv;
			switch (key) {
				case 'cr': av = a.car.cr; bv = b.car.cr; break;
				case 'name': av = getCarName(a.car); bv = getCarName(b.car); break;
				case 'speed': av = a.car.topSpeed; bv = b.car.topSpeed; break;
				case 'accel': av = a.car['0to60']; bv = b.car['0to60']; break;
				case 'handling': av = a.car.handling; bv = b.car.handling; break;
				case 'count': av = a.count; bv = b.count; break;
				default: av = a.car.cr; bv = b.car.cr;
			}
			if (typeof av === 'string') return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
			return dir === 'asc' ? av - bv : bv - av;
		});
		
		return result;
	}, [collectionList, search, rarity, make, country, drive, tyre, body, enhanced, prizeFilter, sort, game.carEnhancements]);
	
	// Pagination
	const totalPages = Math.ceil(filtered.length / CARS_PER_PAGE);
	const paginated = useMemo(() => filtered.slice((page - 1) * CARS_PER_PAGE, page * CARS_PER_PAGE), [filtered, page]);
	
	// Handlers
	const resetPage = useCallback(() => setPage(1), []);
	const handleSearch = useCallback((e) => { setSearch(e.target.value); resetPage(); }, [resetPage]);
	const handleSellAll = useCallback(() => {
		const { totalSold, totalValue } = game.sellAllDuplicates();
		if (totalSold > 0) showSnackbar(`Sold ${totalSold} dupes for ${fmtMoney(totalValue)}!`);
	}, [game, showSnackbar]);
	
	const handleSellCar = useCallback((carId) => {
		const value = game.sellCar(carId);
		if (value) showSnackbar(`Sold for ${fmtMoney(value)}!`);
	}, [game, showSnackbar]);
	
	const handleEnhance = useCallback((carId) => {
		if (game.enhanceCar(carId)) {
			showSnackbar('Enhanced car!');
		} else {
			showSnackbar('Cannot enhance - need more duplicates or tune tokens!', 'error');
		}
	}, [game, showSnackbar]);
	
	// Calculate per-click value
	const getPerClick = useCallback((car, stars) => Math.floor(car.cr * 0.5 * (1 + getEnhancementBonus(stars))), []);
	
	// Get enhance info for a car
	const getEnhanceInfo = useCallback((stars, count, maxStars) => {
		if (stars >= maxStars) return stars >= 10 ? '💎 MAX' : 'MAX';
		const nextCost = ENHANCEMENT_COSTS[stars + 1];
		if (!nextCost) return 'MAX';
		return `${nextCost.dupes}🚗 + ${nextCost.tuneTokens}🪙${nextCost.requiresAdvanced ? ' 💎' : ''}`;
	}, []);
	
	// Check if car can be enhanced
	const canEnhanceCar = useCallback((stars, count, maxStars) => {
		if (stars >= maxStars) return false;
		const nextCost = ENHANCEMENT_COSTS[stars + 1];
		if (!nextCost) return false;
		if (count < nextCost.dupes + 1) return false; // +1 because we keep the original
		if (game.tuneTokens < nextCost.tuneTokens) return false;
		if (nextCost.requiresAdvanced && !game.hasAdvancedEnhancement) return false;
		return true;
	}, [game.tuneTokens, game.hasAdvancedEnhancement]);
	
	const dupeCount = game.totalCarCount - game.uniqueCarCount - game.uniquePrizeCarCount;
	
	return (
		<Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.4)', minHeight: 500 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'center' }}>
				<Typography variant="h6" sx={{ fontSize: '1rem' }}>Collection</Typography>
				<Chip label={`${game.totalCarCount} total`} size="small" sx={{ bgcolor: '#2196f3', color: '#fff', height: 22 }} />
				<Chip label={`${game.uniqueCarCount + game.uniquePrizeCarCount} unique`} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', height: 22 }} />
				<Box sx={{ flex: 1 }} />
				{game.garage.length > 0 && (
					<Button variant="outlined" size="small" onClick={game.unequipAll} startIcon={<RemoveIcon />} sx={{ fontSize: '0.7rem' }}>
						Unequip ({game.garage.length})
					</Button>
				)}
				<Button variant={showSell ? 'contained' : 'outlined'} color={showSell ? 'error' : 'inherit'} size="small" onClick={() => setShowSell(!showSell)} startIcon={<SellIcon />} sx={{ fontSize: '0.7rem' }}>
					{showSell ? 'Hide Sell' : 'Sell Mode'}
				</Button>
				{showSell && dupeCount > 0 && (
					<Button variant="contained" color="warning" size="small" onClick={handleSellAll} startIcon={<SellIcon />} sx={{ fontSize: '0.7rem' }}>
						Sell Dupes ({dupeCount})
					</Button>
				)}
			</Box>
			
			{/* Glassmorphism Filter Box */}
			<Box sx={{ 
				p: 1.5, 
				mb: 1.5, 
				borderRadius: 2,
				background: 'rgba(255, 255, 255, 0.06)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
			}}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
					<TextField 
						size="small" 
						placeholder="Search..." 
						value={search} 
						onChange={handleSearch}
						sx={{ 
							minWidth: 120,
							'& .MuiOutlinedInput-root': {
								color: '#fff',
								'& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
								'&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
							},
						}} 
					/>
					
					<FilterSelect label="Rarity" value={rarity} onChange={e => { setRarity(e.target.value); resetPage(); }}>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="standard">Standard</MenuItem>
						<MenuItem value="common">Common</MenuItem>
						<MenuItem value="uncommon">Uncommon</MenuItem>
						<MenuItem value="rare">Rare</MenuItem>
						<MenuItem value="epic">Epic</MenuItem>
						<MenuItem value="exotic">Exotic</MenuItem>
						<MenuItem value="legendary">Legendary</MenuItem>
						<MenuItem value="mystic">Mystic</MenuItem>
					</FilterSelect>
					
					<FilterSelect label="Make" value={make} onChange={e => { setMake(e.target.value); resetPage(); }}>
						<MenuItem value="all">All</MenuItem>
						{filterOptions.makes.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
					</FilterSelect>
					
					<FilterSelect label="Country" value={country} onChange={e => { setCountry(e.target.value); resetPage(); }}>
						<MenuItem value="all">All</MenuItem>
						{filterOptions.countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
					</FilterSelect>
					
					<FilterSelect label="Drive" value={drive} onChange={e => { setDrive(e.target.value); resetPage(); }} minWidth={70}>
						<MenuItem value="all">All</MenuItem>
						{filterOptions.drives.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
					</FilterSelect>
					
					<FilterSelect label="Tyres" value={tyre} onChange={e => { setTyre(e.target.value); resetPage(); }} minWidth={80}>
						<MenuItem value="all">All</MenuItem>
						{filterOptions.tyres.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
					</FilterSelect>
					
					<FilterSelect label="Body" value={body} onChange={e => { setBody(e.target.value); resetPage(); }} minWidth={80}>
						<MenuItem value="all">All</MenuItem>
						{filterOptions.bodies.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
					</FilterSelect>
					
					<FilterSelect label="Enhanced" value={enhanced} onChange={e => { setEnhanced(e.target.value); resetPage(); }} minWidth={95}>
						<MenuItem value="all">All</MenuItem>
						<MenuItem value="enhanced">Enhanced</MenuItem>
						<MenuItem value="unenhanced">No Stars</MenuItem>
					</FilterSelect>
					
					<FilterSelect label="Type" value={prizeFilter} onChange={e => { setPrizeFilter(e.target.value); resetPage(); }} minWidth={85}>
						<MenuItem value="all">All Cars</MenuItem>
						<MenuItem value="prize">Prize</MenuItem>
						<MenuItem value="regular">Regular</MenuItem>
					</FilterSelect>
					
					<FilterSelect label="Sort" value={sort} onChange={e => { setSort(e.target.value); resetPage(); }} minWidth={120}>
						<MenuItem value="cr-desc">CR High-Low</MenuItem>
						<MenuItem value="cr-asc">CR Low-High</MenuItem>
						<MenuItem value="name-asc">Name A-Z</MenuItem>
						<MenuItem value="name-desc">Name Z-A</MenuItem>
						<MenuItem value="speed-desc">Speed High</MenuItem>
						<MenuItem value="accel-asc">0-60 Fast</MenuItem>
						<MenuItem value="handling-desc">Handling High</MenuItem>
						<MenuItem value="count-desc">Dupes High</MenuItem>
					</FilterSelect>
				</Box>
				<Typography sx={{ mt: 1, fontSize: '0.7rem', color: '#888' }}>
					Showing {filtered.length} of {collectionList.length} cars
				</Typography>
			</Box>
			
			{/* Cards Grid */}
			{filtered.length === 0 ? (
				<Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
					{game.totalCarCount === 0 ? 'Open packs to get cars!' : 'No cars match filters.'}
				</Typography>
			) : (
				<>
					<Box sx={{ 
						display: 'grid', 
						gridTemplateColumns: {
							xs: 'repeat(auto-fill, minmax(160px, 1fr))',
							sm: 'repeat(auto-fill, minmax(190px, 1fr))',
							md: 'repeat(auto-fill, minmax(210px, 1fr))',
							lg: 'repeat(auto-fill, minmax(230px, 1fr))',
						},
						gap: 2 
					}}>
						{paginated.map(({ car, count }, idx) => {
							const stars = game.carEnhancements[car.carID] || 0;
							const maxStars = game.hasAdvancedEnhancement ? 10 : 5;
							return (
								<CollectionCarCard
									key={car.carID && car.carID !== 0 ? car.carID : `coll-${idx}`}
									car={car}
									stars={stars}
									onInfo={() => onShowCarDetail(car)}
									onAdd={() => game.addCarToGarage(car.carID)}
									addDisabled={game.garage.length >= game.maxGarageSlots || game.garage.includes(car.carID)}
									inGarage={game.garage.includes(car.carID)}
									dupeCount={count}
									perClickValue={getPerClick(car, stars)}
									showPerClick={true}
									isLocked={game.lockedCars.has(car.carID)}
									showSell={showSell}
									onSell={() => handleSellCar(car.carID)}
									onToggleLock={() => game.toggleCarLock(car.carID)}
									showEnhance={count > 1 || stars > 0}
									onEnhance={() => handleEnhance(car.carID)}
									canEnhance={canEnhanceCar(stars, count, maxStars)}
									enhanceInfo={getEnhanceInfo(stars, count, maxStars)}
								/>
							);
						})}
					</Box>
					
					{totalPages > 1 && (
						<Stack sx={{ mt: 2 }}>
							<Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} sx={{ display: 'flex', justifyContent: 'center' }} />
						</Stack>
					)}
				</>
			)}
		</Paper>
	);
};

export default CollectionTab;
