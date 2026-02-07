import { Paper, Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RemoveIcon from '@mui/icons-material/Remove';
import SellIcon from '@mui/icons-material/Sell';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import { getThumbnailUrl } from '../../imageUtils';
import { getRarity } from '../constants/gameConfig';
import { getCarName } from '../utils/carHelpers';
import { fmtMoney } from '../utils/formatters';

const CarCard = ({ 
	car, 
	onAction, 
	actionLabel, 
	actionDisabled, 
	actionColor = 'primary', 
	showRemove, 
	onRemove, 
	showSell, 
	onSell, 
	sellValue, 
	compact = false, 
	onInfo, 
	showEnhance, 
	onEnhance, 
	canEnhance, 
	enhanceInfo, 
	stars, 
	isLocked, 
	onToggleLock, 
	showLock 
}) => {
	const rarity = getRarity(car.cr);
	
	// Rainbow gradient for enhanced cars
	const getEnhancedBorder = () => {
		if (stars >= 5) return 'linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0088, #ff0000)';
		if (stars >= 3) return 'linear-gradient(45deg, #ffd700, #ff8c00, #ffd700, #ffed4a, #ffd700)';
		return '#ffd700';
	};
	
	const borderStyle = isLocked 
		? { border: '2px solid #ff9800' }
		: stars > 0 
			? { 
				background: getEnhancedBorder(),
				padding: '2px',
				borderRadius: '10px',
			}
			: { border: `2px solid ${rarity.color}` };
	
	const innerStyle = stars > 0 && !isLocked ? {
		backgroundColor: 'rgba(30, 30, 30, 0.95)',
		borderRadius: '8px',
		height: '100%',
	} : {};
	
	return (
		<Paper sx={{ 
			p: 0, 
			backgroundColor: isLocked ? 'rgba(50, 40, 30, 0.95)' : stars > 0 ? 'transparent' : 'rgba(30, 30, 30, 0.95)',
			borderRadius: 2,
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			position: 'relative',
			...borderStyle,
		}}>
			<Box sx={{ 
				p: compact ? { xs: 0.75, sm: 1 } : 1.5, 
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				...innerStyle,
			}}>
				{/* Lock indicator */}
				{isLocked && (
					<Box sx={{ position: 'absolute', top: 4, left: 4, zIndex: 1 }}>
						<Chip label={'\uD83D\uDD12'} size="small" sx={{ backgroundColor: '#ff9800', color: '#000', fontWeight: 'bold', height: 20, fontSize: '0.7rem' }} />
					</Box>
				)}
				
				{/* Info Button */}
				{onInfo && (
					<IconButton 
						size="small" 
						onClick={onInfo}
						sx={{ 
							position: 'absolute', 
							top: 4, 
							right: 4, 
							p: 0.3,
							backgroundColor: 'rgba(0,0,0,0.5)',
							'&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
						}}
					>
						<InfoIcon sx={{ fontSize: compact ? 14 : 16, color: '#aaa' }} />
					</IconButton>
				)}
				
				<Box sx={{ display: 'flex', gap: compact ? 0.5 : 1, mb: compact ? 0.5 : 1 }}>
					<img 
						src={getThumbnailUrl(car.racehud, compact ? 50 : 80, 70)} 
						alt="" 
						style={{ 
							width: compact ? 50 : 80, 
							height: compact ? 31 : 50, 
							objectFit: 'cover', 
							borderRadius: 4,
							cursor: onInfo ? 'pointer' : 'default',
						}}
						loading="lazy"
						onClick={onInfo}
					/>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="body2" fontWeight="bold" noWrap title={getCarName(car)} sx={{ color: '#fff', fontSize: compact ? '0.65rem' : '0.875rem', lineHeight: 1.3 }}>
							{getCarName(car)}
						</Typography>
						<Chip 
							label={rarity.name} 
							size="small" 
							sx={{ 
								backgroundColor: rarity.color, 
								color: '#fff',
								fontSize: compact ? '0.55rem' : '0.6rem',
								height: compact ? 16 : 18,
							}} 
						/>
						<Typography variant="caption" display="block" sx={{ color: '#aaa', fontSize: compact ? '0.6rem' : '0.65rem', lineHeight: 1.2 }}>
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
							sx={{ 
								fontSize: compact ? '0.6rem' : '0.65rem', 
								flex: 1, 
								minWidth: compact ? 40 : 60,
								py: compact ? 0.25 : 0.5,
								'&.Mui-disabled': { 
									backgroundColor: '#444',
									color: '#bbb',
								},
							}}
						>
							{actionLabel}
						</Button>
					)}
					{showRemove && onRemove && (
						<IconButton size="small" color="error" onClick={onRemove} sx={{ p: 0.5 }}>
							<RemoveIcon sx={{ fontSize: compact ? 16 : 20 }} />
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
					{showEnhance && onEnhance && (
						<Tooltip title={canEnhance ? `Enhance: ${enhanceInfo}` : enhanceInfo === 'MAX' ? 'Max enhanced!' : `Need: ${enhanceInfo}`}>
							<span>
								<IconButton 
									size="small" 
									onClick={onEnhance}
									disabled={!canEnhance}
									sx={{ 
										p: 0.5, 
										color: canEnhance ? '#ffd700' : '#666',
										'&.Mui-disabled': { color: '#444' },
									}}
								>
									<UpgradeIcon sx={{ fontSize: compact ? 16 : 20 }} />
								</IconButton>
							</span>
						</Tooltip>
					)}
					{showLock && onToggleLock && (
						<IconButton 
							size="small" 
							onClick={onToggleLock}
							sx={{ p: 0.5, color: isLocked ? '#ff9800' : '#666' }}
						>
							{isLocked ? <LockIcon sx={{ fontSize: compact ? 16 : 20 }} /> : <LockOpenIcon sx={{ fontSize: compact ? 16 : 20 }} />}
						</IconButton>
					)}
				</Box>
			</Box>
		</Paper>
	);
};

export default CarCard;
