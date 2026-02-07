import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, Tabs, Tab, LinearProgress, Tooltip, IconButton } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CollectionsIcon from '@mui/icons-material/Collections';
import DiamondIcon from '@mui/icons-material/Diamond';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useGame } from '../context';
import { UpgradeCard } from '../components';
import { UPGRADES, UPGRADE_CATEGORIES } from '../constants/upgrades';
import { fmtMoney } from '../utils/formatters';

// Category icons mapping
const CATEGORY_ICONS = {
	income: <AttachMoneyIcon />,
	racing: <SportsScoreIcon />,
	collection: <CollectionsIcon />,
	special: <DiamondIcon />,
};

const UpgradesTab = ({ showSnackbar }) => {
	const game = useGame();
	const [selectedCategory, setSelectedCategory] = useState('all');
	
	const handleBuyUpgrade = (key) => {
		const upgrade = UPGRADES[key];
		
		// Handle token-based upgrades
		if (upgrade.tokenCost) {
			if (game.buyTokenUpgrade(key)) {
				showSnackbar(`Unlocked ${upgrade.name}! 💎`);
			} else {
				showSnackbar(`Not enough tokens!`, 'error');
			}
		} else {
			// Regular money-based upgrade
			if (game.buyUpgrade(key)) {
				showSnackbar(`Upgraded ${upgrade.name}!`);
			} else {
				showSnackbar(`Cannot afford upgrade!`, 'error');
			}
		}
	};
	
	// Group upgrades by category
	const upgradesByCategory = useMemo(() => {
		const grouped = {
			income: [],
			racing: [],
			collection: [],
			special: [],
		};
		
		Object.entries(UPGRADES).forEach(([key, upgrade]) => {
			const category = upgrade.category || 'collection';
			if (grouped[category]) {
				grouped[category].push([key, upgrade]);
			}
		});
		
		return grouped;
	}, []);
	
	// Calculate category stats
	const categoryStats = useMemo(() => {
		const stats = {};
		
		Object.entries(upgradesByCategory).forEach(([category, upgrades]) => {
			let totalLevels = 0;
			let currentLevels = 0;
			let maxedCount = 0;
			
			upgrades.forEach(([key, upgrade]) => {
				const level = game.getUpgradeLevel(key);
				const effectiveMax = game.getEffectiveMaxLevel(key);
				totalLevels += effectiveMax;
				currentLevels += level;
				if (level >= effectiveMax) maxedCount++;
			});
			
			stats[category] = {
				total: upgrades.length,
				maxed: maxedCount,
				progress: totalLevels > 0 ? (currentLevels / totalLevels) * 100 : 0,
			};
		});
		
		return stats;
	}, [upgradesByCategory, game]);
	
	// Filter upgrades based on selected category
	const displayedUpgrades = useMemo(() => {
		if (selectedCategory === 'all') {
			return Object.entries(UPGRADES);
		}
		return upgradesByCategory[selectedCategory] || [];
	}, [selectedCategory, upgradesByCategory]);
	
	// Find next affordable upgrade
	const nextAffordable = useMemo(() => {
		let cheapest = null;
		let cheapestCost = Infinity;
		
		Object.entries(UPGRADES).forEach(([key, upgrade]) => {
			const level = game.getUpgradeLevel(key);
			const effectiveMax = game.getEffectiveMaxLevel(key);
			if (level >= effectiveMax) return;
			
			const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
			const isToken = upgrade.tokenCost;
			const currency = isToken ? game.tokens : game.money;
			
			// Find the one we're closest to affording
			const remaining = cost - currency;
			if (remaining > 0 && cost < cheapestCost) {
				cheapestCost = cost;
				cheapest = { key, upgrade, cost, remaining, isToken };
			}
		});
		
		return cheapest;
	}, [game]);
	
	return (
		<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)', minHeight: 500 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
				<Typography variant="h6">Upgrades</Typography>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					<Chip 
						label={fmtMoney(game.money)} 
						sx={{ backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold' }} 
					/>
					<Chip 
						label={`${game.tokens} 🪙`} 
						sx={{ backgroundColor: '#ff9800', color: '#000', fontWeight: 'bold' }} 
					/>
				</Box>
			</Box>
			
			{/* Next Affordable Hint */}
			{nextAffordable && (
				<Paper sx={{ 
					p: 1.5, 
					mb: 2, 
					backgroundColor: 'rgba(255,255,255,0.05)',
					border: '1px solid rgba(255,255,255,0.1)',
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
						<Typography variant="caption" color="text.secondary">
							Next upgrade:
						</Typography>
						<Typography variant="body2" fontWeight="bold" sx={{ color: nextAffordable.isToken ? '#ff9800' : '#4caf50' }}>
							{nextAffordable.upgrade.name}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							— Need {nextAffordable.isToken ? `${nextAffordable.remaining} more 🪙` : fmtMoney(nextAffordable.remaining) + ' more'}
						</Typography>
					</Box>
				</Paper>
			)}
			
			{/* Category Tabs */}
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
				<Tabs 
					value={selectedCategory} 
					onChange={(e, val) => setSelectedCategory(val)}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						'& .MuiTab-root': {
							minHeight: 48,
							textTransform: 'none',
						},
					}}
				>
					<Tab 
						label={
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								All
								<Chip label={Object.keys(UPGRADES).length} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
							</Box>
						} 
						value="all" 
					/>
					{Object.entries(UPGRADE_CATEGORIES).map(([key, cat]) => (
						<Tab 
							key={key}
							label={
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<Box sx={{ color: cat.color, display: 'flex' }}>{CATEGORY_ICONS[key]}</Box>
									{cat.name}
									<Chip 
										label={`${categoryStats[key]?.maxed || 0}/${categoryStats[key]?.total || 0}`} 
										size="small" 
										sx={{ 
											height: 18, 
											fontSize: '0.65rem',
											backgroundColor: categoryStats[key]?.maxed === categoryStats[key]?.total ? '#ffd700' : 'rgba(255,255,255,0.1)',
											color: categoryStats[key]?.maxed === categoryStats[key]?.total ? '#000' : '#fff',
										}} 
									/>
								</Box>
							} 
							value={key} 
						/>
					))}
				</Tabs>
			</Box>
			
			{/* Category Progress (when specific category selected) */}
			{selectedCategory !== 'all' && (
				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
						<Typography variant="caption" color="text.secondary">
							{UPGRADE_CATEGORIES[selectedCategory]?.name} Progress
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{categoryStats[selectedCategory]?.progress.toFixed(0)}%
						</Typography>
					</Box>
					<LinearProgress 
						variant="determinate" 
						value={categoryStats[selectedCategory]?.progress || 0}
						sx={{
							height: 6,
							borderRadius: 3,
							backgroundColor: 'rgba(255,255,255,0.1)',
							'& .MuiLinearProgress-bar': {
								backgroundColor: UPGRADE_CATEGORIES[selectedCategory]?.color || '#2196f3',
							},
						}}
					/>
				</Box>
			)}
			
			{/* Category Description */}
			{selectedCategory !== 'all' && (
				<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
					<InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
					<Typography variant="caption" color="text.secondary">
						{selectedCategory === 'income' && 'Boost your earnings from collecting, selling, and passive income.'}
						{selectedCategory === 'racing' && 'Improve your racing rewards and tune token gains.'}
						{selectedCategory === 'collection' && 'Enhance pack luck, set bonuses, and collection management.'}
						{selectedCategory === 'special' && 'Premium unlocks that cost tokens and provide powerful abilities.'}
					</Typography>
				</Box>
			)}
			
			{/* Upgrades Grid */}
			{selectedCategory === 'all' ? (
				// Show all categories with headers
				Object.entries(UPGRADE_CATEGORIES).map(([catKey, cat]) => (
					<Box key={catKey} sx={{ mb: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
							<Box sx={{ color: cat.color, display: 'flex' }}>{CATEGORY_ICONS[catKey]}</Box>
							<Typography variant="subtitle1" fontWeight="bold" sx={{ color: cat.color }}>
								{cat.name}
							</Typography>
							<Chip 
								label={`${categoryStats[catKey]?.maxed || 0}/${categoryStats[catKey]?.total || 0}`} 
								size="small" 
								sx={{ 
									height: 20, 
									fontSize: '0.7rem',
									backgroundColor: categoryStats[catKey]?.maxed === categoryStats[catKey]?.total ? '#ffd700' : `${cat.color}30`,
									color: categoryStats[catKey]?.maxed === categoryStats[catKey]?.total ? '#000' : cat.color,
								}} 
							/>
						</Box>
						<Box sx={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
							gap: 2,
						}}>
							{upgradesByCategory[catKey]?.map(([key, upgrade]) => (
								<UpgradeCard 
									key={key} 
									upgradeKey={key} 
									upgrade={upgrade} 
									level={game.getUpgradeLevel(key)} 
									effectiveMaxLevel={game.getEffectiveMaxLevel(key)} 
									onBuy={handleBuyUpgrade} 
									money={game.money}
									tokens={game.tokens}
									compact
								/>
							))}
						</Box>
					</Box>
				))
			) : (
				// Show single category
				<Box sx={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
					gap: 2,
				}}>
					{displayedUpgrades.map(([key, upgrade]) => (
						<UpgradeCard 
							key={key} 
							upgradeKey={key} 
							upgrade={upgrade} 
							level={game.getUpgradeLevel(key)} 
							effectiveMaxLevel={game.getEffectiveMaxLevel(key)} 
							onBuy={handleBuyUpgrade} 
							money={game.money}
							tokens={game.tokens}
						/>
					))}
				</Box>
			)}
		</Paper>
	);
};

export default UpgradesTab;
