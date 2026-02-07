import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Paper,
	Chip,
	Slider,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Pagination,
	Stack,
	InputAdornment,
} from '@mui/material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Data imports
import packData from '../data/packData.js';
import carData from '../data/data.js';

// Image optimisation helpers (shared utility)
import { getThumbnailUrl, getPlaceholderUrl } from '../utils/imageUtils';

// Shared car detail modal
import CarDetailModal from './CarDetailModal';

// Icons
import CasinoIcon from '@mui/icons-material/Casino';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';

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

const CARDS_PER_PAGE = 24;
const PACKS_PER_PAGE = 20;

// ============================================================
// SEARCHABLE PACK PICKER COMPONENT
// ============================================================
const PackPicker = ({ selectedPack, onSelect }) => {
	const [expanded, setExpanded] = useState(false);
	const [search, setSearch] = useState('');
	const [packPage, setPackPage] = useState(1);
	const buttonRef = useRef(null);
	const dropdownRef = useRef(null);
	const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

	// Filter packs by search term
	const filteredPacks = useMemo(() => {
		if (!search.trim()) return packData;
		const term = search.toLowerCase();
		return packData.filter(pack =>
			pack.packName.toLowerCase().includes(term)
		);
	}, [search]);

	// Paginate
	const totalPackPages = Math.ceil(filteredPacks.length / PACKS_PER_PAGE);
	const pagedPacks = useMemo(() => {
		const start = (packPage - 1) * PACKS_PER_PAGE;
		return filteredPacks.slice(start, start + PACKS_PER_PAGE);
	}, [filteredPacks, packPage]);

	// Reset page when search changes
	useEffect(() => {
		setPackPage(1);
	}, [search]);

	// Position the portal dropdown beneath the button
	const updatePosition = useCallback(() => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPos({
				top: rect.bottom + window.scrollY + 4,
				left: rect.left + window.scrollX,
				width: rect.width,
			});
		}
	}, []);

	useEffect(() => {
		if (expanded) {
			updatePosition();
			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition);
			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition);
			};
		}
	}, [expanded, updatePosition]);

	const handleSelect = (pack) => {
		onSelect(pack);
		setExpanded(false);
		setSearch('');
		setPackPage(1);
	};

	// Close on click outside
	useEffect(() => {
		if (!expanded) return;
		const handleClickOutside = (e) => {
			if (
				buttonRef.current && !buttonRef.current.contains(e.target) &&
				dropdownRef.current && !dropdownRef.current.contains(e.target)
			) {
				setExpanded(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [expanded]);

	return (
		<>
			{/* Selected pack display / toggle button */}
			<Button
				ref={buttonRef}
				fullWidth
				onClick={() => setExpanded(!expanded)}
				sx={{
					p: 1.5,
					justifyContent: 'flex-start',
					textAlign: 'left',
					textTransform: 'none',
					border: '1px solid rgba(255,255,255,0.25)',
					borderRadius: 1,
					backgroundColor: 'rgba(0,0,0,0.3)',
					color: 'white',
					'&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
					minHeight: 56,
				}}
			>
				{selectedPack ? (
					<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
						<img
							src={getThumbnailUrl(selectedPack.pack, 60, 70)}
							alt=""
							style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }}
						/>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant="body2" fontWeight="bold" noWrap>
								{selectedPack.packName}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary' }}>
								{selectedPack.packSequence?.length * (selectedPack.repetition || 1)} cards
								{selectedPack.price ? ` • $${selectedPack.price.toLocaleString()}` : ' • Event/Daily'}
							</Typography>
						</Box>
						<ExpandMoreIcon sx={{
							transform: expanded ? 'rotate(180deg)' : 'none',
							transition: 'transform 0.2s',
						}} />
					</Box>
				) : (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
						<InventoryIcon sx={{ color: 'text.secondary' }} />
						<Typography sx={{ color: 'text.secondary' }}>
							Select a pack...
						</Typography>
						<Box sx={{ flex: 1 }} />
						<ExpandMoreIcon sx={{
							transform: expanded ? 'rotate(180deg)' : 'none',
							transition: 'transform 0.2s',
						}} />
					</Box>
				)}
			</Button>

			{/* Dropdown panel — portalled to document.body to escape stacking context */}
			{expanded && createPortal(
				<Paper
					ref={dropdownRef}
					elevation={8}
					sx={{
						position: 'absolute',
						top: dropdownPos.top,
						left: dropdownPos.left,
						width: dropdownPos.width,
						zIndex: 99999,
						backgroundColor: '#1a1a1a',
						border: '1px solid rgba(255,255,255,0.15)',
						borderRadius: 1,
						maxHeight: '60vh',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					{/* Search box */}
					<Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
						<TextField
							autoFocus
							fullWidth
							size="small"
							placeholder="Search packs..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
									</InputAdornment>
								),
								endAdornment: search && (
									<InputAdornment position="end">
										<CloseIcon
											sx={{ fontSize: 18, cursor: 'pointer', color: 'text.secondary' }}
											onClick={() => setSearch('')}
										/>
									</InputAdornment>
								),
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									backgroundColor: 'rgba(255,255,255,0.06)',
								},
							}}
						/>
					</Box>

					{/* Pack count */}
					<Typography
						variant="caption"
						sx={{ px: 1.5, pt: 1, color: 'text.secondary' }}
					>
						{filteredPacks.length} pack{filteredPacks.length !== 1 ? 's' : ''} found
					</Typography>

					{/* Pack list */}
					<Box sx={{ overflowY: 'auto', flex: 1, px: 0.5, py: 0.5 }}>
						{pagedPacks.map((pack, index) => {
							const isSelected = selectedPack?.packName === pack.packName;
							return (
								<Button
									key={`${pack.packName}-${index}`}
									fullWidth
									onClick={() => handleSelect(pack)}
									sx={{
										justifyContent: 'flex-start',
										textAlign: 'left',
										textTransform: 'none',
										p: 1,
										mb: 0.25,
										borderRadius: 1,
										backgroundColor: isSelected
											? 'rgba(76, 175, 80, 0.15)'
											: 'transparent',
										border: isSelected
											? '1px solid rgba(76, 175, 80, 0.4)'
											: '1px solid transparent',
										'&:hover': {
											backgroundColor: isSelected
												? 'rgba(76, 175, 80, 0.25)'
												: 'rgba(255,255,255,0.06)',
										},
									}}
								>
									<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
										<img
											src={getThumbnailUrl(pack.pack, 60, 60)}
											alt=""
											style={{
												width: 36,
												height: 36,
												objectFit: 'contain',
												borderRadius: 4,
											}}
											loading="lazy"
										/>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography
												variant="body2"
												fontWeight={isSelected ? 'bold' : 'normal'}
												noWrap
												sx={{ color: '#fff' }}
											>
												{pack.packName}
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												{pack.packSequence?.length * (pack.repetition || 1)} cards
												{pack.price ? ` • $${pack.price.toLocaleString()}` : ' • Event/Daily'}
											</Typography>
										</Box>
									</Box>
								</Button>
							);
						})}

						{filteredPacks.length === 0 && (
							<Typography
								variant="body2"
								sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}
							>
								No packs match "{search}"
							</Typography>
						)}
					</Box>

					{/* Pagination */}
					{totalPackPages > 1 && (
						<Box sx={{
							borderTop: '1px solid rgba(255,255,255,0.1)',
							p: 1,
							display: 'flex',
							justifyContent: 'center',
						}}>
							<Pagination
								size="small"
								count={totalPackPages}
								page={packPage}
								onChange={(e, v) => setPackPage(v)}
								variant="outlined"
								shape="rounded"
								sx={{
									'& .MuiPaginationItem-root': {
										color: 'white',
										borderColor: 'rgba(255,255,255,0.2)',
										minWidth: 28,
										height: 28,
										fontSize: '0.75rem',
									},
									'& .Mui-selected': {
										bgcolor: '#4caf50 !important',
										color: '#fff !important',
										borderColor: '#4caf50 !important',
									},
								}}
							/>
						</Box>
					)}
				</Paper>,
				document.body
			)}
		</>
	);
};

