import { useState, useMemo } from 'react';
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Autocomplete,
	Paper,
	Chip,
	Pagination,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	InputAdornment,
} from '@mui/material';

// Data imports
import trackData from '../data/trackData.js';
import carData from '../data/data.js';

// Race engine
import { evaluateRace, getRaceAdvantages, getCarStats, hasUpgrade } from '../utils/raceEngine';

// Shared components
import CarDetailModal from './CarDetailModal';

// Lazy loading
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Image helpers
import { getThumbnailUrl } from '../utils/imageUtils';

// Icons
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import ClearIcon from '@mui/icons-material/Clear';

// Filter out BM cars
const raceCars = carData.filter(car => !car.reference);

const CARS_PER_PAGE = 18;
const upgradeOptions = ["000", "333", "666", "699", "969", "996"];

const RaceSimulator = () => {
	// Race state
	const [selectedTrack, setSelectedTrack] = useState(null);
	const [car1, setCar1] = useState(null);
	const [car1Upgrade, setCar1Upgrade] = useState("000");
	const [car2, setCar2] = useState(null);
	const [car2Upgrade, setCar2Upgrade] = useState("000");
	const [raceResult, setRaceResult] = useState(null);

	// Car list state
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSlot, setActiveSlot] = useState(1);
	const [page, setPage] = useState(1);

	// Car detail modal state
	const [modalCar, setModalCar] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Filter cars
	const filteredCars = useMemo(() => {
		if (!searchQuery.trim()) return raceCars;
		const query = searchQuery.toLowerCase();
		return raceCars.filter(car => {
			const make = Array.isArray(car.make) ? car.make.join(' ') : car.make;
			const searchStr = `${make} ${car.model}`.toLowerCase();
			return searchStr.includes(query);
		});
	}, [searchQuery]);

	// Paginated cars
	const paginatedCars = useMemo(() => {
		const start = (page - 1) * CARS_PER_PAGE;
		return filteredCars.slice(start, start + CARS_PER_PAGE);
	}, [filteredCars, page]);

	const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);

	const getCarName = (car) => {
		if (!car) return "";
		const make = Array.isArray(car.make) ? car.make[0] : car.make;
		return `${make} ${car.model}`;
	};

	const handleCarSelect = (car) => {
		if (activeSlot === 1) {
			setCar1(car);
			setCar1Upgrade("000");
		} else {
			setCar2(car);
			setCar2Upgrade("000");
		}
		setRaceResult(null);
	};

	const handleCardClick = (car) => {
		setModalCar(car);
		setModalOpen(true);
	};

	const handleUseFromModal = () => {
		if (modalCar) {
			handleCarSelect(modalCar);
			setModalOpen(false);
			setModalCar(null);
		}
	};

	const runRace = () => {
		if (!selectedTrack || !car1 || !car2) return;

		const player = getCarStats(car1, car1Upgrade);
		const opponent = getCarStats(car2, car2Upgrade);

		if (!player || !opponent) return;

		const score = evaluateRace(player, opponent, selectedTrack);
		const playerWon = score > 0;
		const advantages = getRaceAdvantages(player, opponent, selectedTrack, playerWon);

		setRaceResult({
			score,
			playerWon,
			tie: score === 0,
			advantages,
		});
	};

	// Stat row component
	const StatRow = ({ label, value }) => (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 0.25 }}>
			<Typography variant="caption" color="text.secondary">{label}</Typography>
			<Typography variant="caption" fontWeight="bold">{value}</Typography>
		</Box>
	);

	// Compact car slot component with full stats
	const CarSlot = ({ car, upgrade, setUpgrade, slotNum, color }) => {
		const stats = car ? getCarStats(car, upgrade) : null;
		
		return (
			<Paper sx={{
				p: 1.5,
				backgroundColor: car ? `${color}15` : 'rgba(0,0,0,0.3)',
				border: `2px solid ${car ? color : '#555'}`,
				borderRadius: 2,
				width: 220,
			}}>
				<Typography variant="subtitle2" sx={{ color, fontWeight: 'bold', mb: 1 }}>
					{slotNum === 1 ? "CAR 1 (YOU)" : "CAR 2 (OPPONENT)"}
				</Typography>
				{car ? (
					<>
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
							<img
								src={car.racehud}
								alt=""
								style={{ width: 70, height: 43, objectFit: 'cover', borderRadius: 4 }}
							/>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
									{getCarName(car)}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									CR {car.cr}
								</Typography>
							</Box>
						</Box>
						
						{/* Upgrade selector */}
						<FormControl fullWidth size="small" sx={{ mb: 1 }}>
							<InputLabel>Tune</InputLabel>
							<Select
								value={upgrade}
								label="Tune"
								onChange={(e) => { setUpgrade(e.target.value); setRaceResult(null); }}
							>
								{upgradeOptions.map(opt => (
									<MenuItem key={opt} value={opt} disabled={!hasUpgrade(car, opt)}>
										{opt}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Full stats display */}
						{stats && (
							<Box sx={{ fontSize: '0.7rem' }}>
								<StatRow label="Top Speed" value={stats.topSpeed} />
								<StatRow label="0-60" value={stats["0to60"]} />
								<StatRow label="Handling" value={stats.handling} />
								<StatRow label="Weight" value={`${stats.weight} kg`} />
								<StatRow label="Drivetrain" value={stats.driveType} />
								<StatRow label="Tyre Type" value={stats.tyreType} />
								<StatRow label="Ground Clearance" value={stats.gc} />
								<StatRow label="MRA" value={stats.mra} />
								<StatRow label="OLA" value={stats.ola} />
								<StatRow label="TCS / ABS" value={`${car.tcs ? "Yes" : "No"} / ${car.abs ? "Yes" : "No"}`} />
							</Box>
						)}
						
						<Button
							size="small"
							color="error"
							startIcon={<ClearIcon />}
							onClick={() => { slotNum === 1 ? setCar1(null) : setCar2(null); setRaceResult(null); }}
							sx={{ mt: 1, fontSize: '0.7rem' }}
							fullWidth
						>
							Clear
						</Button>
					</>
				) : (
					<Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
						Select from list below
					</Typography>
				)}
			</Paper>
		);
	};

	return (
		<Box sx={{ p: 2 }}>
			{/* Header */}
			<Typography variant="h5" fontWeight="bold" textAlign="center" sx={{ mb: 2 }}>
				Race Simulator
			</Typography>

			{/* Race Setup - Top Section */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 2,
					justifyContent: 'center',
					alignItems: 'flex-start',
				}}>
					{/* Car 1 Slot */}
					<CarSlot
						car={car1}
						upgrade={car1Upgrade}
						setUpgrade={setCar1Upgrade}
						slotNum={1}
						color="#4caf50"
					/>

					{/* VS + Track + Race Button */}
					<Box sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 1,
						minWidth: 200,
					}}>
						<Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
							VS
						</Typography>

						{/* Track selector */}
						<Autocomplete
							size="small"
							value={selectedTrack}
							options={trackData}
							getOptionLabel={(track) => track.trackName}
							onChange={(e, newValue) => {
								setSelectedTrack(newValue);
								setRaceResult(null);
							}}
							sx={{ width: 220 }}
							renderOption={(props, track) => (
								<Box component="li" {...props} sx={{ fontSize: '0.8rem' }}>
									{track.trackName}
								</Box>
							)}
							renderInput={(params) => (
								<TextField {...params} label="Track" placeholder="Select track..." />
							)}
						/>

						{selectedTrack && (
							<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
								<Chip label={selectedTrack.weather} size="small" color={selectedTrack.weather === "Sunny" ? "warning" : "info"} />
								<Chip label={selectedTrack.surface} size="small" />
								{selectedTrack.speedbumps > 0 && <Chip label={`SB: ${selectedTrack.speedbumps}`} size="small" color="error" />}
								{selectedTrack.humps > 0 && <Chip label={`H: ${selectedTrack.humps}`} size="small" color="secondary" />}
							</Box>
						)}

						<Button
							variant="contained"
							size="large"
							startIcon={<SpeedIcon />}
							onClick={runRace}
							disabled={!selectedTrack || !car1 || !car2}
							sx={{
								backgroundColor: '#ff9800',
								'&:hover': { backgroundColor: '#f57c00' },
								fontWeight: 'bold',
								mt: 1,
							}}
						>
							RACE!
						</Button>

						{/* Race Result - Compact inline display */}
						{raceResult && (
							<Box sx={{
								mt: 1,
								p: 1.5,
								borderRadius: 2,
								backgroundColor: raceResult.tie ? 'rgba(255, 193, 7, 0.3)' :
									raceResult.playerWon ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
								border: `2px solid ${raceResult.tie ? '#ffc107' : raceResult.playerWon ? '#4caf50' : '#f44336'}`,
								textAlign: 'center',
								width: '100%',
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
									<EmojiEventsIcon sx={{
										fontSize: 28,
										color: raceResult.tie ? '#ffc107' : raceResult.playerWon ? '#4caf50' : '#f44336'
									}} />
									<Typography variant="h6" fontWeight="bold" sx={{
										color: raceResult.tie ? '#ffc107' : raceResult.playerWon ? '#4caf50' : '#f44336'
									}}>
										{raceResult.tie ? "TIE!" :
											raceResult.playerWon ? "CAR 1 WINS!" : "CAR 2 WINS!"}
									</Typography>
								</Box>
								{!raceResult.tie && (
									<Typography variant="body2" sx={{ color: raceResult.playerWon ? '#4caf50' : '#f44336' }}>
										+{Math.abs(raceResult.score)} points
									</Typography>
								)}
								{!raceResult.tie && (
									<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
										{raceResult.advantages.map((adv, idx) => (
											<Chip key={idx} label={adv} size="small" 
												sx={{ 
													fontSize: '0.65rem', 
													height: 22,
													backgroundColor: raceResult.playerWon ? '#4caf5050' : '#f4433650',
													color: raceResult.playerWon ? '#4caf50' : '#f44336',
												}} 
											/>
										))}
									</Box>
								)}
							</Box>
						)}
					</Box>

					{/* Car 2 Slot */}
					<CarSlot
						car={car2}
						upgrade={car2Upgrade}
						setUpgrade={setCar2Upgrade}
						slotNum={2}
						color="#f44336"
					/>
				</Box>
			</Paper>

			{/* Car Selection - Bottom Section */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				{/* Controls */}
				<Box sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 2,
					alignItems: 'center',
					mb: 2,
				}}>
					{/* Slot Toggle */}
					<Box>
						<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
							Assign to:
						</Typography>
						<ToggleButtonGroup
							value={activeSlot}
							exclusive
							onChange={(e, newSlot) => newSlot && setActiveSlot(newSlot)}
							size="small"
						>
							<ToggleButton value={1} sx={{
								'&.Mui-selected': { backgroundColor: '#4caf5050', color: '#4caf50' }
							}}>
								Car 1
							</ToggleButton>
							<ToggleButton value={2} sx={{
								'&.Mui-selected': { backgroundColor: '#f4433650', color: '#f44336' }
							}}>
								Car 2
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>

					{/* Search */}
					<TextField
						size="small"
						placeholder="Search cars..."
						value={searchQuery}
						onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
						sx={{ flex: 1, minWidth: 200 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>

					<Typography variant="body2" color="text.secondary">
						{filteredCars.length} cars
					</Typography>
				</Box>

				{/* Car Grid - matching Home/Cards.jsx style */}
				<Box sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '0.71rem',
					justifyContent: 'center',
					mb: 2,
				}}>
					{paginatedCars.map((car) => (
						<Button
							key={car.carID}
							onClick={() => handleCardClick(car)}
							className="carCard"
							sx={{
								border: car1?.carID === car.carID
									? '2px solid #4caf50 !important'
									: car2?.carID === car.carID
										? '2px solid #f44336 !important'
										: undefined,
							}}
						>
							<div style={{ position: 'relative' }}>
								<LazyLoadImage
									threshold={200}
									effect="blur"
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
									{ value: { Performance: 'PER', Standard: 'STD', 'Off-Road': 'OFF', 'All-Surface': 'ALL', Drag: 'DRG', Slick: 'SLK' }[car.tyreType] || '', top: '93px' },
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
							<p style={{
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

				{/* Pagination */}
				{totalPages > 1 && (
					<Stack>
						<Pagination
							sx={{
								display: 'flex',
								justifyContent: 'center',
								'& .MuiPaginationItem-root': {
									color: 'white',
									borderColor: 'rgba(255,255,255,0.3)',
								},
							}}
							count={totalPages}
							page={page}
							onChange={(e, value) => setPage(value)}
							variant="outlined"
							shape="rounded"
							size="small"
						/>
					</Stack>
				)}
			</Paper>

			{/* Car Detail Modal with "Use" button */}
			<CarDetailModal
				car={modalCar}
				open={modalOpen}
				onClose={() => { setModalOpen(false); setModalCar(null); }}
				accentColor={activeSlot === 1 ? '#4caf50' : '#f44336'}
				actionButton={
					<Button
						variant="contained"
						fullWidth
						onClick={handleUseFromModal}
						sx={{
							backgroundColor: activeSlot === 1 ? '#4caf50' : '#f44336',
							fontWeight: 'bold',
							fontFamily: 'Rubik-BoldItalic',
							'&:hover': {
								backgroundColor: activeSlot === 1 ? '#388e3c' : '#d32f2f',
							},
						}}
					>
						Use as {activeSlot === 1 ? 'Car 1 (You)' : 'Car 2 (Opponent)'}
					</Button>
				}
			/>
		</Box>
	);
};

export default RaceSimulator;
