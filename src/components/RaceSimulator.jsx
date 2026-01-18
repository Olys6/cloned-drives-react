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

// Icons
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import ClearIcon from '@mui/icons-material/Clear';

// ========== RACE CONSTANTS ==========
const driveHierarchy = ["AWD", "4WD", "FWD", "RWD"];
const gcHierarchy = ["High", "Medium", "Low"];

const weatherVars = {
	"Sunny Drag": {
		drivePen: 0, absPen: 0, tcsPen: 1,
		tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": -7.5 }
	},
	"Rainy Drag": {
		drivePen: 2, absPen: 0, tcsPen: 1,
		tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 20, "Drag": 70 }
	},
	"Sunny Track": {
		drivePen: 0, absPen: 0, tcsPen: 0,
		tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": -16, "Drag": 9 }
	},
	"Rainy Track": {
		drivePen: 4, absPen: 1, tcsPen: 1,
		tyrePen: { "Standard": 0, "Performance": 11, "All-Surface": 5, "Off-Road": 50, "Slick": 40, "Drag": 120 }
	},
	"Sunny Asphalt": {
		drivePen: 0, absPen: 0, tcsPen: 0,
		tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": 5 }
	},
	"Rainy Asphalt": {
		drivePen: 4, absPen: 1, tcsPen: 1,
		tyrePen: { "Standard": 0, "Performance": 11, "All-Surface": 5, "Off-Road": 40, "Slick": 50, "Drag": 100 }
	},
	"Sunny Gravel": {
		drivePen: 2, absPen: 0, tcsPen: 0,
		tyrePen: { "Standard": 0, "Performance": 17.5, "All-Surface": -4, "Off-Road": -4.5, "Slick": 40, "Drag": 100 }
	},
	"Rainy Gravel": {
		drivePen: 5.5, absPen: 1.25, tcsPen: 1.25,
		tyrePen: { "Standard": 0, "Performance": 17.5, "All-Surface": -5.5, "Off-Road": -7.5, "Slick": 42.5, "Drag": 200 }
	},
	"Sunny Sand": {
		drivePen: 5.5, absPen: -1.25, tcsPen: -1.25,
		tyrePen: { "Standard": 0, "Performance": 50.5, "All-Surface": -15.5, "Off-Road": -20.5, "Slick": 80.5, "Drag": 500 }
	},
	"Sunny Dirt": {
		drivePen: 7, absPen: 1.75, tcsPen: 1.75,
		tyrePen: { "Standard": 0, "Performance": 20, "All-Surface": -25, "Off-Road": -33, "Slick": 65, "Drag": 500 }
	},
	"Rainy Dirt": {
		drivePen: 8.5, absPen: 2.5, tcsPen: 2.5,
		tyrePen: { "Standard": 0, "Performance": 30, "All-Surface": -40, "Off-Road": -60, "Slick": 130, "Drag": 500 }
	},
	"Sunny Snow": {
		drivePen: 12, absPen: 3, tcsPen: 3,
		tyrePen: { "Standard": 0, "Performance": 75, "All-Surface": -20, "Off-Road": -45, "Slick": 425, "Drag": 700 }
	},
	"Sunny Ice": {
		drivePen: 17, absPen: 4.25, tcsPen: 4.25,
		tyrePen: { "Standard": 0, "Performance": 125, "All-Surface": -65, "Off-Road": -100, "Slick": 875, "Drag": 900 }
	},
	"TT OffRoad": {
		drivePen: 0, absPen: 0, tcsPen: 0,
		tyrePen: { "Standard": 0, "Performance": 100, "All-Surface": -75, "Off-Road": -100, "Slick": 400, "Drag": 700 }
	},
	"TT OnRoad": {
		drivePen: 0, absPen: 0, tcsPen: 0,
		tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": 0 }
	},
};

// Check if car has specific upgrade (flat property format: 333TopSpeed, 3330to60, etc.)
const hasUpgrade = (car, upgrade) => {
	if (!car) return false;
	if (upgrade === "000") return true;
	// Check if the upgrade properties exist (e.g., "333TopSpeed")
	return car[`${upgrade}TopSpeed`] !== undefined;
};

