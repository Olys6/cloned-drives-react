import { memo } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';

import { getThumbnailUrl } from '../../imageUtils';
import { getCarName } from '../utils/carHelpers';
import { fmtMoney } from '../utils/formatters';

// Tyre abbreviation map
const TYRE_ABBR = {
	Performance: 'PER',
	Standard: 'STD',
	'Off-Road': 'OFF',
	'All-Surface': 'ALL',
	Drag: 'DRG',
	Slick: 'SLK',
};

// Enhancement tiers and colors
const ENHANCEMENT_TIERS = {
	0: { glow: 'transparent', border: '1px solid rgba(255, 255, 255, 0.18)', starColor: 'rgba(255,255,255,0.2)', name: 'Stock' },
	1: { glow: 'rgba(205, 127, 50, 0.3)', border: '2px solid rgba(205, 127, 50, 0.6)', starColor: '#cd7f32', name: 'Bronze' },
	2: { glow: 'rgba(255, 165, 0, 0.4)', border: '2px solid rgba(255, 165, 0, 0.7)', starColor: '#ffa500', name: 'Orange' },
	3: { glow: 'rgba(255, 215, 0, 0.4)', border: '2px solid rgba(255, 215, 0, 0.6)', starColor: '#ffd700', name: 'Gold' },
	4: { glow: 'rgba(255, 215, 0, 0.6)', border: '2px solid rgba(255, 215, 0, 0.8)', starColor: '#ffd700', name: 'Gold+' },
	5: { glow: 'rgba(255, 215, 0, 0.5)', border: 'rainbow', starColor: '#ffd700', name: 'Rainbow' },
	6: { glow: 'rgba(192, 192, 192, 0.5)', border: '2px solid #c0c0c0', starColor: '#c0c0c0', name: 'Platinum' },
	7: { glow: 'rgba(0, 255, 255, 0.4)', border: '2px solid #00ffff', starColor: '#00ffff', name: 'Cyan' },
	8: { glow: 'rgba(0, 150, 255, 0.5)', border: '2px solid #0096ff', starColor: '#0096ff', name: 'Sapphire' },
	9: { glow: 'rgba(180, 0, 255, 0.5)', border: '2px solid #b400ff', starColor: '#b400ff', name: 'Amethyst' },
	10: { glow: 'rgba(185, 242, 255, 0.6)', border: '2px solid #b9f2ff', starColor: '#b9f2ff', name: 'Diamond', textColor: '#b9f2ff' },
};

const getTier = (stars) => ENHANCEMENT_TIERS[Math.min(stars, 10)] || ENHANCEMENT_TIERS[0];

