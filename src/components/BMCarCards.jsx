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

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LinkIcon from '@mui/icons-material/Link';
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
// CR COLOUR - matches Cards.jsx
// ============================================================
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

// ============================================================
// UPGRADE COMPARISON COLOUR
// ============================================================
const getCompareColor = (val, stockVal, higherIsBetter) => {
	if (val === stockVal) return 'inherit';
	if (higherIsBetter) return val > stockVal ? '#4caf50' : '#f44336';
	return val < stockVal ? '#4caf50' : '#f44336';
};

// Active / Inactive colours
const ACTIVE_COLOR = '#4caf50';
const INACTIVE_COLOR = '#f44336';

// ============================================================
// COLLECTION CHIP COLOUR - consistent hash (for modal)
// ============================================================
const COLLECTION_COLORS = [
	'#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
	'#009688', '#4caf50', '#ff9800', '#f44336',
	'#e91e63', '#00bcd4', '#8bc34a', '#ffc107',
];

const getCollectionColor = (collection) => {
	if (!collection) return COLLECTION_COLORS[0];
	const str = Array.isArray(collection) ? collection[0] : collection;
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return COLLECTION_COLORS[Math.abs(hash) % COLLECTION_COLORS.length];
};

// ============================================================
// SORT COMPARATORS
// ============================================================
const SORT_FNS = {
	1: (a, b) => a.model.localeCompare(b.model),
	2: (a, b) => b.model.localeCompare(a.model),
	3: (a, b) => {
		const collA = Array.isArray(a.collection) ? a.collection[0] : (a.collection || 'ZZZ');
		const collB = Array.isArray(b.collection) ? b.collection[0] : (b.collection || 'ZZZ');
		return collA.localeCompare(collB);
	},
	4: (a, b) => a.carID.localeCompare(b.carID),
};