// Get car stats for selected upgrade
const getCarStats = (car, upgrade) => {
	if (!car) return null;

	let topSpeed, accel, handling;

	if (upgrade === "000") {
		topSpeed = car.topSpeed;
		accel = car["0to60"];
		handling = car.handling;
	} else {
		// Flat property format: 333TopSpeed, 3330to60, 333Handling
		topSpeed = car[`${upgrade}TopSpeed`] ?? car.topSpeed;
		accel = car[`${upgrade}0to60`] ?? car["0to60"];
		handling = car[`${upgrade}Handling`] ?? car.handling;
	}

	return {
		topSpeed,
		accel,
		handling,
		weight: car.weight,
		mra: car.mra,
		ola: car.ola,
		gc: car.gc,
		driveType: car.driveType,
		tyreType: car.tyreType,
		abs: car.abs ? 1 : 0,
		tcs: car.tcs ? 1 : 0,
	};
};

// ========== RACE CALCULATION ==========
const evalScore = (player, opponent, track) => {
	const weatherKey = track.surface?.startsWith("TT") ? track.surface : `${track.weather} ${track.surface}`;
	const vars = weatherVars[weatherKey] || weatherVars["Sunny Asphalt"];
	const { tcsPen, absPen, drivePen, tyrePen } = vars;

	let score = 0;

	// Base stats calculation
	score += (player.topSpeed - opponent.topSpeed) / 4.2 * ((track.specsDistr?.topSpeed || 0) / 100);
	score += (opponent.accel - player.accel) * 15 * ((track.specsDistr?.["0to60"] || 0) / 100);
	score += (player.handling - opponent.handling) * ((track.specsDistr?.handling || 0) / 100);
	score += (opponent.weight - player.weight) / 50 * ((track.specsDistr?.weight || 0) / 100);
	score += (player.mra - opponent.mra) / 10 * ((track.specsDistr?.mra || 0) / 100);
	score += (opponent.ola - player.ola) / 10 * ((track.specsDistr?.ola || 0) / 100);

	// GC penalties
	if (player.gc?.toLowerCase() === "low") {
		score -= ((track.speedbumps || 0) * 10);
	}
	if (opponent.gc?.toLowerCase() === "low") {
		score += ((track.speedbumps || 0) * 10);
	}
	score += (gcHierarchy.indexOf(opponent.gc) - gcHierarchy.indexOf(player.gc)) * (track.humps || 0) * 10;

	// Drive & tyre penalties
	score += (driveHierarchy.indexOf(opponent.driveType) - driveHierarchy.indexOf(player.driveType)) * drivePen;
	score += ((tyrePen[opponent.tyreType] || 0) - (tyrePen[player.tyreType] || 0));

	// ABS/TCS
	if ((track.specsDistr?.handling || 0) > 0) {
		score += (player.abs - opponent.abs) * absPen;
	}
	score += (player.tcs - opponent.tcs) * tcsPen;

	// Special cases for MPH tracks
	if (track.trackName && track.trackName.includes("MPH")) {
		const parts = track.trackName.match(/(\d+)-(\d+)/);
		if (parts) {
			const startMPH = parseInt(parts[1]);
			const endMPH = parseInt(parts[2]);

			if ((opponent.topSpeed < startMPH && player.topSpeed >= startMPH) ||
				(opponent.topSpeed < endMPH && player.topSpeed >= endMPH)) {
				return 250;
			} else if ((opponent.topSpeed >= startMPH && player.topSpeed < startMPH) ||
				(opponent.topSpeed >= endMPH && player.topSpeed < endMPH)) {
				return -250;
			} else if (opponent.topSpeed < endMPH && player.topSpeed < endMPH) {
				return player.topSpeed - opponent.topSpeed;
			}
		}
	}

	return Math.round((score + Number.EPSILON) * 100) / 100;
};

