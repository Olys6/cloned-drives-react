import { useMemo } from 'react';
import {
	Box,
	Typography,
	Modal,
	Chip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { getThumbnailUrl, getMediumUrl } from '../utils/imageUtils';
import { calcTune, VALID_TUNES, TUNE_NAMES } from '../utils/calcTune';

// ============================================================
// HELPERS
// ============================================================
const TYRE_ABBR = {
	Performance: 'PER',
	Standard: 'STD',
	'Off-Road': 'OFF',
	'All-Surface': 'ALL',
	Drag: 'DRG',
	Slick: 'SLK',
};

const getCrColor = (cr) => {
	if (cr >= 1000) return '#ea00ff';
	if (cr >= 850)  return '#ffbb00';
	if (cr >= 700)  return '#8400ff';
	if (cr >= 550)  return '#ff2929';
	if (cr >= 400)  return '#29dfff';
	if (cr >= 250)  return '#08e600';
	if (cr >= 100)  return '#616161';
	return '#cfcfcf';
};

const getCompareColor = (val, stockVal, higherIsBetter) => {
	if (val === stockVal) return 'inherit';
	if (higherIsBetter) return val > stockVal ? '#4caf50' : '#f44336';
	return val < stockVal ? '#4caf50' : '#f44336';
};

// ============================================================
// STAT ROW
// ============================================================
const StatRow = ({ left, right, divider = true }) => (
	<Box
		sx={{
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

// Table cell styles
const thSx = {
	bgcolor: '#333',
	color: '#fff',
	fontWeight: 'bold',
	fontSize: '0.7rem',
	py: 0.5,
	px: 0.75,
	borderBottom: '1px solid #555',
	whiteSpace: 'nowrap',
};
const tdSx = {
	fontSize: '0.75rem',
	py: 0.4,
	px: 0.75,
	borderBottom: '1px solid rgba(255,255,255,0.06)',
};

// ============================================================
// SHARED CAR DETAIL MODAL
// ============================================================
// Props:
//   car          - the car object (required)
//   open         - boolean (required)
//   onClose      - function (required)
//   accentColor  - border/tag color (default: '#b8860b')
//   glowColor    - override border + glow colour (e.g. rarity colour)
//   extraChip    - ReactNode rendered between image and tags (e.g. rarity chip)
//   showUpgrades - whether to show the upgrades accordion (default: true)
// ============================================================
const CarDetailModal = ({
	car,
	open,
	onClose,
	accentColor = '#b8860b',
	glowColor,
	extraChip,
	showUpgrades = true,
	actionButton,
}) => {
	// Pre-calculate all tunes
	const tuneData = useMemo(() => {
		if (!car || !showUpgrades) return null;
		try {
			const stock = calcTune(car, '000');
			const tunes = VALID_TUNES.map(code => ({
				code,
				name: TUNE_NAMES[code],
				stats: calcTune(car, code),
			}));
			return { stock, tunes };
		} catch {
			return null;
		}
	}, [car, showUpgrades]);

	if (!car) return null;

	// Determine border / glow colours
	const borderColor = glowColor || (car.isPrize ? '#b8860b' : accentColor);
	const tagColor = glowColor || accentColor;

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 520, xs: '88%' },
		bgcolor: 'background.paper',
		border: `2px solid ${borderColor}`,
		boxShadow: glowColor
			? `0 0 30px 8px ${glowColor}55, 0 0 60px 16px ${glowColor}22`
			: car.isPrize
				? '0 0 30px 8px rgba(184, 134, 11, 0.5), 0 0 60px 16px rgba(184, 134, 11, 0.2)'
				: 24,
		p: 2,
		display: 'flex',
		flexDirection: 'column',
		gap: '0.75rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflowY: 'auto',
	};

	return (
		<Modal open={open} onClose={onClose} aria-labelledby="car-detail-modal-title">
			<Box sx={modalStyle}>
				{/* ---- TITLE ---- */}
				<Typography
					id="car-detail-modal-title"
					sx={{
						textAlign: 'center',
						fontWeight: 'bold',
						fontFamily: 'Rubik-BoldItalic',
						fontSize: '1.05rem',
						lineHeight: 1.3,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						wordBreak: 'break-word',
					}}
				>
					{Array.isArray(car.make) ? car.make[0] : car.make}{' '}
					{car.model} ({car.modelYear})
				</Typography>

				{/* ---- ACTION BUTTON (e.g. "Use" in Race Simulator) ---- */}
				{actionButton}

				{/* ---- IMAGE ---- */}
				<Box
					sx={{
						position: 'relative',
						borderRadius: '6px',
						overflow: 'hidden',
						boxShadow: glowColor
							? `0 0 20px 6px ${glowColor}66, inset 0 0 10px ${glowColor}18`
							: car.isPrize
								? '0 0 20px 6px rgba(184, 134, 11, 0.6), inset 0 0 10px rgba(184, 134, 11, 0.15)'
								: 'none',
						border: glowColor
							? `2px solid ${glowColor}88`
							: car.isPrize
								? '2px solid rgba(184, 134, 11, 0.7)'
								: 'none',
					}}
				>
					<LazyLoadImage
						src={getMediumUrl(car.racehud, 500, 85)}
						style={{ width: '100%', display: 'block' }}
					/>
					{/* Stat overlays - uses CSS classes from App.css */}
					<span id="car-modal-topspeed" className="car-modal-details">
						{car.topSpeed}
					</span>
					<span id="car-modal-0to60" className="car-modal-details">
						{car['0to60']}
					</span>
					<span id="car-modal-handling" className="car-modal-details">
						{car.handling}
					</span>
					<span id="car-modal-driveType" className="car-modal-details">
						{car.driveType}
					</span>
					<span id="car-modal-tyreType" className="car-modal-details">
						{TYRE_ABBR[car.tyreType] || ''}
					</span>
				</Box>

				{/* ---- EXTRA CHIP (e.g. rarity badge from PackSimulator) ---- */}
				{extraChip}

				{/* ---- TAGS ---- */}
				{car.tags?.length > 0 && (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
						{car.tags.map((tag, i) => (
							<Chip
								key={i}
								label={tag}
								size="small"
								sx={{
									bgcolor: `${tagColor}33`,
									color: tagColor,
									fontWeight: 'bold',
									border: `1px solid ${tagColor}`,
									fontSize: '0.75rem',
								}}
							/>
						))}
					</Box>
				)}

				{/* ---- DESCRIPTION ---- */}
				{car.description &&
					car.description !== 'None.' &&
					car.description !== '' && (
						<Accordion
							sx={{
								bgcolor: 'rgba(255,255,255,0.04)',
								'&:before': { display: 'none' },
							}}
						>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography sx={{ fontSize: '0.9rem' }}>Description</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Typography sx={{ fontSize: '0.85rem', mt: -1 }}>
									{car.description}
								</Typography>
							</AccordionDetails>
						</Accordion>
					)}

				{/* ---- STAT GRID ---- */}
				<Box>
					{/* CR + Prize */}
					<StatRow
						left={
							<>
								<strong>CR: </strong>
								<span style={{ color: getCrColor(car.cr), fontWeight: 'bold' }}>
									{car.cr}
								</span>
							</>
						}
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
						right={<><strong>GC:</strong> {car.gc || '-'}</>}
					/>
					{/* TCS + ABS */}
					<StatRow
						left={
							car.tcs ? (
								<span style={{ color: '#4caf50' }}>TCS <CheckIcon sx={{ fontSize: 14 }} /></span>
							) : (
								<span style={{ color: '#f44336' }}>TCS <CloseIcon sx={{ fontSize: 14 }} /></span>
							)
						}
						right={
							car.abs ? (
								<span style={{ color: '#4caf50' }}>ABS <CheckIcon sx={{ fontSize: 14 }} /></span>
							) : (
								<span style={{ color: '#f44336' }}>ABS <CloseIcon sx={{ fontSize: 14 }} /></span>
							)
						}
					/>
					{/* Body Style + Seats */}
					<StatRow
						left={
							<>
								<strong>Body:</strong>{' '}
								{Array.isArray(car.bodyStyle)
									? car.bodyStyle.join(' / ')
									: car.bodyStyle}
							</>
						}
						right={<><strong>Seats:</strong> {car.seatCount}</>}
					/>
					{/* Fuel Type + Engine Pos */}
					<StatRow
						left={<><strong>Fuel:</strong> {car.fuelType}</>}
						right={<><strong>Engine:</strong> {car.enginePos || '-'}</>}
					/>
					{/* Creator + ID */}
					<StatRow
						left={<><strong>Creator:</strong> {car.creator}</>}
						right={<><strong>ID:</strong> {car.carID || 'N/A'}</>}
						divider={false}
					/>
				</Box>

				{/* ---- UPGRADES ACCORDION ---- */}
				{showUpgrades && tuneData && (
					<Accordion
						sx={{
							bgcolor: 'rgba(255,255,255,0.04)',
							'&:before': { display: 'none' },
						}}
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
								Upgrades
							</Typography>
						</AccordionSummary>
						<AccordionDetails sx={{ p: 0 }}>
							<TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell sx={thSx}>Tune</TableCell>
											<TableCell sx={thSx} align="right">TS</TableCell>
											<TableCell sx={thSx} align="right">0-60</TableCell>
											<TableCell sx={thSx} align="right">HND</TableCell>
											<TableCell sx={thSx} align="right">WGT</TableCell>
											<TableCell sx={thSx} align="right">MRA</TableCell>
											<TableCell sx={thSx} align="right">OLA</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{tuneData.tunes.map(({ code, name, stats }) => {
											const s = tuneData.stock;
											const isStock = code === '000';
											return (
												<TableRow
													key={code}
													sx={{
														bgcolor: isStock
															? 'rgba(255,255,255,0.04)'
															: 'transparent',
													}}
												>
													<TableCell
														sx={{
															...tdSx,
															fontWeight: 'bold',
															whiteSpace: 'nowrap',
														}}
													>
														{name}{' '}
														{!isStock && (
															<span style={{ opacity: 0.4, fontSize: '0.65rem' }}>
																{code}
															</span>
														)}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.topSpeed, s.topSpeed, true),
															fontWeight: stats.topSpeed !== s.topSpeed ? 'bold' : 'normal',
														}}
													>
														{stats.topSpeed}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.accel, s.accel, false),
															fontWeight: stats.accel !== s.accel ? 'bold' : 'normal',
														}}
													>
														{stats.accel}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.handling, s.handling, true),
															fontWeight: stats.handling !== s.handling ? 'bold' : 'normal',
														}}
													>
														{stats.handling}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.weight, s.weight, false),
															fontWeight: stats.weight !== s.weight ? 'bold' : 'normal',
														}}
													>
														{stats.weight}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.mra, s.mra, true),
															fontWeight: stats.mra !== s.mra ? 'bold' : 'normal',
														}}
													>
														{stats.mra}
													</TableCell>
													<TableCell
														align="right"
														sx={{
															...tdSx,
															color: isStock ? 'inherit' : getCompareColor(stats.ola, s.ola, true),
															fontWeight: stats.ola !== s.ola ? 'bold' : 'normal',
														}}
													>
														{stats.ola}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>
						</AccordionDetails>
					</Accordion>
				)}
			</Box>
		</Modal>
	);
};

export default CarDetailModal;
