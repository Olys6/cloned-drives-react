import { Paper, Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import GarageIcon from '@mui/icons-material/Garage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CasinoIcon from '@mui/icons-material/Casino';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import InventoryIcon from '@mui/icons-material/Inventory';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DiamondIcon from '@mui/icons-material/Diamond';
import StarIcon from '@mui/icons-material/Star';
import SellIcon from '@mui/icons-material/Sell';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BoltIcon from '@mui/icons-material/Bolt';

import { fmtMoney } from '../utils/formatters';

// Icon mapping
const ICONS = {
	GarageIcon: <GarageIcon />,
	AutoAwesomeIcon: <AutoAwesomeIcon />,
	CasinoIcon: <CasinoIcon />,
	TrendingUpIcon: <TrendingUpIcon />,
	SportsScoreIcon: <SportsScoreIcon />,
	InventoryIcon: <InventoryIcon />,
	UpgradeIcon: <UpgradeIcon />,
	EmojiEventsIcon: <EmojiEventsIcon />,
	DiamondIcon: <DiamondIcon />,
	StarIcon: <StarIcon />,
	SellIcon: <SellIcon />,
	SpeedIcon: <SpeedIcon />,
	BuildIcon: <BuildIcon />,
	MilitaryTechIcon: <MilitaryTechIcon />,
	AddCircleIcon: <AddCircleIcon />,
	BoltIcon: <BoltIcon />,
};

// Category colors
const CATEGORY_COLORS = {
	income: '#4caf50',
	racing: '#ff9800',
	collection: '#2196f3',
	special: '#b9f2ff',
};

const UpgradeCard = ({ upgradeKey, upgrade, level, effectiveMaxLevel, onBuy, money, tokens = 0, compact = false }) => {
	const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
	const currentValue = upgrade.baseValue + (upgrade.increment * level);
	const nextValue = upgrade.baseValue + (upgrade.increment * (level + 1));
	const isTokenCost = upgrade.tokenCost === true;
	const canAfford = isTokenCost ? tokens >= cost : money >= cost;
	const maxed = level >= effectiveMaxLevel;
	const isExtended = effectiveMaxLevel > upgrade.maxLevel;
	
	const icon = ICONS[upgrade.iconName] || <UpgradeIcon />;
	const categoryColor = CATEGORY_COLORS[upgrade.category] || '#2196f3';
	
	// Special styling for special category
	const isSpecial = upgrade.category === 'special';
	
	// Format display value based on upgrade type
	const formatValue = (val) => {
		// Percentage-based upgrades
		if (['vipStatus', 'sellBonus', 'earningsMultiplier'].includes(upgradeKey)) {
			return `${((val - 1) * 100).toFixed(0)}%`;
		}
		if (['trophyHunter'].includes(upgradeKey)) {
			return `${val.toFixed(0)}%`;
		}
		// Seconds-based
		if (['cooldownReduction'].includes(upgradeKey)) {
			return `${val.toFixed(2)}s`;
		}
		// Default
		return val.toFixed(2);
	};
	
	return (
		<Paper sx={{ 
			p: compact ? 1.5 : 2, 
			backgroundColor: isSpecial && !maxed 
				? 'rgba(15, 25, 35, 0.95)'
				: 'rgba(30, 30, 30, 0.95)',
			border: maxed 
				? '2px solid #ffd700' 
				: isSpecial 
					? '2px solid #b9f2ff'
					: isExtended 
						? '2px solid #9c27b0' 
						: `2px solid ${categoryColor}40`,
			borderRadius: 2,
			boxShadow: isSpecial && !maxed ? '0 0 20px rgba(185, 242, 255, 0.2)' : 'none',
			transition: 'all 0.2s ease',
			'&:hover': {
				borderColor: maxed ? '#ffd700' : categoryColor,
				transform: 'translateY(-2px)',
			},
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
				<Box sx={{ 
					color: maxed ? '#ffd700' : categoryColor,
					display: 'flex',
					alignItems: 'center',
				}}>
					{icon}
				</Box>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
						<Typography 
							variant={compact ? 'body2' : 'subtitle1'} 
							fontWeight="bold" 
							sx={{ color: isSpecial ? '#b9f2ff' : '#fff' }}
							noWrap
						>
							{upgrade.name}
						</Typography>
						{upgrade.extendable && (
							<Tooltip title="Can be extended with Research Lab">
								<Chip 
									label="EXT" 
									size="small" 
									sx={{ 
										fontSize: '0.55rem', 
										height: 16, 
										backgroundColor: '#9c27b0',
										cursor: 'help',
									}} 
								/>
							</Tooltip>
						)}
						{isTokenCost && (
							<Chip 
								label="🪙 TOKENS" 
								size="small" 
								sx={{ 
									fontSize: '0.55rem', 
									height: 16, 
									backgroundColor: '#ff9800', 
									color: '#000',
								}} 
							/>
						)}
					</Box>
					<Typography variant="caption" color="text.secondary">
						Level {level}/{effectiveMaxLevel}
						{isExtended && <span style={{ color: '#9c27b0' }}> (+{effectiveMaxLevel - upgrade.maxLevel})</span>}
					</Typography>
				</Box>
			</Box>
			
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: compact ? '0.75rem' : '0.875rem' }}>
				{upgrade.description}
			</Typography>
			
			{/* Show current/next value only for non-binary upgrades */}
			{upgrade.maxLevel > 1 && (
				<Typography variant="body2" sx={{ color: '#aaa', mb: 1, fontSize: compact ? '0.75rem' : '0.875rem' }}>
					Current: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{formatValue(currentValue)}</span>
					{!maxed && (
						<> → <span style={{ color: '#2196f3', fontWeight: 'bold' }}>{formatValue(nextValue)}</span></>
					)}
				</Typography>
			)}
			
			{maxed ? (
				<Chip 
					label={isSpecial ? "💎 UNLOCKED" : "MAXED"} 
					sx={{ 
						backgroundColor: isSpecial ? '#b9f2ff' : '#ffd700',
						color: '#000',
						fontWeight: 'bold',
					}} 
					size="small" 
				/>
			) : (
				<Button
					variant="contained"
					onClick={() => onBuy(upgradeKey)}
					disabled={!canAfford}
					fullWidth
					size={compact ? 'small' : 'medium'}
					sx={{ 
						backgroundColor: canAfford 
							? (isSpecial ? '#b9f2ff' : isTokenCost ? '#ff9800' : categoryColor)
							: '#555',
						color: isSpecial || isTokenCost ? '#000' : '#fff',
						fontWeight: 'bold',
						'&:hover': {
							backgroundColor: canAfford 
								? (isSpecial ? '#a0e0f0' : isTokenCost ? '#f57c00' : categoryColor)
								: '#555',
							filter: canAfford ? 'brightness(0.9)' : 'none',
						},
						'&.Mui-disabled': { 
							backgroundColor: '#444',
							color: '#888',
						},
					}}
				>
					{isTokenCost 
						? (upgrade.maxLevel === 1 ? `Unlock (${cost} 🪙)` : `Upgrade (${cost} 🪙)`)
						: `Upgrade ${fmtMoney(cost)}`
					}
				</Button>
			)}
		</Paper>
	);
};

export default UpgradeCard;
