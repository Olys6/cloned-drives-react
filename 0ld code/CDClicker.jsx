import { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Tabs,
	Tab,
	Snackbar,
	Alert,
	Tooltip,
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

// Context - FIXED PATH for clicker subfolder
import { GameProvider, useGame } from './clicker/context';

// Components - FIXED PATH
import { StatBox, CarDetailModal, SaveDialog, PackOpeningModal } from './clicker/components';

// Tabs - FIXED PATH
import { PlayTab, PacksTab, CollectionTab, UpgradesTab, ChallengesTab, RaceTab, PrizeCarsTab, InfoTab } from './clicker/tabs';

// Utils - FIXED PATH
import { fmtMoney, fmtNumber } from './clicker/utils/formatters';

const CDClickerInner = () => {
	const game = useGame();
	
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
	
	// Save handlers
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
	};
	
	const handleReset = () => {
		if (window.confirm('Delete ALL progress?')) {
			game.resetGame();
			showSnackbar('Game reset!', 'info');
		}
	};
	
	return (
		<Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', minHeight: 'calc(100vh - 100px)' }}>
			{/* Header */}
			<Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<Typography variant="h5" fontWeight="bold">🚗 CD Clicker</Typography>
					
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
						<StatBox icon={<LocalAtmIcon sx={{ color: '#4caf50' }} />} label="Money" value={fmtMoney(game.money)} color="#4caf50" small />
						<StatBox icon={<SportsScoreIcon sx={{ color: '#ffd700' }} />} label="Tokens" value={`${game.tokens} 🪙`} color="#ffd700" small />
						{game.tuneTokens > 0 && <StatBox icon={<EmojiEventsIcon sx={{ color: '#9c27b0' }} />} label="Tune" value={`${game.tuneTokens} ⭐`} color="#9c27b0" small />}
						<StatBox icon={<GarageIcon sx={{ color: '#2196f3' }} />} label="Unique" value={`${game.uniqueCarCount}/${game.gameCars.length}`} color="#2196f3" small />
						<StatBox icon={<AutoAwesomeIcon sx={{ color: '#ffd700' }} />} label="Prize" value={`${game.uniquePrizeCarCount}/${game.prizeCars.length}`} color="#ffd700" small />
						<Tooltip title={`Regular: +$${game.passiveIncomePerSecond.toFixed(1)}/s | Prize: +$${game.prizeCarPassiveIncomePerSecond.toFixed(1)}/s`}>
							<Box>
								<StatBox icon={<TrendingUpIcon sx={{ color: '#ff9800' }} />} label="$/sec" value={`+${game.totalPassiveIncomePerSecond.toFixed(1)}`} color="#ff9800" small />
							</Box>
						</Tooltip>
					</Box>
					
					<Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={() => setSaveDialog(true)}>
						Save/Load
					</Button>
				</Box>
			</Paper>
			
			{/* Tabs */}
			<Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
				<Tab label="Play" icon={<DirectionsCarIcon />} iconPosition="start" />
				<Tab label="Packs" icon={<StorefrontIcon />} iconPosition="start" />
				<Tab label={`Collection (${game.totalCarCount})`} icon={<InventoryIcon />} iconPosition="start" />
				<Tab label="Upgrades" icon={<UpgradeIcon />} iconPosition="start" />
				<Tab label="Challenges" icon={<EmojiEventsIcon />} iconPosition="start" />
				<Tab label="Race" icon={<SportsScoreIcon />} iconPosition="start" />
				<Tab label="Prize Cars" icon={<AutoAwesomeIcon />} iconPosition="start" />
				<Tab label="Info" icon={<InfoIcon />} iconPosition="start" />
			</Tabs>
			
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
			/>
			
			<CarDetailModal 
				car={carDetailModal}
				open={carDetailModal !== null}
				onClose={() => setCarDetailModal(null)}
				prizeCarBonuses={game.prizeCarBonuses}
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
