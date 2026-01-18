import { useState, useEffect, useMemo, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Tabs,
	Tab,
	LinearProgress,
	IconButton,
	Tooltip,
	Snackbar,
	Alert,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Pagination,
	Stack,
	Grid,
	Divider,
} from '@mui/material';

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CasinoIcon from '@mui/icons-material/Casino';
import GarageIcon from '@mui/icons-material/Garage';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SellIcon from '@mui/icons-material/Sell';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorefrontIcon from '@mui/icons-material/Storefront';

import carData from '../data/data.js';
import packData from '../data/packData.js';

// ========== GAME CONSTANTS ==========

// Filter out BM cars and cars without essential data
const gameCars = carData.filter(car => 
	!car.reference && 
	car.topSpeed && 
	car["0to60"] && 
	car.handling &&
	car.cr
);

// Create index mapping for efficient saves
const carIdToIndex = {};
const indexToCarId = {};
gameCars.forEach((car, idx) => {
	carIdToIndex[car.carID] = idx;
	indexToCarId[idx] = car.carID;
});

// Filter packs that have a price
const purchasablePacks = packData.filter(pack => pack.price && pack.price > 0);

// Rarity tiers based on CR (CD system)
const getRarity = (cr) => {
	if (cr >= 1000) return { name: 'Mystic', color: '#ff69b4', key: 'mystic' };
	if (cr >= 850) return { name: 'Legendary', color: '#ffd700', key: 'legendary' };
	if (cr >= 700) return { name: 'Exotic', color: '#9c27b0', key: 'exotic' };
	if (cr >= 550) return { name: 'Epic', color: '#f44336', key: 'epic' };
	if (cr >= 400) return { name: 'Rare', color: '#03a9f4', key: 'rare' };
	if (cr >= 250) return { name: 'Uncommon', color: '#4caf50', key: 'uncommon' };
	if (cr >= 100) return { name: 'Common', color: '#616161', key: 'common' };
	return { name: 'Standard', color: '#9e9e9e', key: 'standard' };
};

// Group cars by rarity for pack pulls
const carsByRarity = {
	standard: gameCars.filter(c => c.cr < 100),
	common: gameCars.filter(c => c.cr >= 100 && c.cr < 250),
	uncommon: gameCars.filter(c => c.cr >= 250 && c.cr < 400),
	rare: gameCars.filter(c => c.cr >= 400 && c.cr < 550),
	epic: gameCars.filter(c => c.cr >= 550 && c.cr < 700),
	exotic: gameCars.filter(c => c.cr >= 700 && c.cr < 850),
	legendary: gameCars.filter(c => c.cr >= 850 && c.cr < 1000),
	mystic: gameCars.filter(c => c.cr >= 1000),
};

