import { useState, useMemo, useCallback, memo } from 'react';
import { Box, Typography, Paper, TextField, Chip, Tooltip, Button, LinearProgress, IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useGame } from '../context';
import { getThumbnailUrl } from '../../imageUtils';
import { fmtMoney } from '../utils/formatters';

// Rarity colors
const RARITY_COLORS = {
	standard: '#9e9e9e',
	common: '#616161',
	uncommon: '#4caf50',
	rare: '#03a9f4',
	epic: '#f44336',
	exotic: '#9c27b0',
	legendary: '#ffd700',
	mystic: '#ff69b4',
};

// Pre-calculate odds for a pack (called once per pack at tab level)
const calculatePackOdds = (packSequence, luck) => {
	if (!packSequence || packSequence.length === 0) return null;
	const bestOdds = {};
	for (const slot of packSequence) {
		const weights = { ...slot };
		weights.mystic = (weights.mystic || 0) * (1 + luck * 0.01);
		weights.legendary = (weights.legendary || 0) * (1 + luck * 0.008);
		weights.exotic = (weights.exotic || 0) * (1 + luck * 0.006);
		weights.epic = (weights.epic || 0) * (1 + luck * 0.004);
		const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
		for (const [rarity, weight] of Object.entries(weights)) {
			if (weight > 0) {
				const chance = (weight / total) * 100;
				if (!bestOdds[rarity] || chance > bestOdds[rarity]) bestOdds[rarity] = chance;
			}
		}
	}
	return bestOdds;
};

// Odds display - only rendered when expanded
const OddsDisplay = memo(({ odds }) => {
	if (!odds) return null;
	const rarities = ['mystic', 'legendary', 'exotic', 'epic', 'rare', 'uncommon', 'common', 'standard'];
	const display = rarities.filter(r => odds[r] > 0);
	return (
		<Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 1 }}>
			{display.map(r => (
				<Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
					<Typography sx={{ fontSize: '0.6rem', color: RARITY_COLORS[r], fontWeight: 'bold', width: 55, textTransform: 'capitalize' }}>{r}</Typography>
					<LinearProgress variant="determinate" value={Math.min(odds[r], 100)} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: RARITY_COLORS[r] } }} />
					<Typography sx={{ fontSize: '0.6rem', color: '#888', width: 35, textAlign: 'right' }}>{odds[r].toFixed(1)}%</Typography>
				</Box>
			))}
		</Box>
	);
});

// Pack card - memoized, no blur effects
const PackCard = memo(({ pack, onOpen, canAfford, disabled, remaining, isFavorite, onToggleFavorite, showOddsBtn, odds, luck }) => {
	const [oddsOpen, setOddsOpen] = useState(false);
	const borderColor = pack.packColor || '#444';
	const cardCount = pack.packSequence?.length || 3;
	const repetition = pack.repetition || 1;
	const totalCards = cardCount * repetition;
	const hasFilter = pack.filter && Object.keys(pack.filter).some(k => pack.filter[k] && pack.filter[k] !== 'None');

	return (
		<Box sx={{ 
			bgcolor: 'rgba(30,30,30,0.95)',
			borderRadius: '10px',
			border: `2px solid ${isFavorite ? '#ffd700' : borderColor}`,
			overflow: 'hidden',
			opacity: canAfford ? 1 : 0.6,
		}}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.75, py: 0.5, bgcolor: `${borderColor}33` }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					{hasFilter && <FilterAltIcon sx={{ fontSize: 11, color: borderColor }} />}
					<Typography sx={{ fontSize: '0.55rem', color: '#888' }}>{totalCards} cards</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
					{remaining !== null && <Chip label={remaining} size="small" sx={{ bgcolor: borderColor, color: '#fff', fontSize: '0.5rem', height: 15, minWidth: 18 }} />}
					{repetition > 1 && <Chip label={`×${repetition}`} size="small" sx={{ bgcolor: '#9c27b0', color: '#fff', fontSize: '0.5rem', height: 15 }} />}
					<IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleFavorite(pack.packID); }} sx={{ p: 0.2 }}>
						{isFavorite ? <StarIcon sx={{ fontSize: 14, color: '#ffd700' }} /> : <StarBorderIcon sx={{ fontSize: 14, color: '#555' }} />}
					</IconButton>
				</Box>
			</Box>

			{/* Image */}
			<Box sx={{ p: 1, display: 'flex', justifyContent: 'center', minHeight: 60 }}>
				{pack.pack ? (
					<img src={getThumbnailUrl(pack.pack, 100, 55)} alt="" style={{ maxWidth: 90, maxHeight: 55, objectFit: 'contain' }} loading="lazy" />
				) : (
					<InventoryIcon sx={{ fontSize: 36, color: borderColor }} />
				)}
			</Box>

			{/* Name & Desc */}
			<Box sx={{ px: 0.75, pb: 0.5 }}>
				<Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.15 }}>{pack.packName}</Typography>
				{pack.description && <Typography sx={{ color: '#666', fontSize: '0.55rem', textAlign: 'center', mt: 0.25 }}>{pack.description}</Typography>}
			</Box>

			{/* Odds toggle */}
			{showOddsBtn && odds && (
				<Box sx={{ px: 0.75 }}>
					<Box onClick={() => setOddsOpen(!oddsOpen)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, cursor: 'pointer', color: '#555', '&:hover': { color: '#888' } }}>
						<InfoOutlinedIcon sx={{ fontSize: 10 }} />
						<Typography sx={{ fontSize: '0.5rem' }}>{oddsOpen ? 'Hide' : 'Odds'}{luck > 0 && ` +${luck.toFixed(0)}%`}</Typography>
					</Box>
					{oddsOpen && <OddsDisplay odds={odds} />}
				</Box>
			)}

			{/* Price & Open */}
			<Box sx={{ p: 0.75, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.2)' }}>
				<Typography sx={{ color: canAfford ? '#4caf50' : '#e57373', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'center' }}>{fmtMoney(pack.price)}</Typography>
				<Button
					variant="contained"
					onClick={() => onOpen(pack)}
					disabled={disabled || !canAfford}
					fullWidth
					size="small"
					sx={{ mt: 0.5, bgcolor: canAfford ? '#4caf50' : '#3a3a3a', fontSize: '0.7rem', py: 0.4, minHeight: 24, '&:hover': { bgcolor: '#388e3c' }, '&.Mui-disabled': { bgcolor: '#2a2a2a', color: '#444' } }}
					startIcon={<CasinoIcon sx={{ fontSize: 12 }} />}
				>
					Open
				</Button>
			</Box>
		</Box>
	);
});

