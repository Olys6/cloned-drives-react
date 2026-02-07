import { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Snackbar,
	Alert,
	Tooltip,
	Chip,
	FormControl,
	Select,
	MenuItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import InventoryIcon from '@mui/icons-material/Inventory';
import SaveIcon from '@mui/icons-material/Save';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import GarageIcon from '@mui/icons-material/Garage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';

// Context
import { GameProvider, useGame } from './clicker/context';

// Auth context - adjust path if needed
import { useAuth } from '../contexts/AuthContext';

// Cloud save hook
import { useCloudSave } from '../hooks/useCloudSave';

// Accent color map - matches Home.jsx / Settings.jsx
import { accentColorMap } from './Home';

// Components
import { StatBox, CarDetailModal, SaveDialog, PackOpeningModal } from './clicker/components';

// Tabs
import { PlayTab, PacksTab, CollectionTab, UpgradesTab, ChallengesTab, RaceTab, PrizeCarsTab, InfoTab } from './clicker/tabs';

// Utils
import { fmtMoney, fmtNumber } from './clicker/utils/formatters';

const CDClickerInner = () => {
	const game = useGame();
	const auth = useAuth();
	
	// Handle different AuthContext patterns
	const isAuthenticated = Boolean(auth?.isAuthenticated || auth?.user);
	
	// Resolve user's accent color
	const accentColor = accentColorMap[auth?.user?.accent_color] || '#b8860b';
	
	// Cloud save hook - pass gameState and loadCloudSave
	const { cloudStatus, saveToCloud, loadFromCloud } = useCloudSave(
		game.gameState,
		game.loadCloudSave,
		isAuthenticated
	);
	
	// UI state
	const [tab, setTab] = useState(0);
	const [packOpening, setPackOpening] = useState(null);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [saveDialog, setSaveDialog] = useState(false);
	const [carDetailModal, setCarDetailModal] = useState(null);
	
	const showSnackbar = (message, severity = 'success') => {
		setSnackbar({ open: true, message, severity });
	};
	
	// Pack opening handlers
	const handleOpenPack = (pack) => {
		const cards = game.openPack(pack);
		if (cards) {
			setPackOpening({ cards, revealed: [], pack });
		} else {
			showSnackbar('Cannot open pack!', 'error');
		}
	};
	
	const revealCard = (index) => {
		if (!packOpening) return;
		setPackOpening(prev => ({
			...prev,
			revealed: [...prev.revealed, index],
		}));
	};
	
	const revealAll = () => {
		if (!packOpening) return;
		setPackOpening(prev => ({
			...prev,
			revealed: prev.cards.map((_, i) => i),
		}));
	};
	
	const collectPackCards = () => {
		if (!packOpening) return;
		game.addCarsToCollection(packOpening.cards.map(c => c.carID));
		const count = packOpening.cards.length;
		setPackOpening(null);
		showSnackbar(`Added ${count} cars to collection!`);
	};
	
	// Local save handlers (for copy/paste codes)
	const handleExport = () => {
		const code = game.exportSave();
		if (code) {
			navigator.clipboard.writeText(code);
			showSnackbar('Save code copied!');
		}
	};
	
	const handleImport = (code) => {
		const success = game.importSave(code);
		if (success) {
			setSaveDialog(false);
			showSnackbar('Game loaded!');
		} else {
			showSnackbar('Invalid save code!', 'error');
		}
		return success;
	};
	
	const handleReset = () => {
		if (window.confirm('Delete ALL progress?')) {
			game.resetGame();
			showSnackbar('Game reset!', 'info');
		}
	};
	
	// Cloud save handlers
	const handleCloudSave = async (force) => {
		const result = await saveToCloud(force);
		if (result.success) {
			showSnackbar('Saved to cloud!');
		} else if (result.queued) {
			showSnackbar('Offline - save queued', 'warning');
		}
		return result;
	};
	
	const handleCloudLoad = async () => {
		const result = await loadFromCloud();
		if (result.success && result.saved_at) {
			showSnackbar('Loaded from cloud!');
			setSaveDialog(false);
		} else if (result.success && result.has_save === false) {
			showSnackbar('No cloud save found', 'info');
		}
		return result;
	};

	// Tab definitions
	const tabDefs = [
		{ label: 'Play', icon: <DirectionsCarIcon /> },
		{ label: 'Packs', icon: <StorefrontIcon /> },
		{ label: `Collection (${game.totalCarCount})`, icon: <InventoryIcon /> },
		{ label: 'Upgrades', icon: <UpgradeIcon /> },
		{ label: 'Challenges', icon: <EmojiEventsIcon /> },
		{ label: 'Race', icon: <SportsScoreIcon /> },
		{ label: 'Prize Cars', icon: <AutoAwesomeIcon /> },
		{ label: 'Info', icon: <InfoIcon /> },
	];
	
	return (
		<Box sx={{ p: { xs: 0.75, sm: 1.5 }, minHeight: 'calc(100vh - 100px)' }}>
			{/* Header - responsive: stacked on mobile, horizontal on desktop */}
			<Box sx={{
				background: 'rgba(255, 255, 255, 0.15)',
				backdropFilter: 'blur(4px)',
				WebkitBackdropFilter: 'blur(4px)',
				borderRadius: '8px',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				p: { xs: 1, sm: 1.5 },
				mb: 1,
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}>
				{/* Row 1: Title + Cloud + Save (always) */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
							CD Clicker
						</Typography>
						{isAuthenticated && (
							<Tooltip title={
								cloudStatus.isOnline 
									? (cloudStatus.pendingSave ? 'Changes pending...' : 'Cloud sync active')
									: 'Offline - will sync when reconnected'
							}>
								<Chip
									size="small"
									icon={cloudStatus.isOnline ? <CloudIcon /> : <CloudOffIcon />}
									label={cloudStatus.isOnline ? (cloudStatus.pendingSave ? 'Syncing...' : 'Cloud') : 'Offline'}
									sx={{
										bgcolor: cloudStatus.isOnline 
											? (cloudStatus.pendingSave ? '#ff9800' : '#4caf50')
											: '#666',
										color: 'white',
										'& .MuiChip-icon': { color: 'white' },
										height: 22,
										fontSize: '0.7rem',
									}}
								/>
							</Tooltip>
						)}
					</Box>
					<Button 
						variant="outlined" 
						size="small" 
						startIcon={<SaveIcon sx={{ fontSize: '1rem !important' }} />} 
						onClick={() => setSaveDialog(true)}
						sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, minWidth: 0, whiteSpace: 'nowrap' }}
					>
						Save/Load
					</Button>
				</Box>
				
				{/* Row 2: Stats */}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
					<StatBox icon={<LocalAtmIcon sx={{ color: '#4caf50' }} />} label="Money" value={fmtMoney(game.money)} color="#4caf50" small />
					<StatBox icon={<SportsScoreIcon sx={{ color: '#ffd700' }} />} label="Tokens" value={`${game.tokens} \u{1FA99}`} color="#ffd700" small />
					{game.tuneTokens > 0 && <StatBox icon={<EmojiEventsIcon sx={{ color: '#9c27b0' }} />} label="Tune" value={`${game.tuneTokens} \u2B50`} color="#9c27b0" small />}
					<StatBox icon={<GarageIcon sx={{ color: '#2196f3' }} />} label="Unique" value={`${game.uniqueCarCount}/${game.gameCars.length}`} color="#2196f3" small />
					<StatBox icon={<AutoAwesomeIcon sx={{ color: '#ffd700' }} />} label="Prize" value={`${game.uniquePrizeCarCount}/${game.prizeCars.length}`} color="#ffd700" small />
					<Tooltip title={`Regular: +$${game.passiveIncomePerSecond.toFixed(1)}/s | Prize: +$${game.prizeCarPassiveIncomePerSecond.toFixed(1)}/s`}>
						<Box>
							<StatBox icon={<TrendingUpIcon sx={{ color: '#ff9800' }} />} label="$/sec" value={`+${game.totalPassiveIncomePerSecond.toFixed(1)}`} color="#ff9800" small />
						</Box>
					</Tooltip>
				</Box>
				
				{/* Row 3: Navigation dropdown */}
				<FormControl 
					fullWidth
					size="small" 
					sx={{ 
						'& .MuiOutlinedInput-root': {
							backgroundColor: 'rgba(0,0,0,0.3)',
							color: '#fff',
							'& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
							'&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
							'&.Mui-focused fieldset': { borderColor: accentColor },
						},
						'& .MuiSelect-icon': { color: '#fff' },
					}}
				>
					<Select
						value={tab}
						onChange={(e) => setTab(e.target.value)}
						renderValue={(selected) => (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
								{tabDefs[selected].icon}
								<span style={{ fontSize: '0.9rem' }}>{tabDefs[selected].label}</span>
							</Box>
						)}
					>
						{tabDefs.map((t, i) => (
							<MenuItem key={i} value={i}>
								<ListItemIcon sx={{ minWidth: 28, color: tab === i ? accentColor : '#aaa' }}>
									{t.icon}
								</ListItemIcon>
								<ListItemText 
									primary={t.label} 
									sx={{ 
										'& .MuiListItemText-primary': { 
											fontWeight: tab === i ? 'bold' : 'normal',
											color: tab === i ? accentColor : '#fff',
											fontSize: '0.9rem',
										} 
									}} 
								/>
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
			
			{/* Tab Content */}
			{tab === 0 && <PlayTab onShowCarDetail={setCarDetailModal} showSnackbar={showSnackbar} />}
			{tab === 1 && <PacksTab onOpenPack={handleOpenPack} packOpening={packOpening} />}
			{tab === 2 && <CollectionTab onShowCarDetail={setCarDetailModal} showSnackbar={showSnackbar} />}
			{tab === 3 && <UpgradesTab showSnackbar={showSnackbar} />}
			{tab === 4 && <ChallengesTab showSnackbar={showSnackbar} />}
			{tab === 5 && <RaceTab onShowCarDetail={setCarDetailModal} showSnackbar={showSnackbar} />}
			{tab === 6 && <PrizeCarsTab onShowCarDetail={setCarDetailModal} showSnackbar={showSnackbar} />}
			{tab === 7 && <InfoTab />}
			
			{/* Modals */}
			<PackOpeningModal 
				packOpening={packOpening}
				onReveal={revealCard}
				onRevealAll={revealAll}
				onCollect={collectPackCards}
				onInfo={setCarDetailModal}
			/>
			
			<SaveDialog 
				open={saveDialog}
				onClose={() => setSaveDialog(false)}
				onExport={handleExport}
				onImport={handleImport}
				onReset={handleReset}
				isAuthenticated={isAuthenticated}
				cloudStatus={cloudStatus}
				onCloudSave={handleCloudSave}
				onCloudLoad={handleCloudLoad}
			/>
			
			<CarDetailModal 
				car={carDetailModal}
				open={carDetailModal !== null}
				onClose={() => setCarDetailModal(null)}
				prizeCarBonuses={game.prizeCarBonuses}
				carEnhancements={game.carEnhancements}
				collection={game.collection}
				accentColor={accentColor}
			/>
			
			<Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
				<Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
			</Snackbar>
		</Box>
	);
};

// Wrap with provider
const CDClicker = () => (
	<GameProvider>
		<CDClickerInner />
	</GameProvider>
);

export default CDClicker;
