import { useState, useMemo } from 'react';
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Autocomplete,
	Paper,
	Chip,
	Modal,
	Slider,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Pagination,
	Stack,
} from '@mui/material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Data imports
import packData from '../data/packData.js';
import carData from '../data/data.js';

// Icons
import CasinoIcon from '@mui/icons-material/Casino';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// CR ranges for rarity
const rarityRanges = {
	standard: { min: 1, max: 99 },
	common: { min: 100, max: 249 },
	uncommon: { min: 250, max: 399 },
	rare: { min: 400, max: 549 },
	epic: { min: 550, max: 699 },
	exotic: { min: 700, max: 849 },
	legendary: { min: 850, max: 999 },
	mystic: { min: 1000, max: 99999 },
};

// Rarity colors
const rarityColors = {
	standard: '#bebebe',
	common: '#424242',
	uncommon: '#32CD32',
	rare: '#41c9e1',
	epic: '#e00000',
	exotic: '#8400ff',
	legendary: '#ffe600',
	mystic: '#ff00dd',
};

const rarityLabels = {
	standard: 'Standard',
	common: 'Common',
	uncommon: 'Uncommon',
	rare: 'Rare',
	epic: 'Epic',
	exotic: 'Exotic',
	legendary: 'Legendary',
	mystic: 'Mystic',
};

// Filter cars based on pack filter criteria
const filterCars = (cars, filter) => {
	if (!filter) return cars;

	return cars.filter(car => {
		if (car.reference || car.isPrize === true) return false;

		let passed = true;

		for (let criteria in filter) {
			if (filter[criteria] !== 'None' && filter[criteria] !== null) {
				switch (criteria) {
					case 'make':
					case 'tags':
					case 'creator':
					case 'bodyStyle':
					case 'hiddenTag':
						if (Array.isArray(car[criteria])) {
							if (!car[criteria].some(m => 
								m && m.toLowerCase() === filter[criteria].toLowerCase()
							)) {
								passed = false;
							}
						} else if (car[criteria] && 
							car[criteria].toLowerCase() !== filter[criteria].toLowerCase()) {
							passed = false;
						} else if (!car[criteria]) {
							passed = false;
						}
						break;
					case 'modelYear':
					case 'seatCount':
						if (typeof filter[criteria] === 'object' && 
							filter[criteria].start !== undefined && 
							filter[criteria].end !== undefined) {
							if (!car[criteria] ||
								car[criteria] < filter[criteria].start ||
								car[criteria] > filter[criteria].end) {
								passed = false;
							}
						}
						break;
					default:
						if (car[criteria] && typeof car[criteria] === 'string' &&
							filter[criteria] && typeof filter[criteria] === 'string' &&
							car[criteria].toLowerCase() !== filter[criteria].toLowerCase()) {
							passed = false;
						}
						break;
				}
			}
		}
		return passed;
	});
};

// Group cars by rarity based on CR
const groupCarsByRarity = (cars) => {
	const groups = {
		standard: [],
		common: [],
		uncommon: [],
		rare: [],
		epic: [],
		exotic: [],
		legendary: [],
		mystic: [],
	};

	cars.forEach(car => {
		const cr = car.cr;
		for (const [rarity, range] of Object.entries(rarityRanges)) {
			if (cr >= range.min && cr <= range.max) {
				groups[rarity].push(car);
				break;
			}
		}
	});

	return groups;
};

// Pick a random car from a rarity group
const pickRandomCar = (carGroups, rarity) => {
	const pool = carGroups[rarity];
	if (!pool || pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)];
};

// Determine rarity based on pack slot percentages
const rollRarity = (slot) => {
	const rand = Math.random() * 100;
	let cumulative = 0;

	const rarities = ['standard', 'common', 'uncommon', 'rare', 'epic', 'exotic', 'legendary', 'mystic'];
	
	for (const rarity of rarities) {
		cumulative += slot[rarity] || 0;
		if (rand < cumulative) {
			return rarity;
		}
	}
	
	return 'standard';
};

// Tyre type abbreviation helper
const getTyreAbbr = (tyreType) => {
	const abbrs = {
		'Performance': 'PER',
		'Standard': 'STD',
		'Off-Road': 'OFF',
		'All-Surface': 'ALL',
		'Drag': 'DRG',
		'Slick': 'SLK',
	};
	return abbrs[tyreType] || tyreType;
};

const CARDS_PER_PAGE = 24;

