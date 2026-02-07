import {
	Modal, Box, Typography, Chip, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';

import { getMediumUrl } from '../../imageUtils';
import { getRarity, getPrizeBonusById, getEnhancementBonus, ENHANCEMENT_COSTS, ENHANCEMENT_TIER_NAMES } from '../constants/gameConfig';
import { getCarName } from '../utils/carHelpers';
import { getTyreAbbr } from '../utils/formatters';

// CR colour — matches main site
const getCrColor = (cr) => {
	if (cr >= 1000) return '#ea00ff';
	if (cr >= 850) return '#ffbb00';
	if (cr >= 700) return '#8400ff';
	if (cr >= 550) return '#ff2929';
	if (cr >= 400) return '#29dfff';
	if (cr >= 250) return '#08e600';
	if (cr >= 100) return '#616161';
	return '#cfcfcf';
};

// Enhancement tier colors (matching GarageCarCard)
const TIER_COLORS = {
	0: 'rgba(255,255,255,0.2)',
	1: '#cd7f32', // Bronze
	2: '#ffa500', // Orange
	3: '#ffd700', // Gold
	4: '#ffd700', // Gold+
	5: '#ffd700', // Rainbow
	6: '#c0c0c0', // Platinum
	7: '#00ffff', // Cyan
	8: '#0096ff', // Sapphire
	9: '#b400ff', // Amethyst
	10: '#b9f2ff', // Diamond
};

const getTierColor = (stars) => TIER_COLORS[Math.min(stars, 10)] || TIER_COLORS[0];

// Stat row helper — two items side by side
const StatRow = ({ left, right, divider = true }) => (
	<Box sx={{
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		py: 0.4,
		...(divider ? { borderBottom: '1px solid rgba(255,255,255,0.08)' } : {}),
	}}>
		<Typography sx={{ fontSize: '0.95rem' }}>{left}</Typography>
		<Typography sx={{ fontSize: '0.95rem', textAlign: 'right' }}>{right}</Typography>
	</Box>
);

const CarDetailModal = ({ car, open, onClose, prizeCarBonuses, carEnhancements, collection, accentColor = '#b8860b' }) => {
	if (!car) return null;

	const rarity = getRarity(car.cr);
	const bonus = car.isPrize && prizeCarBonuses?.[car.carID]
		? getPrizeBonusById(prizeCarBonuses[car.carID])
		: null;
	const stars = carEnhancements?.[car.carID] || 0;
	const dupeCount = collection?.[car.carID] || 0;

	return (
		<Modal open={open} onClose={onClose} aria-labelledby="car-detail-modal">
			<Box sx={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: { md: 520, xs: '90%' },
				maxHeight: '90vh',
				overflowY: 'auto',
				bgcolor: car.isPrize ? '#3d2914' : 'background.paper',
				border: `2px solid ${car.isPrize ? '#b8860b' : accentColor}`,
				boxShadow: car.isPrize
					? '0 0 30px 8px rgba(184, 134, 11, 0.5), 0 0 60px 16px rgba(184, 134, 11, 0.2)'
					: 24,
				borderRadius: '10px',
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				gap: '0.75rem',
			}}>
				{/* Title */}
				<Typography
					id="car-detail-modal"
					sx={{
						textAlign: 'center',
						fontWeight: 'bold',
						fontFamily: 'Rubik-BoldItalic, sans-serif',
						fontSize: '1.05rem',
						lineHeight: 1.3,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						wordBreak: 'break-word',
					}}>
					{getCarName(car)} ({car.modelYear})
				</Typography>

				{/* Image with stat overlays and optional prize glow */}
				<Box sx={{
					position: 'relative',
					borderRadius: '6px',
					overflow: 'hidden',
					...(car.isPrize ? {
						boxShadow: '0 0 20px 6px rgba(184, 134, 11, 0.6), inset 0 0 10px rgba(184, 134, 11, 0.15)',
						border: '2px solid rgba(184, 134, 11, 0.7)',
					} : {}),
				}}>
					<img
						src={getMediumUrl(car.racehud, 500, 85)}
						alt={getCarName(car)}
						style={{ width: '100%', display: 'block' }}
					/>
					{/* Stat overlays — matching main site CSS positions */}
					<span className="car-modal-details" id="car-modal-topspeed">{car.topSpeed}</span>
					<span className="car-modal-details" id="car-modal-0to60">{car['0to60']}</span>
					<span className="car-modal-details" id="car-modal-handling">{car.handling}</span>
					<span className="car-modal-details" id="car-modal-driveType">{car.driveType}</span>
					<span className="car-modal-details" id="car-modal-tyreType">{getTyreAbbr(car.tyreType)}</span>
				</Box>

				{/* Tags */}
				{car.tags?.length > 0 && (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
						{car.tags.map((tag, i) => (
							<Chip
								key={i}
								label={tag}
								size="small"
								sx={{
									bgcolor: `${accentColor}33`,
									color: accentColor,
									fontWeight: 'bold',
									border: `1px solid ${accentColor}`,
									fontSize: '0.75rem',
								}}
							/>
						))}
					</Box>
				)}

				{/* Enhancement Stars */}
				{stars > 0 && (
					<Box sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						p: 1,
						borderRadius: 1,
						background: stars >= 10
							? 'repeating-linear-gradient(45deg, #0a0a0a, #0a0a0a 2px, #1a1a1a 2px, #1a1a1a 4px)'
							: stars === 5
								? 'linear-gradient(90deg, rgba(255,0,0,0.1), rgba(255,136,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,136,255,0.1), rgba(136,0,255,0.1))'
								: stars >= 3
									? 'rgba(255,215,0,0.12)'
									: 'rgba(255,215,0,0.06)',
						border: `1px solid ${stars >= 10 ? '#b9f2ff' : stars >= 6 ? '#c0c0c0' : stars >= 5 ? '#ffd700' : stars >= 3 ? 'rgba(255,215,0,0.4)' : 'rgba(255,215,0,0.2)'}`,
					}}>
						<Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap' }}>
							{[...Array(10)].map((_, i) => (
								<StarIcon key={i} sx={{ fontSize: 16, color: i < stars ? (stars >= 10 ? '#b9f2ff' : '#ffd700') : '#444' }} />
							))}
						</Box>
						<Typography sx={{ fontSize: '0.85rem', color: stars >= 10 ? '#b9f2ff' : '#ffd700' }}>
							+{Math.round(getEnhancementBonus(stars) * 100)}% Earnings
						</Typography>
						{stars < 10 && dupeCount > 1 && (
							<Typography sx={{ fontSize: '0.75rem', color: '#aaa', ml: 'auto' }}>
								Next: {ENHANCEMENT_COSTS[stars + 1]?.dupes}{'\uD83D\uDE97'} + {ENHANCEMENT_COSTS[stars + 1]?.tuneTokens}{'\u2B50'}
								{stars >= 5 && ' (Advanced)'}
							</Typography>
						)}
					</Box>
				)}

				{/* Prize Car Bonus */}
				{car.isPrize && bonus && (
					<Box sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						p: 1,
						borderRadius: 1,
						bgcolor: 'rgba(184, 134, 11, 0.15)',
						border: '1px solid rgba(184, 134, 11, 0.3)',
					}}>
						<EmojiEventsIcon sx={{ color: '#b8860b', fontSize: 22 }} />
						<Box>
							<Typography sx={{ fontSize: '0.85rem', color: '#ffd700', fontWeight: 'bold' }}>
								{bonus.icon} {bonus.name}
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', color: '#ce93d8' }}>
								{bonus.description}
							</Typography>
						</Box>
					</Box>
				)}

				{/* Description accordion */}
				{car.description && car.description !== 'None.' && car.description !== '' && (
					<Accordion sx={{ bgcolor: 'rgba(255,255,255,0.04)', '&:before': { display: 'none' } }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography sx={{ fontSize: '0.9rem' }}>Description</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography sx={{ fontSize: '0.85rem', mt: -1 }}>{car.description}</Typography>
						</AccordionDetails>
					</Accordion>
				)}

				{/* Stat Grid — matching main site compact layout */}
				<Box>
					{/* CR + Prize */}
					<StatRow
						left={<><strong>CR: </strong><span style={{ color: getCrColor(car.cr), fontWeight: 'bold' }}>{car.cr}</span></>}
						right={
							car.isPrize ? (
								<span style={{ color: '#b8860b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
									<EmojiEventsIcon sx={{ fontSize: 18, color: '#b8860b' }} />
									Prize Car
								</span>
							) : (
								<span style={{ color: '#666' }}>Not Prize</span>
							)
						}
					/>
					{/* MRA + OLA */}
					<StatRow
						left={<><strong>MRA:</strong> {car.mra}</>}
						right={<><strong>OLA:</strong> {car.ola}</>}
					/>
					{/* Weight + GC */}
					<StatRow
						left={<><strong>Weight:</strong> {car.weight} kg</>}
						right={<><strong>GC:</strong> {car.gc || '\u2014'}</>}
					/>
					{/* TCS + ABS */}
					<StatRow
						left={car.tcs ? <span style={{ color: '#4caf50' }}>TCS {'\u2714'}</span> : <span style={{ color: '#777' }}>No TCS</span>}
						right={car.abs ? <span style={{ color: '#4caf50' }}>ABS {'\u2714'}</span> : <span style={{ color: '#777' }}>No ABS</span>}
					/>
					{/* Body Style + Seats */}
					<StatRow
						left={<><strong>Body:</strong> {Array.isArray(car.bodyStyle) ? car.bodyStyle.join(' / ') : car.bodyStyle}</>}
						right={<><strong>Seats:</strong> {car.seatCount}</>}
					/>
					{/* Fuel Type + Engine Pos */}
					<StatRow
						left={<><strong>Fuel:</strong> {car.fuelType}</>}
						right={<><strong>Engine:</strong> {car.enginePos || '\u2014'}</>}
					/>
					{/* Creator + ID */}
					<StatRow
						left={<><strong>Creator:</strong> {car.creator}</>}
						right={<><strong>ID:</strong> {car.carID}</>}
						divider={false}
					/>
				</Box>

				{/* Dupe count */}
				{dupeCount > 1 && (
					<Typography sx={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center' }}>
						You own {'\u00D7'}{dupeCount} of this car
					</Typography>
				)}
			</Box>
		</Modal>
	);
};

export default CarDetailModal;