// Built-in starter packs for early game progression (limited purchases)
const STARTER_PACKS = [
	{
		packID: 'clicker_starter',
		packName: 'Starter Pack',
		description: '3 cards • Standard to Uncommon',
		price: 1000,
		pack: null,
		packColor: '#9e9e9e',
		maxPurchases: 3,
		filter: {},
		packSequence: [
			{ standard: 40, common: 45, uncommon: 15, rare: 0, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 40, common: 45, uncommon: 15, rare: 0, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 30, common: 50, uncommon: 20, rare: 0, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
		],
	},
	{
		packID: 'clicker_bronze',
		packName: 'Bronze Pack',
		description: '3 cards • Common to Rare chance',
		price: 5000,
		pack: null,
		packColor: '#cd7f32',
		maxPurchases: 3,
		filter: {},
		packSequence: [
			{ standard: 10, common: 50, uncommon: 35, rare: 5, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 10, common: 50, uncommon: 35, rare: 5, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 5, common: 40, uncommon: 45, rare: 10, epic: 0, exotic: 0, legendary: 0, mystic: 0 },
		],
	},
	{
		packID: 'clicker_silver',
		packName: 'Silver Pack',
		description: '4 cards • Uncommon+ with Epic chance',
		price: 15000,
		pack: null,
		packColor: '#c0c0c0',
		maxPurchases: 3,
		filter: {},
		packSequence: [
			{ standard: 0, common: 20, uncommon: 50, rare: 25, epic: 5, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 0, common: 20, uncommon: 50, rare: 25, epic: 5, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 0, common: 15, uncommon: 45, rare: 32, epic: 8, exotic: 0, legendary: 0, mystic: 0 },
			{ standard: 0, common: 10, uncommon: 40, rare: 38, epic: 12, exotic: 0, legendary: 0, mystic: 0 },
		],
	},
	{
		packID: 'clicker_gold',
		packName: 'Gold Pack',
		description: '5 cards • Rare+ guaranteed',
		price: 50000,
		pack: null,
		packColor: '#ffd700',
		maxPurchases: 3,
		filter: {},
		packSequence: [
			{ standard: 0, common: 0, uncommon: 0, rare: 60, epic: 30, exotic: 8, legendary: 2, mystic: 0 },
			{ standard: 0, common: 0, uncommon: 0, rare: 60, epic: 30, exotic: 8, legendary: 2, mystic: 0 },
			{ standard: 0, common: 0, uncommon: 0, rare: 55, epic: 32, exotic: 10, legendary: 3, mystic: 0 },
			{ standard: 0, common: 0, uncommon: 0, rare: 50, epic: 35, exotic: 12, legendary: 3, mystic: 0 },
			{ standard: 0, common: 0, uncommon: 0, rare: 45, epic: 38, exotic: 13, legendary: 4, mystic: 0 },
		],
	},
];

// Combine starter packs with real packs, sorted by price
const allPacks = [...STARTER_PACKS, ...purchasablePacks].sort((a, b) => a.price - b.price);

// Upgrade definitions
const UPGRADES = {
	garageSlots: {
		name: 'Garage Slots',
		description: 'Expand your garage capacity',
		icon: <GarageIcon />,
		baseCost: 25000,
		costMultiplier: 2.5,
		maxLevel: 10,
		baseValue: 5,
		increment: 1,
	},
	passiveIncome: {
		name: 'Car Showcase',
		description: 'Earn $/sec based on unique cars owned',
		icon: <AutoAwesomeIcon />,
		baseCost: 10000,
		costMultiplier: 2,
		maxLevel: 20,
		baseValue: 0,
		increment: 5, // $ per unique car per second
	},
	luckBonus: {
		name: 'Lucky Charm',
		description: 'Increase rare pull chances',
		icon: <CasinoIcon />,
		baseCost: 15000,
		costMultiplier: 2.2,
		maxLevel: 15,
		baseValue: 0,
		increment: 2, // % bonus
	},
	earningsMultiplier: {
		name: 'Premium Collector',
		description: 'Multiply all earnings',
		icon: <TrendingUpIcon />,
		baseCost: 50000,
		costMultiplier: 3,
		maxLevel: 10,
		baseValue: 1,
		increment: 0.25, // 25% more per level
	},
};

// ========== HELPER FUNCTIONS ==========

const fmtMoney = (n) => '$' + Math.floor(n).toLocaleString();
const fmtNumber = (n) => n.toLocaleString();

const getCarName = (car) => {
	const make = Array.isArray(car.make) ? car.make[0] : car.make;
	return `${make} ${car.model}`;
};

// Get sell value based on CR (more generous for higher rarity)
const getSellValue = (car) => {
	const cr = car.cr;
	if (cr >= 1000) return Math.floor(cr * 50); // Mystic
	if (cr >= 850) return Math.floor(cr * 40);  // Legendary
	if (cr >= 700) return Math.floor(cr * 30);  // Exotic
	if (cr >= 550) return Math.floor(cr * 20);  // Epic
	if (cr >= 400) return Math.floor(cr * 12);  // Rare
	if (cr >= 250) return Math.floor(cr * 8);   // Uncommon
	if (cr >= 100) return Math.floor(cr * 5);   // Common
	return Math.floor(cr * 3);                   // Standard
};

// Weighted random selection
const weightedPick = (weights) => {
	const entries = Object.entries(weights).filter(([, w]) => w > 0);
	const total = entries.reduce((sum, [, w]) => sum + w, 0);
	if (total === 0) return 'common';
	let roll = Math.random() * total;
	for (const [type, weight] of entries) {
		roll -= weight;
		if (roll <= 0) return type;
	}
	return entries[0]?.[0] || 'common';
};

// Get random car from pack sequence slot with filters
const getRandomCarFromSlot = (slot, filter, luck = 0) => {
	// Apply luck bonus to weights
	const weights = { ...slot };
	weights.mystic = (weights.mystic || 0) * (1 + luck * 0.01);
	weights.legendary = (weights.legendary || 0) * (1 + luck * 0.008);
	weights.exotic = (weights.exotic || 0) * (1 + luck * 0.006);
	weights.epic = (weights.epic || 0) * (1 + luck * 0.004);
	
	const rarity = weightedPick(weights);
	let pool = carsByRarity[rarity] || [];
	
	// Apply pack filters
	if (filter && pool.length > 0) {
		pool = pool.filter(car => {
			if (filter.make && filter.make !== "None") {
				const carMake = Array.isArray(car.make) ? car.make : [car.make];
				if (!carMake.includes(filter.make)) return false;
			}
			if (filter.country && filter.country !== "None" && car.country !== filter.country) return false;
			if (filter.driveType && filter.driveType !== "None" && car.driveType !== filter.driveType) return false;
			if (filter.tyreType && filter.tyreType !== "None" && car.tyreType !== filter.tyreType) return false;
			if (filter.fuelType && filter.fuelType !== "None" && car.fuelType !== filter.fuelType) return false;
			if (filter.bodyStyle && filter.bodyStyle !== "None" && car.bodyStyle !== filter.bodyStyle) return false;
			if (filter.modelYear && filter.modelYear.start && filter.modelYear.end) {
				if (car.modelYear < filter.modelYear.start || car.modelYear > filter.modelYear.end) return false;
			}
			if (filter.tags && filter.tags !== "None") {
				if (!car.tags || !car.tags.includes(filter.tags)) return false;
			}
			return true;
		});
	}
	
	if (pool.length === 0) {
		// Fallback to any car of that rarity, then any car
		pool = carsByRarity[rarity]?.length > 0 ? carsByRarity[rarity] : gameCars;
	}
	
	return pool[Math.floor(Math.random() * pool.length)];
};

// ========== SAVE/LOAD HELPERS ==========
// Optimized save format: store car indices with counts instead of full IDs

const SAVE_KEY = 'cd_clicker_save_v2';

const compressSave = (data) => {
	try {
		// Convert collection from array of carIDs to {index: count} object
		const collectionCounts = {};
		for (const carId of data.collection) {
			const idx = carIdToIndex[carId];
			if (idx !== undefined) {
				collectionCounts[idx] = (collectionCounts[idx] || 0) + 1;
			}
		}
		
		// Convert garage from carIDs to indices
		const garageIndices = data.garage.map(id => carIdToIndex[id]).filter(i => i !== undefined);
		
		const compressed = {
			m: Math.floor(data.money), // money
			g: garageIndices, // garage (indices)
			c: collectionCounts, // collection {index: count}
			u: data.upgrades, // upgrades
			tc: data.totalCollects,
			te: Math.floor(data.totalEarnings),
			lc: data.lastCollect,
			st: data.hasClaimedStarter ? 1 : 0, // starter claimed
			pp: data.packPurchases || {}, // pack purchases
			v: 2, // version
		};
		
		return btoa(JSON.stringify(compressed));
	} catch (e) {
		console.error('Save compression error:', e);
		return null;
	}
};

const decompressSave = (code) => {
	try {
		const compressed = JSON.parse(atob(code));
		
		// Handle v2 format
		if (compressed.v === 2) {
			// Expand collection from {index: count} to array of carIDs
			const collection = [];
			for (const [idx, count] of Object.entries(compressed.c)) {
				const carId = indexToCarId[parseInt(idx)];
				if (carId) {
					for (let i = 0; i < count; i++) {
						collection.push(carId);
					}
				}
			}
			
			// Convert garage indices to carIDs
			const garage = compressed.g.map(idx => indexToCarId[idx]).filter(Boolean);
			
			return {
				money: compressed.m || 1000,
				garage,
				collection,
				upgrades: compressed.u || {},
				totalCollects: compressed.tc || 0,
				totalEarnings: compressed.te || 0,
				lastCollect: compressed.lc || 0,
				hasClaimedStarter: compressed.st === 1,
				packPurchases: compressed.pp || {},
			};
		}
		
		// Handle legacy format (v1)
		return {
			money: compressed.money || 1000,
			garage: compressed.garage || [],
			collection: compressed.collection || [],
			upgrades: compressed.upgrades || {},
			totalCollects: compressed.totalCollects || 0,
			totalEarnings: compressed.totalEarnings || 0,
			lastCollect: compressed.lastCollect || 0,
			hasClaimedStarter: compressed.hasClaimedStarter || false,
			packPurchases: compressed.packPurchases || {},
		};
	} catch (e) {
		console.error('Save decompression error:', e);
		return null;
	}
};

// ========== COMPONENTS ==========

const StatBox = ({ icon, label, value, color = '#fff', small = false }) => (
	<Paper sx={{ 
		p: small ? 1 : 1.5, 
		display: 'flex', 
		alignItems: 'center', 
		gap: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		minWidth: small ? 100 : 120,
	}}>
		{icon}
		<Box>
			<Typography variant="caption" color="text.secondary" sx={{ fontSize: small ? '0.65rem' : '0.75rem' }}>{label}</Typography>
			<Typography variant={small ? "body2" : "body1"} fontWeight="bold" sx={{ color }}>{value}</Typography>
		</Box>
	</Paper>
);

const CarCard = ({ car, onAction, actionLabel, actionDisabled, actionColor = 'primary', showRemove, onRemove, showSell, onSell, sellValue, compact = false }) => {
	const rarity = getRarity(car.cr);
	
	return (
		<Paper sx={{ 
			p: compact ? 1 : 1.5, 
			backgroundColor: 'rgba(30, 30, 30, 0.95)',
			border: `2px solid ${rarity.color}`,
			borderRadius: 2,
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
		}}>
			<Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
				<img 
					src={car.racehud} 
					alt="" 
					style={{ width: compact ? 60 : 80, height: compact ? 37 : 50, objectFit: 'cover', borderRadius: 4 }}
					loading="lazy"
				/>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography variant="body2" fontWeight="bold" noWrap title={getCarName(car)} sx={{ color: '#fff', fontSize: compact ? '0.7rem' : '0.875rem' }}>
						{getCarName(car)}
					</Typography>
					<Chip 
						label={rarity.name} 
						size="small" 
						sx={{ 
							backgroundColor: rarity.color, 
							color: '#fff',
							fontSize: '0.6rem',
							height: 18,
						}} 
					/>
					<Typography variant="caption" display="block" sx={{ color: '#aaa', fontSize: '0.65rem' }}>
						CR {car.cr}
					</Typography>
				</Box>
			</Box>
			
			{!compact && (
				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.5, fontSize: '0.7rem', mb: 1 }}>
					<Box>
						<Typography variant="caption" sx={{ color: '#888' }}>Speed</Typography>
						<Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>{car.topSpeed}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#888' }}>0-60</Typography>
						<Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>{car["0to60"]}s</Typography>
					</Box>
					<Box>
						<Typography variant="caption" sx={{ color: '#888' }}>HND</Typography>
						<Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>{car.handling}</Typography>
					</Box>
				</Box>
			)}
			
			<Box sx={{ mt: 'auto', display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
				{onAction && (
					<Button 
						size="small" 
						variant="contained" 
						color={actionColor}
						onClick={onAction}
						disabled={actionDisabled}
						sx={{ fontSize: '0.65rem', flex: 1, minWidth: 60 }}
					>
						{actionLabel}
					</Button>
				)}
				{showRemove && onRemove && (
					<IconButton size="small" color="error" onClick={onRemove} sx={{ p: 0.5 }}>
						<RemoveIcon fontSize="small" />
					</IconButton>
				)}
				{showSell && onSell && (
					<Button 
						size="small" 
						variant="outlined" 
						color="warning"
						onClick={onSell}
						startIcon={<SellIcon sx={{ fontSize: 14 }} />}
						sx={{ fontSize: '0.6rem' }}
					>
						{fmtMoney(sellValue)}
					</Button>
				)}
			</Box>
		</Paper>
	);
};

const PackCard = ({ pack, onOpen, disabled, money, luck, purchaseCount = 0 }) => {
	const canAfford = money >= pack.price;
	const cardCount = pack.packSequence?.length || 5;
	const borderColor = pack.packColor || '#444';
	const remaining = pack.maxPurchases ? pack.maxPurchases - purchaseCount : null;
	const soldOut = remaining !== null && remaining <= 0;
	
	return (
		<Paper sx={{ 
			p: 2, 
			textAlign: 'center',
			backgroundColor: 'rgba(30, 30, 30, 0.95)',
			border: `2px solid ${borderColor}`,
			borderRadius: 2,
			opacity: (canAfford && !soldOut) ? 1 : 0.6,
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			position: 'relative',
		}}>
			{remaining !== null && (
				<Chip 
					label={soldOut ? 'SOLD OUT' : `${remaining} left`}
					size="small"
					sx={{ 
						position: 'absolute', 
						top: 8, 
						right: 8, 
						backgroundColor: soldOut ? '#f44336' : borderColor,
						color: '#fff',
						fontSize: '0.65rem',
					}}
				/>
			)}
			{pack.pack ? (
				<img 
					src={pack.pack} 
					alt={pack.packName}
					style={{ width: '100%', height: 100, objectFit: 'contain', marginBottom: 8 }}
					loading="lazy"
				/>
			) : (
				<Box sx={{ 
					width: '100%', 
					height: 100, 
					display: 'flex', 
					alignItems: 'center', 
					justifyContent: 'center',
					backgroundColor: `${borderColor}22`,
					borderRadius: 1,
					mb: 1,
				}}>
					<InventoryIcon sx={{ fontSize: 48, color: borderColor }} />
				</Box>
			)}
			<Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>{pack.packName}</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ mb: 1, flex: 1 }}>
				{pack.description || `${cardCount} cards`}
			</Typography>
			<Typography variant="h6" fontWeight="bold" sx={{ color: '#4caf50' }}>
				{fmtMoney(pack.price)}
			</Typography>
			<Button
				variant="contained"
				onClick={() => onOpen(pack)}
				disabled={disabled || !canAfford || soldOut}
				sx={{ 
					mt: 1, 
					backgroundColor: (canAfford && !soldOut) ? '#4caf50' : '#666',
					'&:hover': { backgroundColor: '#388e3c' },
				}}
				startIcon={<CasinoIcon />}
				size="small"
			>
				{soldOut ? 'Sold Out' : 'Open'}
			</Button>
		</Paper>
	);
};

