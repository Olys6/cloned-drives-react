import { useState, useEffect, useCallback, useMemo } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Chip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	IconButton,
	Tooltip,
	LinearProgress,
	Fade,
	Zoom,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';

// Icons
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import TuneIcon from '@mui/icons-material/Tune';
import StarIcon from '@mui/icons-material/Star';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Data & Utils
import carData from '../data/data.js';
import { getThumbnailUrl } from './imageUtils';

// ============ CONSTANTS ============

const DIFFICULTIES = {
	easy: {
		name: 'Easy',
		color: '#4caf50',
		description: 'Shows make, year, and rarity hint',
		hints: ['make', 'year', 'rarity'],
		scoreMultiplier: 1,
	},
	medium: {
		name: 'Medium',
		color: '#ff9800',
		description: 'Shows make only',
		hints: ['make'],
		scoreMultiplier: 2,
	},
	hard: {
		name: 'Hard',
		color: '#f44336',
		description: 'No hints - just the image!',
		hints: [],
		scoreMultiplier: 3,
	},
	extreme: {
		name: 'Extreme',
		color: '#9c27b0',
		description: 'No hints + silhouette only',
		hints: [],
		scoreMultiplier: 5,
		silhouette: true,
	},
};

const STATS = {
	cr: {
		name: 'CR (Class Rating)',
		key: 'cr',
		icon: <StarIcon />,
		color: '#ffd700',
		format: (v) => v?.toFixed(0) || '?',
		higherBetter: true,
	},
	topSpeed: {
		name: 'Top Speed',
		key: 'topSpeed',
		icon: <SpeedIcon />,
		color: '#2196f3',
		format: (v) => v ? `${v} mph` : '?',
		higherBetter: true,
	},
	acceleration: {
		name: '0-60 mph',
		key: '0to60',
		icon: <TimerIcon />,
		color: '#4caf50',
		format: (v) => v ? `${v}s` : '?',
		higherBetter: false, // Lower is better for 0-60
	},
	handling: {
		name: 'Handling',
		key: 'handling',
		icon: <TuneIcon />,
		color: '#e91e63',
		format: (v) => v?.toFixed(0) || '?',
		higherBetter: true,
	},
};

const RARITY_THRESHOLDS = [
	{ min: 0, max: 19.99, name: 'Standard', color: '#9e9e9e' },
	{ min: 20, max: 39.99, name: 'Common', color: '#8bc34a' },
	{ min: 40, max: 54.99, name: 'Uncommon', color: '#03a9f4' },
	{ min: 55, max: 69.99, name: 'Rare', color: '#9c27b0' },
	{ min: 70, max: 79.99, name: 'Epic', color: '#ff9800' },
	{ min: 80, max: 89.99, name: 'Exotic', color: '#f44336' },
	{ min: 90, max: 100, name: 'Legendary', color: '#ffd700' },
];

const getRarity = (cr) => {
	return RARITY_THRESHOLDS.find(r => cr >= r.min && cr <= r.max) || RARITY_THRESHOLDS[0];
};

const getCarName = (car) => {
	if (!car) return 'Unknown';
	return `${car.make || ''} ${car.model || ''} ${car.modelYear ? `(${car.modelYear})` : ''}`.trim();
};

// Filter valid cars (must have all stats)
const getValidCars = () => {
	return carData.filter(car => 
		car.cr && 
		car.topSpeed && 
		car["0to60"] && 
		car.handling &&
		car.racehud &&
		!car.reference
	);
};

// ============ STORAGE ============

const STORAGE_KEY = 'cdclub_higherlower';

const loadHighScores = () => {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return JSON.parse(saved);
	} catch (e) {
		console.error('Failed to load high scores:', e);
	}
	return {};
};

const saveHighScore = (difficulty, stat, score) => {
	try {
		const scores = loadHighScores();
		const key = `${difficulty}_${stat}`;
		if (!scores[key] || score > scores[key]) {
			scores[key] = score;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
			return true; // New high score!
		}
	} catch (e) {
		console.error('Failed to save high score:', e);
	}
	return false;
};

// ============ COMPONENTS ============