const PackSimulator = () => {
	const [selectedPack, setSelectedPack] = useState(null);
	const [pulledCards, setPulledCards] = useState([]);
	const [isOpening, setIsOpening] = useState(false);
	const [openCount, setOpenCount] = useState(1);
	const [stats, setStats] = useState({ total: 0, byRarity: {} });
	
	// Modal state
	const [modalCar, setModalCar] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	
	// Filter/sort state for pulled cards
	const [sortType, setSortType] = useState(1);
	const [crRange, setCrRange] = useState([1, 2000]);
	const [hiddenRarities, setHiddenRarities] = useState({
		standard: false,
		common: false,
		uncommon: false,
		rare: false,
		epic: false,
		exotic: false,
		legendary: false,
		mystic: false,
	});
	const [page, setPage] = useState(1);

	// Get filtered car groups when pack changes
	const getFilteredCarGroups = () => {
		if (!selectedPack) return null;
		const filtered = filterCars(carData, selectedPack.filter);
		return groupCarsByRarity(filtered);
	};

	const openPack = () => {
		if (!selectedPack) return;

		setIsOpening(true);
		const carGroups = getFilteredCarGroups();
		
		if (!carGroups) {
			setIsOpening(false);
			return;
		}

		const newCards = [];
		const newStats = { ...stats };
		newStats.total += openCount;

		for (let openNum = 0; openNum < openCount; openNum++) {
			const repetition = selectedPack.repetition || 1;
			
			for (let rep = 0; rep < repetition; rep++) {
				for (let slotIndex = 0; slotIndex < selectedPack.packSequence.length; slotIndex++) {
					const slot = selectedPack.packSequence[slotIndex];
					const rarity = rollRarity(slot);
					const car = pickRandomCar(carGroups, rarity);

					if (car) {
						newCards.push({
							...car,
							pulledRarity: rarity,
							pullIndex: pulledCards.length + newCards.length,
						});

						newStats.byRarity[rarity] = (newStats.byRarity[rarity] || 0) + 1;
					}
				}
			}
		}

		setStats(newStats);
		setPulledCards(prev => [...prev, ...newCards]);
		setPage(1);
		setIsOpening(false);
	};

	const resetSimulator = () => {
		setPulledCards([]);
		setStats({ total: 0, byRarity: {} });
		setPage(1);
	};

	const handleCardClick = (car) => {
		setModalCar(car);
		setModalOpen(true);
	};

	const handleRarityToggle = (rarity) => {
		setHiddenRarities(prev => ({
			...prev,
			[rarity]: !prev[rarity]
		}));
		setPage(1);
	};

	// Filter and sort pulled cards using useMemo for performance
	const displayedCards = useMemo(() => {
		let filtered = pulledCards.filter(car => {
			if (hiddenRarities[car.pulledRarity]) return false;
			if (car.cr < crRange[0] || car.cr > crRange[1]) return false;
			return true;
		});

		switch (sortType) {
			case 1: // CR high to low
				filtered.sort((a, b) => b.cr - a.cr);
				break;
			case 2: // CR low to high
				filtered.sort((a, b) => a.cr - b.cr);
				break;
			case 3: // Pull order (newest first)
				filtered.sort((a, b) => b.pullIndex - a.pullIndex);
				break;
			case 4: // Pull order (oldest first)
				filtered.sort((a, b) => a.pullIndex - b.pullIndex);
				break;
			default:
				break;
		}

		return filtered;
	}, [pulledCards, hiddenRarities, crRange, sortType]);

	// Paginated cards
	const paginatedCards = useMemo(() => {
		const start = (page - 1) * CARDS_PER_PAGE;
		return displayedCards.slice(start, start + CARDS_PER_PAGE);
	}, [displayedCards, page]);

	const totalPages = Math.ceil(displayedCards.length / CARDS_PER_PAGE);

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 500, xs: '80%' },
		bgcolor: modalCar?.isPrize ? 'background.prize' : 'background.paper',
		border: `2px solid ${modalCar ? rarityColors[modalCar.pulledRarity] : '#fff'}`,
		boxShadow: 24,
		p: 2,
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflow: 'auto',
	};

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
				Pack Simulator
			</Typography>
			<Typography variant="subtitle1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
				Test your luck without spending any in-game currency!
			</Typography>

			{/* Controls */}
			<Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{ 
					display: 'flex', 
					flexDirection: { xs: 'column', md: 'row' }, 
					gap: 2, 
					alignItems: 'center',
					mb: 2,
				}}>
					{/* Pack selector */}
					<Autocomplete
						fullWidth
						value={selectedPack}
						options={packData}
						getOptionLabel={(pack) => pack.packName}
						onChange={(event, newValue) => {
							setSelectedPack(newValue);
							setPulledCards([]);
							setStats({ total: 0, byRarity: {} });
							setPage(1);
						}}
						renderOption={(props, pack) => (
							<Box component="li" {...props} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
								<img 
									src={pack.pack} 
									alt="" 
									style={{ width: 40, height: 40, objectFit: 'contain' }} 
								/>
								<Box>
									<Typography variant="body2">{pack.packName}</Typography>
									<Typography variant="caption" color="text.secondary">
										{pack.packSequence?.length * (pack.repetition || 1)} cards
									</Typography>
								</Box>
							</Box>
						)}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a Pack"
								placeholder="Choose a pack to open..."
							/>
						)}
					/>

					{/* Open count */}
					<FormControl sx={{ minWidth: 150 }}>
						<InputLabel>Open Count</InputLabel>
						<Select
							value={openCount}
							label="Open Count"
							onChange={(e) => setOpenCount(e.target.value)}
						>
							<MenuItem value={1}>1 Pack</MenuItem>
							<MenuItem value={5}>5 Packs</MenuItem>
							<MenuItem value={10}>10 Packs</MenuItem>
							<MenuItem value={25}>25 Packs</MenuItem>
							<MenuItem value={50}>50 Packs</MenuItem>
						</Select>
					</FormControl>

					{/* Open button */}
					<Button
						variant="contained"
						size="large"
						startIcon={<CasinoIcon />}
						onClick={openPack}
						disabled={!selectedPack || isOpening}
						sx={{
							minWidth: 150,
							height: 56,
							backgroundColor: '#4caf50',
							'&:hover': { backgroundColor: '#388e3c' },
						}}
					>
						{isOpening ? 'Opening...' : 'Open Pack'}
					</Button>

					{/* Reset button */}
					<Button
						variant="outlined"
						size="large"
						startIcon={<RefreshIcon />}
						onClick={resetSimulator}
						sx={{ height: 56 }}
					>
						Reset
					</Button>
				</Box>

				{/* Selected pack info */}
				{selectedPack && (
					<Box sx={{ 
						display: 'flex', 
						gap: 2, 
						alignItems: 'center',
						p: 2,
						backgroundColor: 'rgba(0,0,0,0.5)',
						borderRadius: 1,
					}}>
						<img 
							src={selectedPack.pack} 
							alt={selectedPack.packName}
							style={{ width: 80, height: 80, objectFit: 'contain' }}
						/>
						<Box>
							<Typography variant="h6">{selectedPack.packName}</Typography>
							<Typography variant="body2" color="text.secondary">
								{selectedPack.description}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{selectedPack.packSequence?.length * (selectedPack.repetition || 1)} cards per pack
								{selectedPack.price ? ` • $${selectedPack.price.toLocaleString()}` : ' • Event/Daily'}
							</Typography>
						</Box>
					</Box>
				)}
			</Paper>

			{/* Stats */}
			{stats.total > 0 && (
				<Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
						Session Stats ({stats.total} packs opened, {pulledCards.length} cards)
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
						{Object.entries(rarityRanges).reverse().map(([rarity]) => {
							const count = stats.byRarity[rarity] || 0;
							if (count === 0) return null;
							return (
								<Chip
									key={rarity}
									label={`${rarityLabels[rarity]}: ${count}`}
									sx={{
										backgroundColor: rarityColors[rarity],
										color: ['legendary', 'common', 'standard'].includes(rarity) ? '#000' : '#fff',
										fontWeight: 'bold',
									}}
								/>
							);
						})}
					</Box>
				</Paper>
			)}

			{/* Filters for pulled cards */}
			{pulledCards.length > 0 && (
				<Accordion sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography fontWeight="bold">
							Filter & Sort Results ({displayedCards.length} of {pulledCards.length} shown)
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{/* Sort and CR Range */}
							<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
								<FormControl sx={{ minWidth: 200 }}>
									<InputLabel>Sort By</InputLabel>
									<Select
										value={sortType}
										label="Sort By"
										onChange={(e) => {
											setSortType(e.target.value);
											setPage(1);
										}}
									>
										<MenuItem value={1}>CR (High to Low)</MenuItem>
										<MenuItem value={2}>CR (Low to High)</MenuItem>
										<MenuItem value={3}>Pull Order (Newest)</MenuItem>
										<MenuItem value={4}>Pull Order (Oldest)</MenuItem>
									</Select>
								</FormControl>

								<Box sx={{ flex: 1, px: 2 }}>
									<Typography gutterBottom>
										CR Range: {crRange[0]} - {crRange[1]}
									</Typography>
									<Slider
										value={crRange}
										onChange={(e, newValue) => {
											setCrRange(newValue);
											setPage(1);
										}}
										valueLabelDisplay="auto"
										min={1}
										max={2000}
										sx={{
											'& .MuiSlider-thumb': { backgroundColor: '#4caf50' },
											'& .MuiSlider-track': { backgroundColor: '#4caf50' },
										}}
									/>
								</Box>
							</Box>

							{/* Rarity toggles */}
							<Box>
								<Typography gutterBottom fontWeight="bold">Hide Rarities:</Typography>
								<FormGroup row>
									{Object.entries(rarityLabels).map(([rarity, label]) => (
										<FormControlLabel
											key={rarity}
											control={
												<Checkbox
													checked={hiddenRarities[rarity]}
													onChange={() => handleRarityToggle(rarity)}
													sx={{
														color: rarityColors[rarity],
														'&.Mui-checked': { color: rarityColors[rarity] },
													}}
												/>
											}
											label={
												<Chip
													label={label}
													size="small"
													sx={{
														backgroundColor: hiddenRarities[rarity] ? 'transparent' : rarityColors[rarity],
														color: hiddenRarities[rarity] ? 'text.disabled' : (['legendary', 'common', 'standard'].includes(rarity) ? '#000' : '#fff'),
														border: hiddenRarities[rarity] ? `1px solid ${rarityColors[rarity]}` : 'none',
														textDecoration: hiddenRarities[rarity] ? 'line-through' : 'none',
													}}
												/>
											}
										/>
									))}
								</FormGroup>
							</Box>
						</Box>
					</AccordionDetails>
				</Accordion>
			)}

			{/* Pulled Cards - Paginated for performance */}
			{paginatedCards.length > 0 && (
				<>
					<Box sx={{ 
						display: 'flex', 
						flexWrap: 'wrap', 
						gap: '0.75rem', 
						justifyContent: 'center',
						mb: 3,
					}}>
						{paginatedCards.map((car) => (
							<Button
								key={`${car.carID}-${car.pullIndex}`}
								onClick={() => handleCardClick(car)}
								sx={{
									p: 0,
									borderRadius: 2,
									overflow: 'hidden',
									border: `3px solid ${rarityColors[car.pulledRarity]}`,
									boxShadow: `0 0 8px ${rarityColors[car.pulledRarity]}50`,
									transition: 'transform 0.2s',
									'&:hover': {
										transform: 'scale(1.03)',
									},
								}}
							>
								<Box sx={{ position: 'relative' }}>
									<LazyLoadImage
										src={car.racehud}
										alt={car.model}
										style={{ 
											width: '180px', 
											height: '112px', 
											objectFit: 'cover',
											display: 'block',
										}}
									/>
									{/* Rarity badge */}
									<Chip
										label={rarityLabels[car.pulledRarity]}
										size="small"
										sx={{
											position: 'absolute',
											top: 4,
											right: 4,
											backgroundColor: rarityColors[car.pulledRarity],
											color: ['legendary', 'common', 'standard'].includes(car.pulledRarity) ? '#000' : '#fff',
											fontWeight: 'bold',
											fontSize: '0.6rem',
											height: '20px',
										}}
									/>
									{/* CR badge */}
									<Chip
										label={car.cr}
										size="small"
										sx={{
											position: 'absolute',
											top: 4,
											left: 4,
											backgroundColor: 'rgba(0,0,0,0.8)',
											color: '#fff',
											fontSize: '0.6rem',
											height: '20px',
										}}
									/>
									{/* Car name overlay */}
									<Box sx={{ 
										position: 'absolute',
										bottom: 0,
										left: 0,
										right: 0,
										p: 0.5, 
										backgroundColor: 'rgba(0,0,0,0.85)',
										textAlign: 'center',
									}}>
										<Typography sx={{ 
											fontWeight: 'bold',
											fontSize: '0.65rem',
											color: '#fff',
											lineHeight: 1.2,
										}}>
											{car.model}
										</Typography>
									</Box>
								</Box>
							</Button>
						))}
					</Box>

					{/* Pagination */}
					{totalPages > 1 && (
						<Stack sx={{ mb: 3 }}>
							<Pagination
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
								}}
								size="large"
								count={totalPages}
								page={page}
								onChange={(e, value) => setPage(value)}
								variant="outlined"
								color="primary"
								shape="rounded"
							/>
						</Stack>
					)}
				</>
			)}

			{/* Empty state */}
			{selectedPack && pulledCards.length === 0 && (
				<Box sx={{ 
					textAlign: 'center', 
					p: 5,
					backgroundColor: 'rgba(0,0,0,0.5)',
					borderRadius: 2,
				}}>
					<CasinoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
					<Typography color="text.secondary">
						Click "Open Pack" to see what you get!
					</Typography>
				</Box>
			)}

			{/* Car Detail Modal - Same as Car List */}
			{modalCar && (
				<Modal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					aria-labelledby="car-modal-title"
				>
					<Box sx={modalStyle}>
						<Box sx={{ position: 'relative' }}>
							<LazyLoadImage
								src={modalCar.racehud}
								style={{ width: '100%' }}
							/>
							{/* Stats overlay - matching Cards.jsx style */}
							<span
								style={{
									position: 'absolute',
									top: '28%',
									left: '2%',
									fontFamily: 'Rubik-BoldItalic',
									fontSize: '0.8rem',
								}}>
								{modalCar.topSpeed}
							</span>
							<span
								style={{
									position: 'absolute',
									top: '37%',
									left: '2%',
									fontFamily: 'Rubik-BoldItalic',
									fontSize: '0.8rem',
								}}>
								{modalCar['0to60']}
							</span>
							<span
								style={{
									position: 'absolute',
									top: '46%',
									left: '2%',
									fontFamily: 'Rubik-BoldItalic',
									fontSize: '0.8rem',
								}}>
								{modalCar.handling}
							</span>
							<span
								style={{
									position: 'absolute',
									top: '55%',
									left: '2%',
									fontFamily: 'Rubik-BoldItalic',
									fontSize: '0.8rem',
								}}>
								{modalCar.driveType}
							</span>
							<span
								style={{
									position: 'absolute',
									top: '64%',
									left: '2%',
									fontFamily: 'Rubik-BoldItalic',
									fontSize: '0.8rem',
								}}>
								{getTyreAbbr(modalCar.tyreType)}
							</span>
						</Box>

						{/* Rarity chip */}
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Chip
								label={`${rarityLabels[modalCar.pulledRarity]} • CR ${modalCar.cr}`}
								sx={{
									backgroundColor: rarityColors[modalCar.pulledRarity],
									color: ['legendary', 'common', 'standard'].includes(modalCar.pulledRarity) ? '#000' : '#fff',
									fontWeight: 'bold',
									fontSize: '1rem',
								}}
							/>
						</Box>

						{/* Tags */}
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
							{modalCar.tags?.map((tag, i) => (
								<Chip key={i} color="success" label={tag} size="small" />
							))}
						</Box>

						{/* Description */}
						{modalCar.description && modalCar.description !== 'None.' && modalCar.description !== '' && (
							<Accordion>
								<AccordionSummary>
									<Typography>Description</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Typography sx={{ mt: -1 }}>{modalCar.description}</Typography>
								</AccordionDetails>
							</Accordion>
						)}

						{/* Car details - matching Cards.jsx layout */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
							<Box>
								{modalCar.isPrize && (
									<Typography sx={{ color: 'yellow', display: 'flex', alignItems: 'center', gap: 0.5 }} variant="h6">
										<EmojiEventsIcon /> Prize car
									</Typography>
								)}
								<Typography variant="h6">
									{Array.isArray(modalCar.bodyStyle) ? modalCar.bodyStyle.join(' / ') : modalCar.bodyStyle}
								</Typography>
								<Typography variant="h6">{modalCar.fuelType}</Typography>
								<Typography variant="h6">{modalCar.tcs ? 'TCS' : 'No TCS'}</Typography>
								<Typography variant="h6">{modalCar.abs ? 'ABS' : 'No ABS'}</Typography>
							</Box>
							<Box>
								<Typography variant="h6">{modalCar.weight} KG</Typography>
								<Typography variant="h6">{modalCar.seatCount} Seats</Typography>
								<Typography variant="h6">MRA: {modalCar.mra}</Typography>
								<Typography variant="h6">OLA: {modalCar.ola}</Typography>
								<Typography variant="h6">GC: {modalCar.gc}</Typography>
							</Box>
						</Box>

						<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
							<Typography variant="h6">Creator: {modalCar.creator}</Typography>
							<Typography variant="h6">ID: {modalCar.carID}</Typography>
						</Box>
					</Box>
				</Modal>
			)}
		</Box>
	);
};

export default PackSimulator;