const UpgradeCard = ({ upgradeKey, upgrade, level, onBuy, money }) => {
	const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
	const currentValue = upgrade.baseValue + (upgrade.increment * level);
	const nextValue = upgrade.baseValue + (upgrade.increment * (level + 1));
	const canAfford = money >= cost;
	const maxed = level >= upgrade.maxLevel;
	
	return (
		<Paper sx={{ 
			p: 2, 
			backgroundColor: 'rgba(30, 30, 30, 0.95)',
			border: maxed ? '2px solid #ffd700' : '2px solid #444',
			borderRadius: 2,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
				<Box sx={{ color: maxed ? '#ffd700' : '#2196f3' }}>{upgrade.icon}</Box>
				<Box>
					<Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>
						{upgrade.name}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Level {level}/{upgrade.maxLevel}
					</Typography>
				</Box>
			</Box>
			
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
				{upgrade.description}
			</Typography>
			
			<Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
				Current: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{currentValue.toFixed(2)}</span>
				{!maxed && (
					<> → <span style={{ color: '#2196f3', fontWeight: 'bold' }}>{nextValue.toFixed(2)}</span></>
				)}
			</Typography>
			
			{maxed ? (
				<Chip label="MAXED" color="warning" size="small" />
			) : (
				<Button
					variant="contained"
					onClick={() => onBuy(upgradeKey)}
					disabled={!canAfford}
					fullWidth
					sx={{ backgroundColor: canAfford ? '#2196f3' : '#666' }}
				>
					Upgrade {fmtMoney(cost)}
				</Button>
			)}
		</Paper>
	);
};

// ========== MAIN COMPONENT ==========

const CDClicker = () => {
	// Game state
	const [money, setMoney] = useState(1000);
	const [garage, setGarage] = useState([]); // Active car IDs
	const [collection, setCollection] = useState([]); // All owned car IDs (can have duplicates)
	const [upgrades, setUpgrades] = useState({});
	const [totalCollects, setTotalCollects] = useState(0);
	const [totalEarnings, setTotalEarnings] = useState(0);
	const [hasClaimedStarter, setHasClaimedStarter] = useState(false);
	const [packPurchases, setPackPurchases] = useState({}); // { packID: count }
	
	// UI state
	const [tab, setTab] = useState(0);
	const [packOpening, setPackOpening] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [saveDialog, setSaveDialog] = useState(false);
	const [importCode, setImportCode] = useState('');
	const [collectionFilter, setCollectionFilter] = useState('all');
	const [collectionSearch, setCollectionSearch] = useState('');
	const [collectionPage, setCollectionPage] = useState(1);
	const [collectionSort, setCollectionSort] = useState('cr-desc'); // Sort option
	const [packSearch, setPackSearch] = useState('');
	
	// Cooldown state
	const [lastCollect, setLastCollect] = useState(0);
	const [now, setNow] = useState(Date.now());
	
	// Timer for cooldown and passive income
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 100);
		return () => clearInterval(interval);
	}, []);
	
	// Load save on mount
	useEffect(() => {
		const saved = localStorage.getItem(SAVE_KEY);
		if (saved) {
			const data = decompressSave(saved);
			if (data) {
				setMoney(data.money || 1000);
				setGarage(data.garage || []);
				setCollection(data.collection || []);
				setUpgrades(data.upgrades || {});
				setTotalCollects(data.totalCollects || 0);
				setTotalEarnings(data.totalEarnings || 0);
				setLastCollect(data.lastCollect || 0);
				setHasClaimedStarter(data.hasClaimedStarter || false);
				setPackPurchases(data.packPurchases || {});
			}
		}
	}, []);
	
	// Auto-save
	useEffect(() => {
		const data = { money, garage, collection, upgrades, totalCollects, totalEarnings, lastCollect, hasClaimedStarter, packPurchases };
		localStorage.setItem(SAVE_KEY, compressSave(data));
	}, [money, garage, collection, upgrades, totalCollects, totalEarnings, lastCollect, hasClaimedStarter, packPurchases]);
	
	// Upgrade values
	const getUpgradeLevel = (key) => upgrades[key] || 0;
	const getUpgradeValue = (key) => {
		const upgrade = UPGRADES[key];
		const level = getUpgradeLevel(key);
		return upgrade.baseValue + (upgrade.increment * level);
	};
	
	// Derived values
	const maxGarageSlots = getUpgradeValue('garageSlots');
	const passiveIncomePerCar = getUpgradeValue('passiveIncome');
	const bonusLuck = getUpgradeValue('luckBonus');
	const earningsMultiplier = getUpgradeValue('earningsMultiplier');
	
	// Calculate set bonuses from garage
	const setBonuses = useMemo(() => {
		const bonuses = {
			brand: { count: 0, name: null, bonus: 0 },
			country: { count: 0, name: null, bonus: 0 },
			driveType: { count: 0, name: null, bonus: 0 },
			tyreType: { count: 0, name: null, bonus: 0 },
			bodyStyle: { count: 0, name: null, bonus: 0 },
		};
		
		if (garage.length < 3) return bonuses;
		
		// Count occurrences
		const counts = {
			brand: {},
			country: {},
			driveType: {},
			tyreType: {},
			bodyStyle: {},
		};
		
		for (const carId of garage) {
			const car = gameCars.find(c => c.carID === carId);
			if (!car) continue;
			
			const make = Array.isArray(car.make) ? car.make[0] : car.make;
			if (make) counts.brand[make] = (counts.brand[make] || 0) + 1;
			if (car.country) counts.country[car.country] = (counts.country[car.country] || 0) + 1;
			if (car.driveType) counts.driveType[car.driveType] = (counts.driveType[car.driveType] || 0) + 1;
			if (car.tyreType) counts.tyreType[car.tyreType] = (counts.tyreType[car.tyreType] || 0) + 1;
			if (car.bodyStyle) counts.bodyStyle[car.bodyStyle] = (counts.bodyStyle[car.bodyStyle] || 0) + 1;
		}
		
		// Find best match for each category (need 3+ for bonus)
		for (const [category, items] of Object.entries(counts)) {
			let maxCount = 0;
			let maxName = null;
			for (const [name, count] of Object.entries(items)) {
				if (count > maxCount) {
					maxCount = count;
					maxName = name;
				}
			}
			if (maxCount >= 3) {
				bonuses[category].count = maxCount;
				bonuses[category].name = maxName;
				// Bonus scales: 3 = 10%, 4 = 20%, 5 = 35%
				bonuses[category].bonus = maxCount === 3 ? 0.10 : maxCount === 4 ? 0.20 : 0.35;
			}
		}
		
		return bonuses;
	}, [garage]);
	
	// Passive income calculations (after setBonuses is defined)
	const uniqueCarCount = new Set(collection).size;
	const bodyStyleBonus = setBonuses.bodyStyle.bonus > 0 ? (1 + setBonuses.bodyStyle.bonus) : 1;
	const passiveIncomePerSecond = uniqueCarCount * passiveIncomePerCar * earningsMultiplier * bodyStyleBonus;
	
	// Calculate stats from garage
	const garageStats = useMemo(() => {
		let luck = bonusLuck;
		let cooldownReduction = 0;
		let earnings = 1;
		let mraBonus = 0;
		let olaBonus = 0;
		
		for (const carId of garage) {
			const car = gameCars.find(c => c.carID === carId);
			if (!car) continue;
			
			// Core stats
			luck += car.topSpeed / 30; // Higher top speed = more luck
			cooldownReduction += (15 - Math.min(15, car["0to60"])) * 0.03; // 0-60 affects cooldown slightly
			earnings += car.handling / 100; // Better handling = more earnings
			
			// Additional stats if available
			if (car.mra) mraBonus += car.mra / 500; // MRA boosts earnings (higher = better)
			if (car.ola) olaBonus += (100 - Math.min(100, car.ola)) / 300; // OLA boosts luck (lower = better)
		}
		
		// Apply set bonuses
		// Brand bonus: Earnings multiplier
		if (setBonuses.brand.bonus > 0) {
			earnings *= (1 + setBonuses.brand.bonus);
		}
		// Country bonus: Luck multiplier  
		if (setBonuses.country.bonus > 0) {
			luck *= (1 + setBonuses.country.bonus);
		}
		// DriveType bonus: Cooldown reduction
		if (setBonuses.driveType.bonus > 0) {
			cooldownReduction += setBonuses.driveType.bonus * 0.5;
		}
		// TyreType bonus: Extra earnings from grip
		if (setBonuses.tyreType.bonus > 0) {
			earnings *= (1 + setBonuses.tyreType.bonus * 0.5);
		}
		// BodyStyle bonus: Passive income multiplier (applied elsewhere)
		
		// Add MRA and OLA bonuses
		earnings += mraBonus;
		luck += olaBonus;
		
		return { 
			luck, 
			cooldownReduction, 
			earnings: earnings * earningsMultiplier,
			mraBonus,
			olaBonus,
		};
	}, [garage, bonusLuck, earningsMultiplier, setBonuses]);
	
	// Passive income tick
	useEffect(() => {
		if (passiveIncomePerSecond <= 0) return;
		
		const interval = setInterval(() => {
			setMoney(prev => prev + passiveIncomePerSecond / 10);
			setTotalEarnings(prev => prev + passiveIncomePerSecond / 10);
		}, 100);
		
		return () => clearInterval(interval);
	}, [passiveIncomePerSecond]);
	
	// Cooldown calculation
	const baseCooldown = 5; // 5 seconds base
	const cooldownSeconds = Math.max(2, baseCooldown - garageStats.cooldownReduction); // Min 2 seconds (was 1)
	const cooldownMs = cooldownSeconds * 1000;
	const timeLeft = Math.max(0, (lastCollect + cooldownMs) - now);
	const canCollect = timeLeft <= 0;
	const cooldownProgress = 100 - (timeLeft / cooldownMs * 100);
	
	// Base earnings - balanced for pack prices
	const baseEarnings = 250; // $250 base (was $10)
	const currentEarnings = Math.round(baseEarnings * garageStats.earnings);
	
	// Collect money
	const handleCollect = () => {
		if (!canCollect) return;
		
		setMoney(prev => prev + currentEarnings);
		setTotalCollects(prev => prev + 1);
		setTotalEarnings(prev => prev + currentEarnings);
		setLastCollect(Date.now());
	};
	
	// Open pack
	const handleOpenPack = (pack) => {
		if (money < pack.price) return;
		
		// Check purchase limit for limited packs
		if (pack.maxPurchases) {
			const purchased = packPurchases[pack.packID] || 0;
			if (purchased >= pack.maxPurchases) return;
			setPackPurchases(prev => ({ ...prev, [pack.packID]: purchased + 1 }));
		}
		
		setMoney(prev => prev - pack.price);
		
		// Generate cards from pack sequence
		const cards = pack.packSequence.map(slot => 
			getRandomCarFromSlot(slot, pack.filter, garageStats.luck)
		);
		
		setPackOpening({ cards, revealed: [], pack });
	};
	
	// Reveal card
	const revealCard = (index) => {
		if (!packOpening) return;
		setPackOpening(prev => ({
			...prev,
			revealed: [...prev.revealed, index],
		}));
	};
	
	// Reveal all
	const revealAll = () => {
		if (!packOpening) return;
		setPackOpening(prev => ({
			...prev,
			revealed: prev.cards.map((_, i) => i),
		}));
	};
	
	// Collect pack cards
	const collectPackCards = () => {
		if (!packOpening) return;
		
		const newCarIds = packOpening.cards.map(c => c.carID);
		setCollection(prev => [...prev, ...newCarIds]);
		setPackOpening(null);
		setSnackbar({ open: true, message: `Added ${newCarIds.length} cars to collection!`, severity: 'success' });
	};
	
	// Garage management
	const addToGarage = (carId) => {
		if (garage.length >= maxGarageSlots) return;
		if (garage.includes(carId)) return;
		setGarage(prev => [...prev, carId]);
	};
	
	const removeFromGarage = (carId) => {
		setGarage(prev => prev.filter(id => id !== carId));
	};
	
	// Sell car
	const sellCar = (carId) => {
		const car = gameCars.find(c => c.carID === carId);
		if (!car) return;
		
		const value = getSellValue(car);
		
		// Remove from garage if present
		if (garage.includes(carId)) {
			setGarage(prev => prev.filter(id => id !== carId));
		}
		
		// Remove one instance from collection
		const idx = collection.indexOf(carId);
		if (idx !== -1) {
			setCollection(prev => {
				const newColl = [...prev];
				newColl.splice(idx, 1);
				return newColl;
			});
		}
		
		setMoney(prev => prev + value);
		setSnackbar({ open: true, message: `Sold for ${fmtMoney(value)}!`, severity: 'success' });
	};
	
	// Buy upgrade
	const buyUpgrade = (key) => {
		const upgrade = UPGRADES[key];
		const level = getUpgradeLevel(key);
		if (level >= upgrade.maxLevel) return;
		
		const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
		if (money < cost) return;
		
		setMoney(prev => prev - cost);
		setUpgrades(prev => ({ ...prev, [key]: level + 1 }));
		setSnackbar({ open: true, message: `${upgrade.name} upgraded to level ${level + 1}!`, severity: 'success' });
	};
	
	// Claim free starter pack
	const claimStarterPack = () => {
		if (hasClaimedStarter) return;
		
		// Give 5 random cars (mix of standard, common, uncommon)
		const starterWeights = { standard: 30, common: 50, uncommon: 20, rare: 0, epic: 0, exotic: 0, legendary: 0, mystic: 0 };
		const starterCars = [];
		for (let i = 0; i < 5; i++) {
			starterCars.push(getRandomCarFromSlot(starterWeights, {}, 0));
		}
		
		const newCarIds = starterCars.map(c => c.carID);
		setCollection(prev => [...prev, ...newCarIds]);
		setHasClaimedStarter(true);
		setSnackbar({ open: true, message: '🎉 Welcome! You received 5 free starter cars!', severity: 'success' });
	};
	
	// Unequip all cars from garage
	const unequipAll = () => {
		setGarage([]);
		setSnackbar({ open: true, message: 'All cars removed from garage', severity: 'info' });
	};
	
	// Save/Load
	const exportSave = () => {
		const data = { money, garage, collection, upgrades, totalCollects, totalEarnings, lastCollect, hasClaimedStarter, packPurchases };
		const code = compressSave(data);
		navigator.clipboard.writeText(code);
		setSnackbar({ open: true, message: 'Save code copied!', severity: 'success' });
	};
	
	const importSave = () => {
		const data = decompressSave(importCode);
		if (!data) {
			setSnackbar({ open: true, message: 'Invalid save code!', severity: 'error' });
			return;
		}
		
		setMoney(data.money || 1000);
		setGarage(data.garage || []);
		setCollection(data.collection || []);
		setUpgrades(data.upgrades || {});
		setTotalCollects(data.totalCollects || 0);
		setTotalEarnings(data.totalEarnings || 0);
		setLastCollect(data.lastCollect || 0);
		setHasClaimedStarter(data.hasClaimedStarter || false);
		setPackPurchases(data.packPurchases || {});
		setSaveDialog(false);
		setImportCode('');
		setSnackbar({ open: true, message: 'Game loaded!', severity: 'success' });
	};
	
	const resetGame = () => {
		if (!window.confirm('Delete ALL progress?')) return;
		
		setMoney(1000);
		setGarage([]);
		setCollection([]);
		setUpgrades({});
		setTotalCollects(0);
		setTotalEarnings(0);
		setLastCollect(0);
		setHasClaimedStarter(false);
		setPackPurchases({});
		localStorage.removeItem(SAVE_KEY);
		setSnackbar({ open: true, message: 'Game reset!', severity: 'info' });
	};
	
	// Collection filtering with counts
	const collectionWithCounts = useMemo(() => {
		const counts = {};
		for (const carId of collection) {
			counts[carId] = (counts[carId] || 0) + 1;
		}
		
		return Object.entries(counts)
			.map(([carId, count]) => {
				const car = gameCars.find(c => c.carID === carId);
				return car ? { car, count } : null;
			})
			.filter(Boolean);
	}, [collection]);
	
	const filteredCollection = useMemo(() => {
		let result = collectionWithCounts.filter(({ car }) => {
			if (collectionFilter !== 'all') {
				const rarity = getRarity(car.cr).key;
				if (rarity !== collectionFilter) return false;
			}
			
			if (collectionSearch.trim()) {
				const name = getCarName(car).toLowerCase();
				if (!name.includes(collectionSearch.toLowerCase())) return false;
			}
			
			return true;
		});
		
		// Sort collection
		result.sort((a, b) => {
			switch (collectionSort) {
				case 'cr-desc': return b.car.cr - a.car.cr;
				case 'cr-asc': return a.car.cr - b.car.cr;
				case 'name-asc': return getCarName(a.car).localeCompare(getCarName(b.car));
				case 'name-desc': return getCarName(b.car).localeCompare(getCarName(a.car));
				case 'speed-desc': return b.car.topSpeed - a.car.topSpeed;
				case 'speed-asc': return a.car.topSpeed - b.car.topSpeed;
				case 'accel-asc': return a.car["0to60"] - b.car["0to60"];
				case 'accel-desc': return b.car["0to60"] - a.car["0to60"];
				case 'handling-desc': return b.car.handling - a.car.handling;
				case 'handling-asc': return a.car.handling - b.car.handling;
				case 'count-desc': return b.count - a.count;
				case 'count-asc': return a.count - b.count;
				default: return 0;
			}
		});
		
		return result;
	}, [collectionWithCounts, collectionFilter, collectionSearch, collectionSort]);
	
	const filteredPacks = useMemo(() => {
		// Filter out sold out limited packs
		const availablePacks = allPacks.filter(pack => {
			if (pack.maxPurchases) {
				const purchased = packPurchases[pack.packID] || 0;
				if (purchased >= pack.maxPurchases) return false;
			}
			return true;
		});
		
		if (!packSearch.trim()) return availablePacks;
		return availablePacks.filter(p => 
			p.packName.toLowerCase().includes(packSearch.toLowerCase())
		);
	}, [packSearch, packPurchases]);
	
	const CARS_PER_PAGE = 12;
	const totalPages = Math.ceil(filteredCollection.length / CARS_PER_PAGE);
	const paginatedCollection = filteredCollection.slice(
		(collectionPage - 1) * CARS_PER_PAGE,
		collectionPage * CARS_PER_PAGE
	);
	
	return (
		<Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
			{/* Header */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<Typography variant="h5" fontWeight="bold">🚗 CD Clicker</Typography>
					
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
						<StatBox icon={<LocalAtmIcon sx={{ color: '#4caf50' }} />} label="Money" value={fmtMoney(money)} color="#4caf50" small />
						<StatBox icon={<GarageIcon sx={{ color: '#2196f3' }} />} label="Unique" value={`${uniqueCarCount}/${gameCars.length}`} color="#2196f3" small />
						{passiveIncomePerSecond > 0 && (
							<StatBox icon={<TrendingUpIcon sx={{ color: '#ff9800' }} />} label="$/sec" value={`+${passiveIncomePerSecond.toFixed(1)}`} color="#ff9800" small />
						)}
					</Box>
					
					<Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={() => setSaveDialog(true)}>
						Save/Load
					</Button>
				</Box>
			</Paper>
			
			{/* Tabs */}
			<Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
				<Tab label="Play" icon={<DirectionsCarIcon />} iconPosition="start" />
				<Tab label="Packs" icon={<StorefrontIcon />} iconPosition="start" />
				<Tab label={`Collection (${collection.length})`} icon={<InventoryIcon />} iconPosition="start" />
				<Tab label="Upgrades" icon={<UpgradeIcon />} iconPosition="start" />
			</Tabs>
			
			{/* Play Tab */}
			{tab === 0 && (
				<Box>
					{/* Free Starter Pack Banner */}
					{!hasClaimedStarter && (
						<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.2)', border: '2px solid #4caf50', textAlign: 'center' }}>
							<Typography variant="h6" sx={{ color: '#4caf50', mb: 1 }}>🎁 Welcome Gift!</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Claim your free starter pack with 5 cars to begin your collection!
							</Typography>
							<Button variant="contained" color="success" onClick={claimStarterPack} startIcon={<CasinoIcon />}>
								Claim Free Starter Pack
							</Button>
						</Paper>
					)}
					
					<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>Garage Bonuses</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							<StatBox icon={<CasinoIcon sx={{ color: '#9c27b0' }} />} label="Luck" value={`+${garageStats.luck.toFixed(1)}%`} color="#9c27b0" small />
							<StatBox icon={<TimerIcon sx={{ color: '#00bcd4' }} />} label="Cooldown" value={`${cooldownSeconds.toFixed(1)}s`} color="#00bcd4" small />
							<StatBox icon={<LocalAtmIcon sx={{ color: '#4caf50' }} />} label="Per Click" value={fmtMoney(currentEarnings)} color="#4caf50" small />
						</Box>
						
						{/* Set Bonuses */}
						{(setBonuses.brand.bonus > 0 || setBonuses.country.bonus > 0 || setBonuses.driveType.bonus > 0 || setBonuses.tyreType.bonus > 0 || setBonuses.bodyStyle.bonus > 0) && (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle2" color="text.secondary" gutterBottom>Active Set Bonuses</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{setBonuses.brand.bonus > 0 && (
										<Chip 
											label={`${setBonuses.brand.name} (${setBonuses.brand.count}) → +${Math.round(setBonuses.brand.bonus * 100)}% Earnings`}
											size="small"
											sx={{ backgroundColor: '#ff9800', color: '#fff' }}
										/>
									)}
									{setBonuses.country.bonus > 0 && (
										<Chip 
											label={`${setBonuses.country.name} (${setBonuses.country.count}) → +${Math.round(setBonuses.country.bonus * 100)}% Luck`}
											size="small"
											sx={{ backgroundColor: '#2196f3', color: '#fff' }}
										/>
									)}
									{setBonuses.driveType.bonus > 0 && (
										<Chip 
											label={`${setBonuses.driveType.name} (${setBonuses.driveType.count}) → -${(setBonuses.driveType.bonus * 0.5).toFixed(1)}s Cooldown`}
											size="small"
											sx={{ backgroundColor: '#00bcd4', color: '#fff' }}
										/>
									)}
									{setBonuses.tyreType.bonus > 0 && (
										<Chip 
											label={`${setBonuses.tyreType.name} (${setBonuses.tyreType.count}) → +${Math.round(setBonuses.tyreType.bonus * 50)}% Earnings`}
											size="small"
											sx={{ backgroundColor: '#4caf50', color: '#fff' }}
										/>
									)}
									{setBonuses.bodyStyle.bonus > 0 && (
										<Chip 
											label={`${setBonuses.bodyStyle.name} (${setBonuses.bodyStyle.count}) → +${Math.round(setBonuses.bodyStyle.bonus * 100)}% Passive`}
											size="small"
											sx={{ backgroundColor: '#9c27b0', color: '#fff' }}
										/>
									)}
								</Box>
							</Box>
						)}
						
						{/* Set bonus hint */}
						{garage.length >= 1 && garage.length < 3 && (
							<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
								💡 Add 3+ cars of the same Brand, Country, Drive Type, Tyre Type, or Body Style for set bonuses!
							</Typography>
						)}
					</Paper>
					
					<Paper sx={{ p: 3, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
						<Button
							variant="contained"
							size="large"
							onClick={handleCollect}
							disabled={!canCollect}
							sx={{ px: 6, py: 2, fontSize: '1.2rem', backgroundColor: canCollect ? '#4caf50' : '#666' }}
						>
							{canCollect ? `Collect ${fmtMoney(currentEarnings)}` : `${(timeLeft / 1000).toFixed(1)}s`}
						</Button>
						<LinearProgress variant="determinate" value={cooldownProgress} sx={{ mt: 2, height: 8, borderRadius: 4 }} />
					</Paper>
					
					<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
							<Typography variant="h6">Garage ({garage.length}/{maxGarageSlots})</Typography>
							{garage.length > 0 && (
								<Button 
									variant="outlined" 
									color="warning" 
									size="small" 
									onClick={unequipAll}
									startIcon={<RemoveIcon />}
								>
									Unequip All
								</Button>
							)}
						</Box>
						{garage.length === 0 ? (
							<Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
								Add cars from Collection to boost stats!
							</Typography>
						) : (
							<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
								{garage.map(carId => {
									const car = gameCars.find(c => c.carID === carId);
									if (!car) return null;
									return <CarCard key={carId} car={car} showRemove onRemove={() => removeFromGarage(carId)} compact />;
								})}
							</Box>
						)}
					</Paper>
				</Box>
			)}
			
			{/* Packs Tab */}
			{tab === 1 && (
				<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
						<Typography variant="h6">Packs ({filteredPacks.length})</Typography>
						<TextField size="small" placeholder="Search packs..." value={packSearch} onChange={e => setPackSearch(e.target.value)} sx={{ width: 200 }} />
					</Box>
					
					{filteredPacks.length === 0 ? (
						<Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
							No packs available with prices.
						</Typography>
					) : (
						<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
							{filteredPacks.map(pack => (
								<PackCard key={pack.packID || pack.packName} pack={pack} onOpen={handleOpenPack} money={money} luck={garageStats.luck} disabled={!!packOpening} purchaseCount={packPurchases[pack.packID] || 0} />
							))}
						</Box>
					)}
				</Paper>
			)}
			
			{/* Collection Tab */}
			{tab === 2 && (
				<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
						<Typography variant="h6">Collection ({collection.length} total, {uniqueCarCount} unique)</Typography>
						
						<FormControl size="small" sx={{ minWidth: 120 }}>
							<InputLabel>Rarity</InputLabel>
							<Select value={collectionFilter} onChange={e => { setCollectionFilter(e.target.value); setCollectionPage(1); }} label="Rarity">
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
						
						<FormControl size="small" sx={{ minWidth: 140 }}>
							<InputLabel>Sort By</InputLabel>
							<Select value={collectionSort} onChange={e => { setCollectionSort(e.target.value); setCollectionPage(1); }} label="Sort By">
								<MenuItem value="cr-desc">CR (High → Low)</MenuItem>
								<MenuItem value="cr-asc">CR (Low → High)</MenuItem>
								<MenuItem value="name-asc">Name (A → Z)</MenuItem>
								<MenuItem value="name-desc">Name (Z → A)</MenuItem>
								<MenuItem value="speed-desc">Speed (High → Low)</MenuItem>
								<MenuItem value="speed-asc">Speed (Low → High)</MenuItem>
								<MenuItem value="accel-asc">0-60 (Fast → Slow)</MenuItem>
								<MenuItem value="accel-desc">0-60 (Slow → Fast)</MenuItem>
								<MenuItem value="handling-desc">Handling (High → Low)</MenuItem>
								<MenuItem value="handling-asc">Handling (Low → High)</MenuItem>
								<MenuItem value="count-desc">Count (High → Low)</MenuItem>
								<MenuItem value="count-asc">Count (Low → High)</MenuItem>
							</Select>
						</FormControl>
						
						<TextField size="small" placeholder="Search..." value={collectionSearch} onChange={e => { setCollectionSearch(e.target.value); setCollectionPage(1); }} />
						
						{garage.length > 0 && (
							<Button 
								variant="outlined" 
								color="warning" 
								size="small" 
								onClick={unequipAll}
								startIcon={<RemoveIcon />}
							>
								Unequip All ({garage.length})
							</Button>
						)}
					</Box>
					
					{filteredCollection.length === 0 ? (
						<Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
							{collection.length === 0 ? "Open packs to get cars!" : "No cars match filter."}
						</Typography>
					) : (
						<>
							<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
								{paginatedCollection.map(({ car, count }) => (
									<Box key={car.carID} sx={{ position: 'relative' }}>
										{count > 1 && (
											<Chip label={`×${count}`} size="small" sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, backgroundColor: '#333', color: '#fff' }} />
										)}
										<CarCard 
											car={car}
											onAction={() => addToGarage(car.carID)}
											actionLabel={garage.includes(car.carID) ? 'In Garage' : garage.length >= maxGarageSlots ? 'Garage Full' : 'Add'}
											actionDisabled={garage.length >= maxGarageSlots || garage.includes(car.carID)}
											actionColor="success"
											showRemove={garage.includes(car.carID)}
											onRemove={() => removeFromGarage(car.carID)}
											showSell
											onSell={() => sellCar(car.carID)}
											sellValue={getSellValue(car)}
										/>
									</Box>
								))}
							</Box>
							
							{totalPages > 1 && (
								<Stack sx={{ mt: 2 }}>
									<Pagination count={totalPages} page={collectionPage} onChange={(e, v) => setCollectionPage(v)} sx={{ display: 'flex', justifyContent: 'center' }} />
								</Stack>
							)}
						</>
					)}
				</Paper>
			)}
			
			{/* Upgrades Tab */}
			{tab === 3 && (
				<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Typography variant="h6" gutterBottom>Upgrades</Typography>
					<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
						{Object.entries(UPGRADES).map(([key, upgrade]) => (
							<UpgradeCard key={key} upgradeKey={key} upgrade={upgrade} level={getUpgradeLevel(key)} onBuy={buyUpgrade} money={money} />
						))}
					</Box>
				</Paper>
			)}
			
			{/* Pack Opening Dialog */}
			<Dialog open={!!packOpening} maxWidth="md" fullWidth>
				<DialogTitle>{packOpening?.pack?.packName || 'Pack Opening'}</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', py: 2 }}>
						{packOpening?.cards.map((car, idx) => {
							const isRevealed = packOpening.revealed.includes(idx);
							
							return (
								<Box key={idx} sx={{ width: 180 }}>
									{isRevealed ? (
										<CarCard car={car} compact />
									) : (
										<Paper sx={{ p: 4, textAlign: 'center', cursor: 'pointer', backgroundColor: '#333', '&:hover': { backgroundColor: '#444' }, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => revealCard(idx)}>
											<Typography variant="h3">❓</Typography>
										</Paper>
									)}
								</Box>
							);
						})}
					</Box>
				</DialogContent>
				<DialogActions>
					{packOpening?.revealed.length < packOpening?.cards.length && (
						<Button onClick={revealAll}>Reveal All</Button>
					)}
					<Button variant="contained" onClick={collectPackCards} disabled={packOpening?.revealed.length !== packOpening?.cards.length}>
						{packOpening?.revealed.length === packOpening?.cards.length ? 'Collect All' : `${packOpening?.revealed.length || 0}/${packOpening?.cards.length || 0}`}
					</Button>
				</DialogActions>
			</Dialog>
			
			{/* Save Dialog */}
			<Dialog open={saveDialog} onClose={() => setSaveDialog(false)} maxWidth="sm" fullWidth>
				<DialogTitle>Save / Load</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						Auto-saves to browser. Export to backup or transfer.
					</Typography>
					
					<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
						<Button variant="contained" startIcon={<FileDownloadIcon />} onClick={exportSave}>Export</Button>
						<Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={resetGame}>Reset</Button>
					</Box>
					
					<Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Import</Typography>
					<TextField fullWidth placeholder="Paste save code..." value={importCode} onChange={e => setImportCode(e.target.value)} multiline rows={2} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setSaveDialog(false)}>Cancel</Button>
					<Button variant="contained" startIcon={<FileUploadIcon />} onClick={importSave} disabled={!importCode.trim()}>Import</Button>
				</DialogActions>
			</Dialog>
			
			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
				<Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
			</Snackbar>
		</Box>
	);
};

export default CDClicker;