// Category header
const CategoryHeader = memo(({ title, icon, count, color, isOpen, onToggle }) => (
	<Box onClick={onToggle} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: isOpen ? '8px 8px 0 0' : '8px', border: `1px solid ${color}40`, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
		{icon}
		<Typography sx={{ color, fontWeight: 'bold', fontSize: '0.9rem', flex: 1 }}>{title}</Typography>
		<Chip label={count} size="small" sx={{ bgcolor: `${color}25`, color, height: 18, fontSize: '0.65rem' }} />
		{isOpen ? <ExpandLessIcon sx={{ color, fontSize: 18 }} /> : <ExpandMoreIcon sx={{ color, fontSize: 18 }} />}
	</Box>
));

// Category grid
const CategoryGrid = memo(({ packs, isOpen, color, getCardProps }) => {
	if (!isOpen || packs.length === 0) return null;
	return (
		<Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: '0 0 8px 8px', border: `1px solid ${color}40`, borderTop: 'none' }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
				{packs.map(pack => <PackCard key={pack.packID} pack={pack} {...getCardProps(pack)} />)}
			</Box>
		</Box>
	);
});

const PacksTab = ({ onOpenPack, packOpening }) => {
	const game = useGame();
	const [packSearch, setPackSearch] = useState('');
	const [showOddsBtn, setShowOddsBtn] = useState(true);
	const [favorites, setFavorites] = useState(() => {
		try { return JSON.parse(localStorage.getItem('packFavorites') || '[]'); } catch { return []; }
	});
	const [openCats, setOpenCats] = useState({ fav: true, welcome: true, normal: true, filtered: false });

	const luck = game.garageStats?.luck || 0;

	const toggleFavorite = useCallback((packId) => {
		setFavorites(prev => {
			const next = prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId];
			localStorage.setItem('packFavorites', JSON.stringify(next));
			return next;
		});
	}, []);

	const toggleCat = useCallback((cat) => setOpenCats(p => ({ ...p, [cat]: !p[cat] })), []);

	// Pre-calculate all odds once
	const oddsMap = useMemo(() => {
		const m = {};
		for (const p of game.allPacks) {
			if (p.packSequence) m[p.packID] = calculatePackOdds(p.packSequence, luck);
		}
		return m;
	}, [game.allPacks, luck]);

	// Categorize packs
	const { favPacks, welcomePacks, normalPacks, filteredPacks, total } = useMemo(() => {
		let packs = game.allPacks || [];
		if (!game.hasMultiPackAccess) packs = packs.filter(p => !p.repetition || p.repetition <= 1);
		packs = packs.filter(p => !p.maxPurchases || (game.packPurchases[p.packID] || 0) < p.maxPurchases);
		if (packSearch) {
			const s = packSearch.toLowerCase();
			packs = packs.filter(p => p.packName.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
		}
		const welcomeIds = ['clicker_starter', 'clicker_bronze', 'clicker_silver', 'clicker_gold'];
		const hasFilter = (p) => p.filter && Object.keys(p.filter).some(k => p.filter[k] && p.filter[k] !== 'None');
		return {
			favPacks: packs.filter(p => favorites.includes(p.packID)),
			welcomePacks: packs.filter(p => welcomeIds.includes(p.packID) && !favorites.includes(p.packID)),
			normalPacks: packs.filter(p => !welcomeIds.includes(p.packID) && !hasFilter(p) && !favorites.includes(p.packID)),
			filteredPacks: packs.filter(p => !welcomeIds.includes(p.packID) && hasFilter(p) && !favorites.includes(p.packID)),
			total: packs.length,
		};
	}, [game.allPacks, game.hasMultiPackAccess, game.packPurchases, packSearch, favorites]);

	const getCardProps = useCallback((pack) => ({
		onOpen: onOpenPack,
		canAfford: game.money >= pack.price,
		disabled: !!packOpening,
		remaining: pack.maxPurchases ? pack.maxPurchases - (game.packPurchases[pack.packID] || 0) : null,
		isFavorite: favorites.includes(pack.packID),
		onToggleFavorite: toggleFavorite,
		showOddsBtn,
		odds: oddsMap[pack.packID],
		luck,
	}), [game.money, game.packPurchases, packOpening, favorites, toggleFavorite, showOddsBtn, oddsMap, luck, onOpenPack]);

	return (
		<Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.4)', minHeight: 400 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Packs</Typography>
					<Chip label={total} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', height: 20 }} />
					{luck > 0 && <Tooltip title="Increases rare chances"><Chip icon={<CasinoIcon sx={{ fontSize: 11 }} />} label={`+${luck.toFixed(0)}%`} size="small" sx={{ bgcolor: '#9c27b0', color: '#fff', height: 20 }} /></Tooltip>}
				</Box>
				<Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
					<Button size="small" variant={showOddsBtn ? 'contained' : 'outlined'} onClick={() => setShowOddsBtn(!showOddsBtn)} sx={{ fontSize: '0.6rem', py: 0.2, minWidth: 40 }}>Odds</Button>
					<TextField size="small" placeholder="Search..." value={packSearch} onChange={e => setPackSearch(e.target.value)} sx={{ width: 110, '& input': { py: 0.4, fontSize: '0.75rem' } }} />
				</Box>
			</Box>

			{total === 0 ? (
				<Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No packs available.</Typography>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{favPacks.length > 0 && (
						<Box>
							<CategoryHeader title="Favorites" icon={<StarIcon sx={{ color: '#ffd700', fontSize: 18 }} />} count={favPacks.length} color="#ffd700" isOpen={openCats.fav} onToggle={() => toggleCat('fav')} />
							<CategoryGrid packs={favPacks} isOpen={openCats.fav} color="#ffd700" getCardProps={getCardProps} />
						</Box>
					)}
					{welcomePacks.length > 0 && (
						<Box>
							<CategoryHeader title="Welcome Packs" icon={<CardGiftcardIcon sx={{ color: '#ffd700', fontSize: 18 }} />} count={welcomePacks.length} color="#ffd700" isOpen={openCats.welcome} onToggle={() => toggleCat('welcome')} />
							<CategoryGrid packs={welcomePacks} isOpen={openCats.welcome} color="#ffd700" getCardProps={getCardProps} />
						</Box>
					)}
					{normalPacks.length > 0 && (
						<Box>
							<CategoryHeader title="Normal Packs" icon={<InventoryIcon sx={{ color: '#2196f3', fontSize: 18 }} />} count={normalPacks.length} color="#2196f3" isOpen={openCats.normal} onToggle={() => toggleCat('normal')} />
							<CategoryGrid packs={normalPacks} isOpen={openCats.normal} color="#2196f3" getCardProps={getCardProps} />
						</Box>
					)}
					{filteredPacks.length > 0 && (
						<Box>
							<CategoryHeader title="Filtered Packs" icon={<FilterAltIcon sx={{ color: '#ff9800', fontSize: 18 }} />} count={filteredPacks.length} color="#ff9800" isOpen={openCats.filtered} onToggle={() => toggleCat('filtered')} />
							<CategoryGrid packs={filteredPacks} isOpen={openCats.filtered} color="#ff9800" getCardProps={getCardProps} />
						</Box>
					)}
				</Box>
			)}
		</Paper>
	);
};

export default PacksTab;
