import { Paper, Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import InventoryIcon from '@mui/icons-material/Inventory';

import { getThumbnailUrl } from '../../imageUtils';
import { fmtMoney } from '../utils/formatters';

const PackCard = ({ pack, onOpen, money, luck, disabled, purchaseCount }) => {
	const canAfford = money >= pack.price;
	const remaining = pack.maxPurchases ? pack.maxPurchases - (purchaseCount || 0) : null;
	const soldOut = remaining !== null && remaining <= 0;
	const cardCount = pack.packSequence?.length || 3;
	const repetition = pack.repetition || 1;
	const totalCards = cardCount * repetition;
	const borderColor = pack.packColor || '#444';
	
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
					src={getThumbnailUrl(pack.pack, 150, 75)} 
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
				{pack.description || `${totalCards} cards`}
			</Typography>
			{repetition > 1 && (
				<Chip 
					label={`×${repetition} Multi-Pack`}
					size="small"
					sx={{ mb: 1, backgroundColor: '#9c27b0', color: '#fff', fontSize: '0.6rem' }}
				/>
			)}
			<Typography variant="h6" fontWeight="bold" sx={{ color: '#4caf50' }}>
				{fmtMoney(pack.price)}
			</Typography>
			<Tooltip title={luck > 0 ? `+${luck.toFixed(1)}% luck bonus applied` : ''}>
				<span>
					<Button
						variant="contained"
						onClick={() => onOpen(pack)}
						disabled={disabled || !canAfford || soldOut}
						sx={{ 
							mt: 1, 
							backgroundColor: (canAfford && !soldOut) ? '#4caf50' : '#555',
							color: '#fff',
							'&:hover': { backgroundColor: '#388e3c' },
							'&.Mui-disabled': { 
								backgroundColor: '#444',
								color: '#bbb',
							},
						}}
						startIcon={<CasinoIcon />}
						size="small"
					>
						{soldOut ? 'Sold Out' : 'Open'}
					</Button>
				</span>
			</Tooltip>
		</Paper>
	);
};

export default PackCard;