// Get advantages for the winner
const getAdvantages = (player, opponent, track, playerWon) => {
	const advantages = [];
	const weatherKey = track.surface?.startsWith("TT") ? track.surface : `${track.weather} ${track.surface}`;
	const vars = weatherVars[weatherKey] || weatherVars["Sunny Asphalt"];
	const { tyrePen } = vars;

	if ((track.specsDistr?.topSpeed || 0) > 0) {
		const diff = playerWon ? player.topSpeed - opponent.topSpeed : opponent.topSpeed - player.topSpeed;
		if (diff > 0) advantages.push("Higher top speed");
	}
	if ((track.specsDistr?.["0to60"] || 0) > 0) {
		const diff = playerWon ? opponent.accel - player.accel : player.accel - opponent.accel;
		if (diff > 0) advantages.push("Lower 0-60");
	}
	if ((track.specsDistr?.handling || 0) > 0) {
		const diff = playerWon ? player.handling - opponent.handling : opponent.handling - player.handling;
		if (diff > 0) advantages.push("Better handling");
	}
	if ((track.specsDistr?.weight || 0) > 0) {
		const diff = playerWon ? opponent.weight - player.weight : player.weight - opponent.weight;
		if (diff > 0) advantages.push("Lower weight");
	}
	if ((track.specsDistr?.mra || 0) > 0) {
		const diff = playerWon ? player.mra - opponent.mra : opponent.mra - player.mra;
		if (diff > 0) advantages.push("Better MRA");
	}
	if ((track.specsDistr?.ola || 0) > 0) {
		const diff = playerWon ? opponent.ola - player.ola : player.ola - opponent.ola;
		if (diff > 0) advantages.push("Better OLA");
	}

	if ((track.humps || 0) > 0 || (track.speedbumps || 0) > 0) {
		const playerGC = gcHierarchy.indexOf(player.gc);
		const oppGC = gcHierarchy.indexOf(opponent.gc);
		if ((playerWon && playerGC < oppGC) || (!playerWon && oppGC < playerGC)) {
			advantages.push("Higher ground clearance");
		}
	}

	if (!["Asphalt", "Drag", "Track"].includes(track.surface) || track.weather === "Rainy") {
		const playerDrive = driveHierarchy.indexOf(player.driveType);
		const oppDrive = driveHierarchy.indexOf(opponent.driveType);
		if ((playerWon && playerDrive < oppDrive) || (!playerWon && oppDrive < playerDrive)) {
			advantages.push("Better drive system");
		}

		const playerTyre = tyrePen[player.tyreType] || 0;
		const oppTyre = tyrePen[opponent.tyreType] || 0;
		if ((playerWon && playerTyre < oppTyre) || (!playerWon && oppTyre < playerTyre)) {
			advantages.push("Better tyres");
		}
	}

	return advantages.length > 0 ? advantages : ["Marginal overall advantage"];
};

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

	const runRace = () => {
		if (!selectedTrack || !car1 || !car2) return;

		const player = getCarStats(car1, car1Upgrade);
		const opponent = getCarStats(car2, car2Upgrade);

		if (!player || !opponent) return;

		const score = evalScore(player, opponent, selectedTrack);
		const playerWon = score > 0;
		const advantages = getAdvantages(player, opponent, selectedTrack, playerWon);

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
								<StatRow label="0-60" value={stats.accel} />
								<StatRow label="Handling" value={stats.handling} />
								<StatRow label="Weight" value={`${stats.weight} kg`} />
								<StatRow label="Drivetrain" value={stats.driveType} />
								<StatRow label="Tyre Type" value={stats.tyreType} />
								<StatRow label="Ground Clearance" value={stats.gc} />
								<StatRow label="MRA" value={stats.mra} />
								<StatRow label="OLA" value={stats.ola} />
								<StatRow label="TCS / ABS" value={`${car.tcs ? '✓' : '✗'} / ${car.abs ? '✓' : '✗'}`} />
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

				{/* Car Grid */}
				<Box sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					justifyContent: 'center',
					mb: 2,
				}}>
					{paginatedCars.map((car) => (
						<Button
							key={car.carID}
							onClick={() => handleCarSelect(car)}
							sx={{
								p: 0.5,
								borderRadius: 1,
								border: `2px solid ${
									car1?.carID === car.carID ? '#4caf50' :
									car2?.carID === car.carID ? '#f44336' : 'transparent'
								}`,
								backgroundColor: 'rgba(0,0,0,0.3)',
								'&:hover': {
									backgroundColor: activeSlot === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
								},
								flexDirection: 'column',
								minWidth: 140,
								maxWidth: 140,
							}}
						>
							<img
								src={car.racehud}
								alt=""
								style={{ width: 130, height: 80, objectFit: 'cover', borderRadius: 4 }}
								loading="lazy"
							/>
							<Typography variant="caption" sx={{
								color: '#fff',
								fontWeight: 'bold',
								fontSize: '0.65rem',
								lineHeight: 1.2,
								mt: 0.5,
								textAlign: 'center',
								width: '100%',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}>
								{car.model}
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
								CR {car.cr} • {car.driveType} • {car.tyreType}
							</Typography>
						</Button>
					))}
				</Box>

				{/* Pagination */}
				{totalPages > 1 && (
					<Stack>
						<Pagination
							sx={{ display: 'flex', justifyContent: 'center' }}
							count={totalPages}
							page={page}
							onChange={(e, value) => setPage(value)}
							variant="outlined"
							color="primary"
							size="small"
						/>
					</Stack>
				)}
			</Paper>
		</Box>
	);
};

export default RaceSimulator;