// ============================================================
// COMPONENT
// ============================================================
const BMCarCards = ({
	filteredCars,
	page,
	numOfCars,
	sortType,
	allCarData,
	accentColor = '#9c27b0',
}) => {
	const [modalCar, setModalCar] = useState(null);
	const [open, setOpen] = useState(false);

	// Find the referenced car for the modal
	const referenceCar = useMemo(() => {
		if (!modalCar?.reference) return null;
		return allCarData.find(c => c.carID === modalCar.reference) || null;
	}, [modalCar, allCarData]);

	// Pre-calculate all tunes using the REFERENCED car stats
	const tuneData = useMemo(() => {
		if (!referenceCar) return null;
		const stock = calcTune(referenceCar, '000');
		const tunes = VALID_TUNES.map(code => ({
			code,
			name: TUNE_NAMES[code],
			stats: calcTune(referenceCar, code),
		}));
		return { stock, tunes };
	}, [referenceCar]);

	const handleOpen = (car) => {
		setModalCar(car);
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
		setModalCar(null);
	};

	// Memoised sort + page slice
	const sortedCars = useMemo(() => {
		const comparator = SORT_FNS[sortType] || SORT_FNS[1];
		return [...filteredCars].sort(comparator);
	}, [filteredCars, sortType]);

	const pageSlice = useMemo(() => {
		const start = numOfCars * (page - 1);
		return sortedCars.slice(start, start + numOfCars);
	}, [sortedCars, page, numOfCars]);

	// The car whose stats we display (reference car if available, otherwise BM car itself)
	const statsCar = referenceCar || modalCar;

	// Modal styling
	const isActive = modalCar?.active === true;
	const modalGlowColor = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 520, xs: '88%' },
		bgcolor: 'background.paper',
		border: `2px solid ${modalGlowColor}`,
		boxShadow: `0 0 30px 8px ${modalGlowColor}55, 0 0 60px 16px ${modalGlowColor}22`,
		p: 2,
		display: 'flex',
		flexDirection: 'column',
		gap: '0.75rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflowY: 'auto',
	};

	// Stat row helper
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
				{pageSlice.map((car) => {
					const cardActive = car.active === true;
					const glowColor = cardActive ? ACTIVE_COLOR : INACTIVE_COLOR;
					return (
						<Button
							key={car.carID ?? `${car.make}-${car.model}`}
							onClick={() => handleOpen(car)}
							className='carCard'
							sx={{
								boxShadow: `0 0 14px 3px ${glowColor}44, inset 0 0 8px ${glowColor}15 !important`,
								borderColor: `${glowColor}55 !important`,
							}}>
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
					);
				})}
			</Box>

			{/* ========== DETAIL MODAL ========== */}
			{modalCar && statsCar && (
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby='bm-car-modal-title'>
					<Box sx={modalStyle}>
						{/* ---- TITLE ---- */}
						<Typography
							id='bm-car-modal-title'
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

						{/* ---- IMAGE (active = green glow, inactive = red glow) ---- */}
						<Box
							sx={{
								position: 'relative',
								borderRadius: '6px',
								overflow: 'hidden',
								boxShadow: `0 0 20px 6px ${modalGlowColor}66, inset 0 0 10px ${modalGlowColor}18`,
								border: `2px solid ${modalGlowColor}88`,
							}}>
							<LazyLoadImage
								src={getMediumUrl(modalCar.racehud, 500, 85)}
								style={{ width: '100%', display: 'block' }}
							/>
							{/* Stat overlays from referenced car */}
							<span id='car-modal-topspeed' className='car-modal-details'>
								{statsCar.topSpeed}
							</span>
							<span id='car-modal-0to60' className='car-modal-details'>
								{statsCar['0to60']}
							</span>
							<span id='car-modal-handling' className='car-modal-details'>
								{statsCar.handling}
							</span>
							<span id='car-modal-driveType' className='car-modal-details'>
								{statsCar.driveType}
							</span>
							<span id='car-modal-tyreType' className='car-modal-details'>
								{TYRE_ABBR[statsCar.tyreType] || ''}
							</span>
						</Box>

						{/* ---- COLLECTIONS (shown in modal only) ---- */}
						{modalCar.collection && (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
								{(Array.isArray(modalCar.collection)
									? modalCar.collection
									: [modalCar.collection]
								).map((coll, i) => (
									<Chip
										key={i}
										label={coll}
										size='small'
										sx={{
											bgcolor: getCollectionColor(coll),
											color: '#fff',
											fontWeight: 'bold',
											fontSize: '0.75rem',
										}}
									/>
								))}
							</Box>
						)}

						{/* ---- DESCRIPTION (optional) ---- */}
						{modalCar.description &&
							modalCar.description !== 'placeholder desc' &&
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
										<Typography sx={{ fontSize: '0.85rem', mt: -1, fontStyle: 'italic' }}>
											{modalCar.description}
										</Typography>
									</AccordionDetails>
								</Accordion>
							)}

						{/* ---- STAT GRID (from referenced car) ---- */}
						<Box>
							{/* CR + Active Status */}
							<StatRow
								left={
									<>
										<strong>CR: </strong>
										<span style={{ color: getCrColor(statsCar.cr), fontWeight: 'bold' }}>
											{statsCar.cr}
										</span>
									</>
								}
								right={
									isActive ? (
										<span style={{ color: ACTIVE_COLOR, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
											<CheckCircleIcon sx={{ fontSize: 18, color: ACTIVE_COLOR }} />
											Active
										</span>
									) : (
										<span style={{ color: INACTIVE_COLOR, display: 'flex', alignItems: 'center', gap: 4 }}>
											<CancelIcon sx={{ fontSize: 18, color: INACTIVE_COLOR }} />
											Inactive
										</span>
									)
								}
							/>
							{/* MRA + OLA */}
							<StatRow
								left={<><strong>MRA:</strong> {statsCar.mra}</>}
								right={<><strong>OLA:</strong> {statsCar.ola}</>}
							/>
							{/* Weight + GC */}
							<StatRow
								left={<><strong>Weight:</strong> {statsCar.weight} kg</>}
								right={<><strong>GC:</strong> {statsCar.gc || '-'}</>}
							/>
							{/* TCS + ABS */}
							<StatRow
								left={
									statsCar.tcs ? (
										<span style={{ color: '#4caf50' }}>TCS <CheckIcon sx={{ fontSize: 14 }} /></span>
									) : (
										<span style={{ color: '#f44336' }}>TCS <CloseIcon sx={{ fontSize: 14 }} /></span>
									)
								}
								right={
									statsCar.abs ? (
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
										{Array.isArray(statsCar.bodyStyle)
											? statsCar.bodyStyle.join(' / ')
											: statsCar.bodyStyle}
									</>
								}
								right={<><strong>Seats:</strong> {statsCar.seatCount}</>}
							/>
							{/* Fuel Type + Engine Pos */}
							<StatRow
								left={<><strong>Fuel:</strong> {statsCar.fuelType}</>}
								right={<><strong>Engine:</strong> {statsCar.enginePos || '-'}</>}
							/>
							{/* Creator + ID */}
							<StatRow
								left={<><strong>Creator:</strong> {modalCar.creator}</>}
								right={<><strong>ID:</strong> {modalCar.carID}</>}
							/>
							{/* Reference link */}
							{referenceCar && (
								<StatRow
									left={
										<span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#aaa', fontSize: '0.85rem' }}>
											<LinkIcon sx={{ fontSize: 16 }} />
											<strong>Ref:</strong>{' '}
											{Array.isArray(referenceCar.make) ? referenceCar.make[0] : referenceCar.make}{' '}
											{referenceCar.model}
										</span>
									}
									right={
										<span style={{ color: '#aaa', fontSize: '0.85rem' }}>
											{modalCar.reference}
										</span>
									}
									divider={false}
								/>
							)}
						</Box>

						{/* ---- UPGRADES ACCORDION (uses referenced car) ---- */}
						{tuneData && (
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
																	color: isStock ? 'inherit' : getCompareColor(stats.topSpeed, s.topSpeed, true),
																	fontWeight: stats.topSpeed !== s.topSpeed ? 'bold' : 'normal',
																}}>
																{stats.topSpeed}
															</TableCell>
															<TableCell
																align='right'
																sx={{
																	...tdSx,
																	color: isStock ? 'inherit' : getCompareColor(stats.accel, s.accel, false),
																	fontWeight: stats.accel !== s.accel ? 'bold' : 'normal',
																}}>
																{stats.accel}
															</TableCell>
															<TableCell
																align='right'
																sx={{
																	...tdSx,
																	color: isStock ? 'inherit' : getCompareColor(stats.handling, s.handling, true),
																	fontWeight: stats.handling !== s.handling ? 'bold' : 'normal',
																}}>
																{stats.handling}
															</TableCell>
															<TableCell
																align='right'
																sx={{
																	...tdSx,
																	color: isStock ? 'inherit' : getCompareColor(stats.weight, s.weight, false),
																	fontWeight: stats.weight !== s.weight ? 'bold' : 'normal',
																}}>
																{stats.weight}
															</TableCell>
															<TableCell
																align='right'
																sx={{
																	...tdSx,
																	color: isStock ? 'inherit' : getCompareColor(stats.mra, s.mra, true),
																	fontWeight: stats.mra !== s.mra ? 'bold' : 'normal',
																}}>
																{stats.mra}
															</TableCell>
															<TableCell
																align='right'
																sx={{
																	...tdSx,
																	color: isStock ? 'inherit' : getCompareColor(stats.ola, s.ola, true),
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
						)}
					</Box>
				</Modal>
			)}
		</>
	);
};

export default BMCarCards;
