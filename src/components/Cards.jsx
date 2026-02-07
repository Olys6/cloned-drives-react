import React, { useState, useMemo } from 'react';
import {
	Box,
	Typography,
	Modal,
	Chip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { calcTune, VALID_TUNES, TUNE_NAMES } from '../utils/calcTune';

// ============================================================
// IMAGE OPTIMISATION HELPERS
// ============================================================
const getThumbnailUrl = (originalUrl, width = 240, quality = 70) => {
	if (!originalUrl) return originalUrl;
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we&il`;
};

const getMediumUrl = (originalUrl, width = 500, quality = 80) => {
	if (!originalUrl) return originalUrl;
	const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(urlWithoutProtocol)}&w=${width}&q=${quality}&we`;
};

// Tyre abbreviation map
const TYRE_ABBR = {
	Performance: 'PER',
	Standard: 'STD',
	'Off-Road': 'OFF',
	'All-Surface': 'ALL',
	Drag: 'DRG',
	Slick: 'SLK',
};

// ============================================================
// SORT COMPARATORS
// ============================================================
const SORT_FNS = {
	1:  (a, b) => a.cr - b.cr,
	2:  (a, b) => b.cr - a.cr,
	3:  (a, b) => a.topSpeed - b.topSpeed,
	4:  (a, b) => b.topSpeed - a.topSpeed,
	5:  (a, b) => b['0to60'] - a['0to60'],
	6:  (a, b) => a['0to60'] - b['0to60'],
	7:  (a, b) => a.handling - b.handling,
	8:  (a, b) => b.handling - a.handling,
	9:  (a, b) => b.modelYear - a.modelYear,
	10: (a, b) => a.modelYear - b.modelYear,
	11: (a, b) => b.mra - a.mra,
	12: (a, b) => a.mra - b.mra,
	13: (a, b) => a.ola - b.ola,
	14: (a, b) => b.ola - a.ola,
	15: (a, b) => a.weight - b.weight,
	16: (a, b) => b.weight - a.weight,
};

// ============================================================
// CR COLOUR - gradient based on CR value
// ============================================================
const getCrColor = (cr) => {
	if (cr >= 1000) return '#ea00ff'; // Mystic Pink
	if (cr >= 850)  return '#ffbb00'; // Legend Gold
	if (cr >= 700)  return '#8400ff'; // exotic purple
	if (cr >= 550)  return '#ff2929'; // epic red
	if (cr >= 400)  return '#29dfff'; // rare blue
	if (cr >= 250)  return '#08e600'; // uncommon green
	if (cr >= 100)  return '#616161'; // common dark grey
	return '#cfcfcf';                 // standard grey
};

// ============================================================
// UPGRADE COMPARISON COLOUR
// ============================================================
const getCompareColor = (val, stockVal, higherIsBetter) => {
	if (val === stockVal) return 'inherit';
	if (higherIsBetter) return val > stockVal ? '#4caf50' : '#f44336';
	return val < stockVal ? '#4caf50' : '#f44336';
};

// ============================================================
// CARDS COMPONENT
// ============================================================
const Cards = ({
	filteredCars,
	page,
	numOfCars,
	carsSortType,
	accentColor = '#b8860b',
}) => {
	const [modalCar, setModalCar] = useState(null);
	const [open, setOpen] = useState(false);

	const handleOpen = (car) => {
		setModalCar(car);
		setOpen(true);
	};
	const handleClose = () => setOpen(false);

	// Memoised sort + page slice
	const sortedCars = useMemo(() => {
		const comparator = SORT_FNS[carsSortType] || SORT_FNS[2];
		return [...filteredCars].sort(comparator);
	}, [filteredCars, carsSortType]);

	const pageSlice = useMemo(() => {
		const start = numOfCars * (page - 1);
		return sortedCars.slice(start, start + numOfCars);
	}, [sortedCars, page, numOfCars]);

	// Pre-calculate all tunes when a modal car is selected
	const tuneData = useMemo(() => {
		if (!modalCar) return null;
		const stock = calcTune(modalCar, '000');
		const tunes = VALID_TUNES.map(code => ({
			code,
			name: TUNE_NAMES[code],
			stats: calcTune(modalCar, code),
		}));
		return { stock, tunes };
	}, [modalCar]);

	// Modal styling
	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 520, xs: '88%' },
		bgcolor: 'background.paper',
		border: `2px solid ${modalCar?.isPrize ? '#b8860b' : accentColor}`,
		boxShadow: modalCar?.isPrize
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

	// Stat row helper - two items side by side
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

	// Table cell sx
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

	return (
		<>
			{/* ========== CAR GRID ========== */}
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '0.71rem',
					justifyContent: 'center',
					padding: '20px',
				}}>
				{pageSlice.map((car) => (
					<Button
						key={car.carID ?? car.id ?? `${car.make}-${car.model}`}
						onClick={() => handleOpen(car)}
						className='carCard'>
						<div style={{ position: 'relative' }}>
							<LazyLoadImage
								threshold={200}
								effect='blur'
								src={getThumbnailUrl(car.racehud, 240, 70)}
								placeholderSrc={getThumbnailUrl(car.racehud, 60, 30)}
								style={{
									width: '15rem',
									height: '9.35rem',
									marginBottom: '-5px',
									objectFit: 'cover',
								}}
							/>
							{[
								{ value: car.topSpeed, top: '42px' },
								{ value: car['0to60'], top: '55px' },
								{ value: car.handling, top: '67px' },
								{ value: car.driveType, top: '80px' },
								{ value: TYRE_ABBR[car.tyreType] || '', top: '93px' },
							].map((stat, i) => (
								<span
									key={i}
									style={{
										position: 'absolute',
										top: stat.top,
										left: '3px',
										width: '20px',
										borderRadius: '10px',
										fontFamily: 'Rubik-BoldItalic',
										fontSize: '0.5rem',
									}}>
									{stat.value}
								</span>
							))}
						</div>
						<p
							style={{
								padding: 0,
								margin: 0,
								marginTop: 6,
								fontFamily: 'Rubik-BoldItalic',
								fontSize: '0.7rem',
								maxWidth: '15rem',
								textAlign: 'center',
								overflow: 'hidden',
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								lineHeight: '1.2',
							}}>
							{Array.isArray(car.make) ? car.make[0] : car.make}{' '}
							{car.model} ({car.modelYear})
						</p>
					</Button>
				))}
			</Box>

			{/* ========== DETAIL MODAL ========== */}
			{modalCar && tuneData && (
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby='car-modal-title'>
					<Box sx={modalStyle}>
						{/* ---- TITLE ---- */}
						<Typography
							id='car-modal-title'
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
							}}>
							{Array.isArray(modalCar.make) ? modalCar.make[0] : modalCar.make}{' '}
							{modalCar.model} ({modalCar.modelYear})
						</Typography>

						{/* ---- IMAGE (with prize glow) ---- */}
						<Box
							sx={{
								position: 'relative',
								borderRadius: '6px',
								overflow: 'hidden',
								...(modalCar.isPrize
									? {
										boxShadow:
											'0 0 20px 6px rgba(184, 134, 11, 0.6), inset 0 0 10px rgba(184, 134, 11, 0.15)',
										border: '2px solid rgba(184, 134, 11, 0.7)',
									}
									: {}),
							}}>
							<LazyLoadImage
								src={getMediumUrl(modalCar.racehud, 500, 85)}
								style={{ width: '100%', display: 'block' }}
							/>
							{/* Stat overlays */}
							<span id='car-modal-topspeed' className='car-modal-details'>
								{modalCar.topSpeed}
							</span>
							<span id='car-modal-0to60' className='car-modal-details'>
								{modalCar['0to60']}
							</span>
							<span id='car-modal-handling' className='car-modal-details'>
								{modalCar.handling}
							</span>
							<span id='car-modal-driveType' className='car-modal-details'>
								{modalCar.driveType}
							</span>
							<span id='car-modal-tyreType' className='car-modal-details'>
								{TYRE_ABBR[modalCar.tyreType] || ''}
							</span>
						</Box>

						{/* ---- TAGS ---- */}
						{modalCar.tags?.length > 0 && (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
								{modalCar.tags.map((tag, i) => (
									<Chip
										key={i}
										label={tag}
										size='small'
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

						{/* ---- DESCRIPTION (optional) ---- */}
						{modalCar.description &&
							modalCar.description !== 'None.' &&
							modalCar.description !== '' && (
								<Accordion
									sx={{
										bgcolor: 'rgba(255,255,255,0.04)',
										'&:before': { display: 'none' },
									}}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Typography sx={{ fontSize: '0.9rem' }}>Description</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<Typography sx={{ fontSize: '0.85rem', mt: -1 }}>
											{modalCar.description}
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
										<span style={{ color: getCrColor(modalCar.cr), fontWeight: 'bold' }}>
											{modalCar.cr}
										</span>
									</>
								}
								right={
									modalCar.isPrize ? (
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
								left={<><strong>MRA:</strong> {modalCar.mra}</>}
								right={<><strong>OLA:</strong> {modalCar.ola}</>}
							/>
							{/* Weight + GC */}
							<StatRow
								left={<><strong>Weight:</strong> {modalCar.weight} kg</>}
								right={<><strong>GC:</strong> {modalCar.gc || '-'}</>}
							/>
							{/* TCS + ABS */}
							<StatRow
								left={
									modalCar.tcs ? (
										<span style={{ color: '#4caf50' }}>TCS <CheckIcon sx={{ fontSize: 14 }} /></span>
									) : (
										<span style={{ color: '#f44336' }}>TCS <CloseIcon sx={{ fontSize: 14 }} /></span>
									)
								}
								right={
									modalCar.abs ? (
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
										{Array.isArray(modalCar.bodyStyle)
											? modalCar.bodyStyle.join(' / ')
											: modalCar.bodyStyle}
									</>
								}
								right={<><strong>Seats:</strong> {modalCar.seatCount}</>}
							/>
							{/* Fuel Type + Engine Pos */}
							<StatRow
								left={<><strong>Fuel:</strong> {modalCar.fuelType}</>}
								right={<><strong>Engine:</strong> {modalCar.enginePos || '-'}</>}
							/>
							{/* Creator + ID */}
							<StatRow
								left={<><strong>Creator:</strong> {modalCar.creator}</>}
								right={<><strong>ID:</strong> {modalCar.carID}</>}
								divider={false}
							/>
						</Box>

						{/* ---- UPGRADES ACCORDION ---- */}
						<Accordion
							sx={{
								bgcolor: 'rgba(255,255,255,0.04)',
								'&:before': { display: 'none' },
							}}>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
									Upgrades
								</Typography>
							</AccordionSummary>
							<AccordionDetails sx={{ p: 0 }}>
								<TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
									<Table size='small'>
										<TableHead>
											<TableRow>
												<TableCell sx={thSx}>Tune</TableCell>
												<TableCell sx={thSx} align='right'>TS</TableCell>
												<TableCell sx={thSx} align='right'>0-60</TableCell>
												<TableCell sx={thSx} align='right'>HND</TableCell>
												<TableCell sx={thSx} align='right'>WGT</TableCell>
												<TableCell sx={thSx} align='right'>MRA</TableCell>
												<TableCell sx={thSx} align='right'>OLA</TableCell>
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
														}}>
														<TableCell
															sx={{
																...tdSx,
																fontWeight: 'bold',
																whiteSpace: 'nowrap',
															}}>
															{name}{' '}
															{!isStock && (
																<span style={{ opacity: 0.4, fontSize: '0.65rem' }}>
																	{code}
																</span>
															)}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.topSpeed, s.topSpeed, true),
																fontWeight: stats.topSpeed !== s.topSpeed ? 'bold' : 'normal',
															}}>
															{stats.topSpeed}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.accel, s.accel, false),
																fontWeight: stats.accel !== s.accel ? 'bold' : 'normal',
															}}>
															{stats.accel}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.handling, s.handling, true),
																fontWeight: stats.handling !== s.handling ? 'bold' : 'normal',
															}}>
															{stats.handling}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.weight, s.weight, false),
																fontWeight: stats.weight !== s.weight ? 'bold' : 'normal',
															}}>
															{stats.weight}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.mra, s.mra, true),
																fontWeight: stats.mra !== s.mra ? 'bold' : 'normal',
															}}>
															{stats.mra}
														</TableCell>
														<TableCell
															align='right'
															sx={{
																...tdSx,
																color: isStock
																	? 'inherit'
																	: getCompareColor(stats.ola, s.ola, true),
																fontWeight: stats.ola !== s.ola ? 'bold' : 'normal',
															}}>
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
					</Box>
				</Modal>
			)}
		</>
	);
};

export default Cards;
export { getThumbnailUrl, getMediumUrl };