// ============================================================
// PACK SIMULATOR COMPONENT
// ============================================================
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

	const handlePackSelect = (pack) => {
		setSelectedPack(pack);
		setPulledCards([]);
		setStats({ total: 0, byRarity: {} });
		setPage(1);
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

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
				Pack Simulator
			</Typography>
			<Typography variant="subtitle1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
				Test your luck without spending any in-game currency!
			</Typography>

			{/* Controls + Stats + Filters — unified glassmorphism box */}
			<Box
				sx={{
					background: 'rgba(255, 255, 255, 0.25)',
					boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
					backdropFilter: 'blur(4px)',
					WebkitBackdropFilter: 'blur(4px)',
					borderRadius: '10px',
					border: '1px solid rgba(255, 255, 255, 0.18)',
					p: { xs: 1.5, md: 2.5 },
					mb: 3,
					display: 'flex',
					flexDirection: 'column',
					gap: '0.75rem',
				}}
			>
				{/* Row: Pack picker + Open count + buttons */}
				<Box sx={{ 
					display: 'flex', 
					flexDirection: { xs: 'column', md: 'row' }, 
					gap: 2, 
					alignItems: { xs: 'stretch', md: 'center' },
				}}>
					{/* Pack selector — searchable paginated picker */}
					<Box sx={{ flex: 1 }}>
						<PackPicker
							selectedPack={selectedPack}
							onSelect={handlePackSelect}
						/>
					</Box>

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
						backgroundColor: 'rgba(0,0,0,0.35)',
						borderRadius: '8px',
						border: '1px solid rgba(255,255,255,0.08)',
					}}>
						<img 
							src={getThumbnailUrl(selectedPack.pack, 120, 75)}
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

				{/* Session Stats */}
				{stats.total > 0 && (
					<Box sx={{
						p: 2,
						backgroundColor: 'rgba(0,0,0,0.35)',
						borderRadius: '8px',
						border: '1px solid rgba(255,255,255,0.08)',
					}}>
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
					</Box>
				)}

				{/* Filter & Sort Results */}
				{pulledCards.length > 0 && (
					<Accordion sx={{
						backgroundColor: 'rgba(0,0,0,0.35)',
						borderRadius: '8px !important',
						border: '1px solid rgba(255,255,255,0.08)',
						'&:before': { display: 'none' },
					}}>
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
			</Box>

			{/* Pulled Cards — styled like Home / BMCarList */}
			{paginatedCards.length > 0 && (
				<>
					<Box sx={{ 
						display: 'grid',
						gridTemplateColumns: {
							xs: 'repeat(2, 1fr)',
							sm: 'repeat(3, 1fr)',
							md: 'repeat(4, 1fr)',
							lg: 'repeat(5, 1fr)',
						},
						gap: '0.71rem', 
						justifyItems: 'center',
						padding: { xs: '10px', md: '20px' },
						mb: 3,
					}}>
						{paginatedCards.map((car) => {
							const glowColor = rarityColors[car.pulledRarity];
							return (
								<Button
									key={`${car.carID}-${car.pullIndex}`}
									onClick={() => handleCardClick(car)}
									className="carCard"
									sx={{
										boxShadow: `0 0 14px 3px ${glowColor}44, inset 0 0 8px ${glowColor}15 !important`,
										borderColor: `${glowColor}55 !important`,
										width: '100%',
										maxWidth: '15rem',
									}}
								>
									<div style={{ position: 'relative', width: '100%' }}>
										<LazyLoadImage
											threshold={200}
											effect="blur"
											src={getThumbnailUrl(car.racehud, 240, 70)}
											placeholderSrc={getPlaceholderUrl(car.racehud)}
											style={{
												width: '100%',
												aspectRatio: '240 / 150',
												marginBottom: '-5px',
												objectFit: 'cover',
											}}
										/>
									</div>
									<p
										style={{
											padding: 0,
											margin: 0,
											marginTop: 6,
											fontFamily: 'Rubik-BoldItalic',
											fontSize: '0.65rem',
											maxWidth: '100%',
											textAlign: 'center',
											overflow: 'hidden',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											lineHeight: '1.2',
										}}
									>
										{Array.isArray(car.make) ? car.make[0] : car.make}{' '}
										{car.model} ({car.modelYear})
									</p>
								</Button>
							);
						})}
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
					background: 'rgba(255, 255, 255, 0.25)',
					boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
					backdropFilter: 'blur(4px)',
					WebkitBackdropFilter: 'blur(4px)',
					borderRadius: '10px',
					border: '1px solid rgba(255, 255, 255, 0.18)',
				}}>
					<CasinoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
					<Typography color="text.secondary">
						Click "Open Pack" to see what you get!
					</Typography>
				</Box>
			)}

			{/* Car Detail Modal — shared component */}
			<CarDetailModal
				car={modalCar}
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				glowColor={modalCar ? rarityColors[modalCar.pulledRarity] : undefined}
			/>
		</Box>
	);
};

export default PackSimulator;