const CarCard = ({ car, revealed, difficulty, statConfig, showResult, isCorrect, isCurrentCard }) => {
	const difficultyConfig = DIFFICULTIES[difficulty];
	const hints = difficultyConfig.hints;
	const rarity = getRarity(car.cr);
	const statValue = car[statConfig.key];
	const isSilhouette = difficultyConfig.silhouette && !revealed;
	
	return (
		<Paper
			elevation={6}
			sx={{
				p: 2,
				backgroundColor: showResult 
					? (isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)')
					: 'rgba(30, 30, 30, 0.95)',
				border: `3px solid ${showResult ? (isCorrect ? '#4caf50' : '#f44336') : (revealed ? rarity.color : '#555')}`,
				borderRadius: 3,
				width: '100%',
				maxWidth: 320,
				transition: 'all 0.3s ease',
				transform: isCurrentCard ? 'scale(1)' : 'scale(0.95)',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Result indicator */}
			{showResult && (
				<Box sx={{ 
					position: 'absolute', 
					top: 8, 
					right: 8, 
					zIndex: 2,
				}}>
					{isCorrect ? (
						<CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
					) : (
						<CancelIcon sx={{ color: '#f44336', fontSize: 32 }} />
					)}
				</Box>
			)}
			
			{/* Car Image */}
			<Box sx={{ 
				position: 'relative', 
				borderRadius: 2, 
				overflow: 'hidden',
				mb: 2,
			}}>
				<img
					src={getThumbnailUrl(car.racehud, 300, 150)}
					alt={revealed ? getCarName(car) : '???'}
					style={{
						width: '100%',
						height: 140,
						objectFit: 'cover',
						filter: isSilhouette ? 'brightness(0)' : 'none',
						transition: 'filter 0.5s ease',
					}}
				/>
				{!revealed && (
					<Box sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: isSilhouette ? 'transparent' : 'rgba(0,0,0,0.5)',
					}}>
						<Typography variant="h3" sx={{ color: '#fff', opacity: 0.8 }}>
							?
						</Typography>
					</Box>
				)}
			</Box>
			
			{/* Car Info */}
			<Box sx={{ minHeight: 80 }}>
				{revealed ? (
					<>
						<Typography variant="subtitle1" fontWeight="bold" noWrap title={getCarName(car)}>
							{getCarName(car)}
						</Typography>
						<Chip
							label={rarity.name}
							size="small"
							sx={{ backgroundColor: rarity.color, color: '#fff', mb: 1 }}
						/>
					</>
				) : (
					<>
						{/* Hints based on difficulty */}
						{hints.includes('make') && (
							<Typography variant="subtitle1" fontWeight="bold">
								{car.make} ???
							</Typography>
						)}
						{hints.includes('year') && (
							<Typography variant="body2" color="text.secondary">
								Year: {car.modelYear || '???'}
							</Typography>
						)}
						{hints.includes('rarity') && (
							<Chip
								label={`${rarity.name} Class`}
								size="small"
								sx={{ backgroundColor: rarity.color, color: '#fff', mt: 0.5 }}
							/>
						)}
						{hints.length === 0 && (
							<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
								No hints available
							</Typography>
						)}
					</>
				)}
			</Box>
			
			{/* Stat Display */}
			<Paper sx={{ 
				p: 1.5, 
				backgroundColor: revealed ? statConfig.color + '33' : 'rgba(255,255,255,0.05)',
				borderRadius: 2,
				mt: 1,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
					<Box sx={{ color: statConfig.color }}>
						{statConfig.icon}
					</Box>
					<Typography variant="h5" fontWeight="bold" sx={{ color: revealed ? statConfig.color : '#666' }}>
						{revealed ? statConfig.format(statValue) : '???'}
					</Typography>
				</Box>
				<Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
					{statConfig.name}
				</Typography>
			</Paper>
		</Paper>
	);
};

// ============ MAIN COMPONENT ============

const HigherLower = () => {
	// Game state
	const [gamePhase, setGamePhase] = useState('menu'); // menu, playing, result, gameover
	const [difficulty, setDifficulty] = useState('easy');
	const [selectedStat, setSelectedStat] = useState('cr');
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [currentCar, setCurrentCar] = useState(null);
	const [nextCar, setNextCar] = useState(null);
	const [revealed, setRevealed] = useState(false);
	const [lastResult, setLastResult] = useState(null); // 'correct' | 'wrong'
	const [isNewHighScore, setIsNewHighScore] = useState(false);
	const [showRules, setShowRules] = useState(false);
	
	// Get valid cars
	const validCars = useMemo(() => getValidCars(), []);
	
	// Load high score on mount and when settings change
	useEffect(() => {
		const scores = loadHighScores();
		const key = `${difficulty}_${selectedStat}`;
		setHighScore(scores[key] || 0);
	}, [difficulty, selectedStat]);
	
	// Get random car (avoiding the excluded one)
	const getRandomCar = useCallback((excludeId = null) => {
		const available = excludeId 
			? validCars.filter(c => c.carID !== excludeId)
			: validCars;
		return available[Math.floor(Math.random() * available.length)];
	}, [validCars]);
	
	// Start new game
	const startGame = useCallback(() => {
		const car1 = getRandomCar();
		const car2 = getRandomCar(car1.carID);
		setCurrentCar(car1);
		setNextCar(car2);
		setScore(0);
		setRevealed(false);
		setLastResult(null);
		setIsNewHighScore(false);
		setGamePhase('playing');
	}, [getRandomCar]);
	
	// Handle guess
	const handleGuess = useCallback((guessHigher) => {
		if (revealed || gamePhase !== 'playing') return;
		
		const statConfig = STATS[selectedStat];
		const currentValue = currentCar[statConfig.key];
		const nextValue = nextCar[statConfig.key];
		
		// Determine if next is actually higher
		const isActuallyHigher = nextValue > currentValue;
		const isEqual = nextValue === currentValue;
		
		// Check if guess is correct
		// If equal, either guess is correct
		const isCorrect = isEqual || (guessHigher === isActuallyHigher);
		
		setRevealed(true);
		setLastResult(isCorrect ? 'correct' : 'wrong');
		
		if (isCorrect) {
			const diffMultiplier = DIFFICULTIES[difficulty].scoreMultiplier;
			const newScore = score + (100 * diffMultiplier);
			setScore(newScore);
			
			// Move to next round after delay
			setTimeout(() => {
				setCurrentCar(nextCar);
				setNextCar(getRandomCar(nextCar.carID));
				setRevealed(false);
				setLastResult(null);
			}, 1500);
		} else {
			// Game over
			setTimeout(() => {
				const newHighScore = saveHighScore(difficulty, selectedStat, score);
				setIsNewHighScore(newHighScore);
				if (newHighScore) {
					setHighScore(score);
				}
				setGamePhase('gameover');
			}, 2000);
		}
	}, [revealed, gamePhase, currentCar, nextCar, selectedStat, score, difficulty, getRandomCar]);
	
	const statConfig = STATS[selectedStat];
	const difficultyConfig = DIFFICULTIES[difficulty];
	
	return (
		<Box sx={{ p: 2, maxWidth: 900, mx: 'auto', minHeight: 'calc(100vh - 100px)' }}>
			{/* Header */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant="h5" fontWeight="bold">ðŸŽ¯ Higher or Lower</Typography>
						<Tooltip title="How to Play">
							<IconButton size="small" onClick={() => setShowRules(true)}>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</Box>
					
					{gamePhase === 'playing' && (
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
							<Chip
								icon={<EmojiEventsIcon />}
								label={`Score: ${score}`}
								sx={{ backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold' }}
							/>
							<Chip
								icon={<StarIcon />}
								label={`Best: ${highScore}`}
								sx={{ backgroundColor: '#ffd700', color: '#000' }}
							/>
							<Chip
								label={difficultyConfig.name}
								sx={{ backgroundColor: difficultyConfig.color, color: '#fff' }}
							/>
						</Box>
					)}
				</Box>
			</Paper>
			
			{/* Menu Phase */}
			{gamePhase === 'menu' && (
				<Fade in>
					<Paper sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
						<Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
							Car Higher or Lower
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
							Guess if the next car's stat is higher or lower!
						</Typography>
						
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, mx: 'auto' }}>
							{/* Difficulty Selection */}
							<FormControl fullWidth>
								<InputLabel>Difficulty</InputLabel>
								<Select
									value={difficulty}
									onChange={(e) => setDifficulty(e.target.value)}
									label="Difficulty"
								>
									{Object.entries(DIFFICULTIES).map(([key, config]) => (
										<MenuItem key={key} value={key}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: config.color }} />
												<span>{config.name}</span>
												<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
													({config.scoreMultiplier}x points)
												</Typography>
											</Box>
										</MenuItem>
									))}
								</Select>
							</FormControl>
							
							<Typography variant="body2" color="text.secondary">
								{DIFFICULTIES[difficulty].description}
							</Typography>
							
							{/* Stat Selection */}
							<FormControl fullWidth>
								<InputLabel>Compare By</InputLabel>
								<Select
									value={selectedStat}
									onChange={(e) => setSelectedStat(e.target.value)}
									label="Compare By"
								>
									{Object.entries(STATS).map(([key, config]) => (
										<MenuItem key={key} value={key}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Box sx={{ color: config.color }}>{config.icon}</Box>
												<span>{config.name}</span>
												{!config.higherBetter && (
													<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
														(lower is better)
													</Typography>
												)}
											</Box>
										</MenuItem>
									))}
								</Select>
							</FormControl>
							
							{/* High Score Display */}
							<Paper sx={{ p: 2, backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700' }}>
								<Typography variant="subtitle2" color="text.secondary">
									High Score ({DIFFICULTIES[difficulty].name} - {STATS[selectedStat].name})
								</Typography>
								<Typography variant="h4" sx={{ color: '#ffd700' }}>
									{loadHighScores()[`${difficulty}_${selectedStat}`] || 0}
								</Typography>
							</Paper>
							
							<Button
								variant="contained"
								size="large"
								startIcon={<PlayArrowIcon />}
								onClick={startGame}
								sx={{ py: 2, fontSize: '1.2rem' }}
							>
								Start Game
							</Button>
						</Box>
					</Paper>
				</Fade>
			)}
			
			{/* Playing Phase */}
			{gamePhase === 'playing' && currentCar && nextCar && (
				<Box>
					{/* Stat being compared */}
					<Paper sx={{ p: 1.5, mb: 2, backgroundColor: statConfig.color + '22', textAlign: 'center' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
							<Box sx={{ color: statConfig.color }}>{statConfig.icon}</Box>
							<Typography variant="h6">
								Comparing: <strong>{statConfig.name}</strong>
							</Typography>
							{!statConfig.higherBetter && (
								<Chip label="Lower is better!" size="small" color="info" />
							)}
						</Box>
					</Paper>
					
					{/* Cards */}
					<Box sx={{ 
						display: 'flex', 
						gap: 3, 
						justifyContent: 'center', 
						alignItems: 'center',
						flexWrap: 'wrap',
						mb: 3,
					}}>
						{/* Current Car (always revealed) */}
						<CarCard
							car={currentCar}
							revealed={true}
							difficulty={difficulty}
							statConfig={statConfig}
							isCurrentCard={true}
						/>
						
						{/* VS */}
						<Box sx={{ 
							display: 'flex', 
							flexDirection: 'column', 
							alignItems: 'center',
							gap: 1,
						}}>
							<Typography variant="h4" sx={{ color: '#666' }}>VS</Typography>
							{!revealed && (
								<Typography variant="caption" color="text.secondary">
									Is it higher or lower?
								</Typography>
							)}
						</Box>
						
						{/* Next Car (hidden until guess) */}
						<CarCard
							car={nextCar}
							revealed={revealed}
							difficulty={difficulty}
							statConfig={statConfig}
							showResult={revealed}
							isCorrect={lastResult === 'correct'}
							isCurrentCard={false}
						/>
					</Box>
					
					{/* Guess Buttons */}
					{!revealed && (
						<Zoom in>
							<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
								<Button
									variant="contained"
									size="large"
									startIcon={<KeyboardArrowUpIcon />}
									onClick={() => handleGuess(true)}
									sx={{ 
										px: 4, 
										py: 2, 
										fontSize: '1.1rem',
										backgroundColor: '#4caf50',
										'&:hover': { backgroundColor: '#388e3c' },
									}}
								>
									Higher
								</Button>
								<Button
									variant="contained"
									size="large"
									startIcon={<KeyboardArrowDownIcon />}
									onClick={() => handleGuess(false)}
									sx={{ 
										px: 4, 
										py: 2, 
										fontSize: '1.1rem',
										backgroundColor: '#f44336',
										'&:hover': { backgroundColor: '#d32f2f' },
									}}
								>
									Lower
								</Button>
							</Box>
						</Zoom>
					)}
					
					{/* Result Message */}
					{revealed && lastResult && (
						<Fade in>
							<Box sx={{ textAlign: 'center', mt: 2 }}>
								<Typography 
									variant="h4" 
									sx={{ 
										color: lastResult === 'correct' ? '#4caf50' : '#f44336',
										fontWeight: 'bold',
									}}
								>
									{lastResult === 'correct' ? <><CheckIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />Correct!</> : <><CloseIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />Wrong!</>}
								</Typography>
								{lastResult === 'correct' && (
									<Typography variant="body1" color="text.secondary">
										+{100 * difficultyConfig.scoreMultiplier} points! Next car coming...
									</Typography>
								)}
							</Box>
						</Fade>
					)}
				</Box>
			)}
			
			{/* Game Over Phase */}
			{gamePhase === 'gameover' && (
				<Fade in>
					<Paper sx={{ p: 4, backgroundColor: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
						<Typography variant="h3" gutterBottom sx={{ color: '#f44336' }}>
							Game Over!
						</Typography>
						
						{isNewHighScore && (
							<Zoom in>
								<Box sx={{ mb: 3 }}>
									<Typography variant="h5" sx={{ color: '#ffd700', mb: 1 }}>
										ðŸŽ‰ NEW HIGH SCORE! ðŸŽ‰
									</Typography>
								</Box>
							</Zoom>
						)}
						
						<Typography variant="h4" sx={{ mb: 3 }}>
							Final Score: <span style={{ color: '#4caf50' }}>{score}</span>
						</Typography>
						
						<Box sx={{ mb: 3 }}>
							<Typography variant="body1" color="text.secondary">
								Difficulty: {difficultyConfig.name} | Stat: {statConfig.name}
							</Typography>
							<Typography variant="body1" color="text.secondary">
								High Score: {highScore}
							</Typography>
						</Box>
						
						{/* Show the final comparison */}
						{currentCar && nextCar && (
							<Box sx={{ mb: 4 }}>
								<Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
									The answer was:
								</Typography>
								<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
									<Chip 
										label={`${getCarName(currentCar)}: ${statConfig.format(currentCar[statConfig.key])}`}
										sx={{ backgroundColor: '#333' }}
									/>
									<Chip 
										label={`${getCarName(nextCar)}: ${statConfig.format(nextCar[statConfig.key])}`}
										sx={{ backgroundColor: '#333' }}
									/>
								</Box>
							</Box>
						)}
						
						<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
							<Button
								variant="contained"
								size="large"
								startIcon={<RestartAltIcon />}
								onClick={startGame}
							>
								Play Again
							</Button>
							<Button
								variant="outlined"
								size="large"
								onClick={() => setGamePhase('menu')}
							>
								Change Settings
							</Button>
						</Box>
					</Paper>
				</Fade>
			)}
			
			{/* Rules Dialog */}
			<Dialog open={showRules} onClose={() => setShowRules(false)} maxWidth="sm" fullWidth>
				<DialogTitle>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<HelpIcon sx={{ color: '#2196f3' }} />
						How to Play
					</Box>
				</DialogTitle>
				<DialogContent>
					<Typography variant="body1" paragraph>
						Guess whether the next car's stat is <strong>higher</strong> or <strong>lower</strong> than the current car!
					</Typography>
					
					<Typography variant="subtitle2" sx={{ mt: 2, color: '#ffd700' }}>Stats:</Typography>
					<Typography variant="body2" component="div">
						- <strong>CR</strong> - Class Rating (overall car rating)<br/>
						- <strong>Top Speed</strong> - Maximum speed in mph<br/>
						- <strong>0-60</strong> - Acceleration time (lower = faster!)<br/>
						- <strong>Handling</strong> - Cornering ability
					</Typography>
					
					<Typography variant="subtitle2" sx={{ mt: 2, color: '#4caf50' }}>Difficulties:</Typography>
					<Typography variant="body2" component="div">
						- <strong>Easy</strong> - See make, year, and rarity (1x points)<br/>
						- <strong>Medium</strong> - See make only (2x points)<br/>
						- <strong>Hard</strong> - No hints! (3x points)<br/>
						- <strong>Extreme</strong> - Silhouette only! (5x points)
					</Typography>
					
					<Typography variant="subtitle2" sx={{ mt: 2, color: '#f44336' }}>Tips:</Typography>
					<Typography variant="body2" component="div">
						- Learn which manufacturers make high/low CR cars<br/>
						- Sports cars usually have better stats<br/>
						- SUVs and trucks often have lower handling<br/>
						- Remember: for 0-60, LOWER is better!
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowRules(false)}>Got it!</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default HigherLower;