const GarageCarCard = memo(({ 
	car, 
	stars = 0, 
	onRemove, 
	onInfo,
	perClickContribution = 0,
}) => {
	if (!car) return null;

	const tier = getTier(stars);
	const isRainbow = stars === 5;
	const isDiamond = stars >= 10;
	const isCarbon = stars >= 10;

	return (
		<Box
			onClick={() => onInfo?.(car)}
			sx={{
				position: 'relative',
				background: isCarbon 
					? 'repeating-linear-gradient(45deg, #0a0a0a, #0a0a0a 2px, #1a1a1a 2px, #1a1a1a 4px)'
					: 'rgba(255, 255, 255, 0.1)',
				borderRadius: '10px',
				border: isRainbow ? 'none' : tier.border,
				padding: '6px',
				cursor: 'pointer',
				transition: 'transform 0.15s',
				overflow: 'hidden',
				'&:hover': { transform: 'scale(1.02)', zIndex: 1 },
				// Glow effects
				...(!isRainbow && stars > 0 && { boxShadow: `0 0 15px ${tier.glow}` }),
				// Rainbow
				...(isRainbow && {
					background: 'linear-gradient(135deg, rgba(255,0,0,0.12), rgba(255,127,0,0.12), rgba(255,255,0,0.12), rgba(0,255,0,0.12), rgba(0,127,255,0.12), rgba(127,0,255,0.12))',
					boxShadow: '0 0 20px rgba(255,215,0,0.4)',
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						borderRadius: '10px',
						padding: '2px',
						background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #007fff, #7f00ff, #ff0000)',
						backgroundSize: '400% 100%',
						WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
						WebkitMaskComposite: 'xor',
						maskComposite: 'exclude',
						animation: 'rainbow-shift 6s linear infinite',
					},
				}),
				// Diamond
				...(isDiamond && {
					boxShadow: '0 0 25px rgba(185, 242, 255, 0.5)',
					'&::before': {
						content: '""',
						position: 'absolute',
						inset: 0,
						borderRadius: '10px',
						padding: '2px',
						background: 'linear-gradient(90deg, #b9f2ff, #ffffff, #b9f2ff, #7dd3fc, #b9f2ff)',
						backgroundSize: '300% 100%',
						WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
						WebkitMaskComposite: 'xor',
						maskComposite: 'exclude',
						animation: 'diamond-shift 4s ease-in-out infinite',
					},
				}),
				'@keyframes rainbow-shift': { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '400% 50%' } },
				'@keyframes diamond-shift': { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '300% 50%' } },
			}}
		>
			{/* Top row: Per-click chip + Remove button */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, minHeight: 18 }}>
				{perClickContribution > 0 && (
					<Chip label={`+${fmtMoney(perClickContribution)}`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(76, 175, 80, 0.85)', color: '#fff', fontWeight: 'bold' }} />
				)}
				<Box sx={{ flex: 1 }} />
				{onRemove && (
					<IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemove(); }} sx={{ p: 0.25, bgcolor: 'rgba(244, 67, 54, 0.8)', color: '#fff', '&:hover': { bgcolor: '#f44336' } }}>
						<CloseIcon sx={{ fontSize: 12 }} />
					</IconButton>
				)}
			</Box>

			{/* Stars row */}
			{stars > 0 && (
				<Box sx={{ display: 'flex', gap: '1px', mb: 0.5, flexWrap: 'wrap' }}>
					{[...Array(10)].map((_, i) => {
						const filled = i < stars;
						const StarComp = isDiamond && filled ? DiamondIcon : StarIcon;
						return <StarComp key={i} sx={{ fontSize: 10, color: filled ? tier.starColor : 'rgba(255,255,255,0.1)', filter: filled ? `drop-shadow(0 0 1px ${tier.starColor})` : 'none' }} />;
					})}
				</Box>
			)}

			{/* Car Image with stats sidebar */}
			<Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
				{/* Stats sidebar */}
				<Box sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					bgcolor: 'rgba(0,0,0,0.7)',
					borderRadius: '4px',
					py: 0.25,
					width: { xs: 26, sm: 30 },
					flexShrink: 0,
				}}>
					{[car.topSpeed, car['0to60'], car.handling, car.driveType, TYRE_ABBR[car.tyreType] || car.tyreType].map((val, i) => (
						<Box key={i} sx={{ 
							borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.15)' : 'none',
							py: '2px',
						}}>
							<Typography
								sx={{
									fontFamily: 'Rubik-BoldItalic, sans-serif',
									fontSize: { xs: '0.45rem', sm: '0.5rem' },
									fontWeight: 'bold',
									color: '#fff',
									lineHeight: 1.1,
									textAlign: 'center',
								}}
							>
								{val}
							</Typography>
						</Box>
					))}
				</Box>
				
				{/* Car image */}
				<Box sx={{ flex: 1 }}>
					<img
						src={getThumbnailUrl(car.racehud, 280, 80)}
						alt=""
						loading="lazy"
						style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
					/>
				</Box>
			</Box>

			{/* Car Name */}
			<Typography sx={{
				fontFamily: 'Rubik-BoldItalic, sans-serif',
				fontSize: '0.65rem',
				textAlign: 'center',
				color: isDiamond ? '#b9f2ff' : car.isPrize ? '#ffd700' : '#fff',
				overflow: 'hidden',
				display: '-webkit-box',
				WebkitLineClamp: 2,
				WebkitBoxOrient: 'vertical',
				lineHeight: 1.2,
				textShadow: isDiamond ? '0 0 8px rgba(185, 242, 255, 0.6)' : car.isPrize ? '0 0 6px rgba(255,215,0,0.4)' : 'none',
			}}>
				{getCarName(car)} ({car.modelYear})
			</Typography>
		</Box>
	);
});

export default GarageCarCard;
