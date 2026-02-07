import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Paper, Chip } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import InventoryIcon from '@mui/icons-material/Inventory';

import { getThumbnailUrl } from '../../imageUtils';
import { getRarity } from '../constants/gameConfig';
import { getCarName } from '../utils/carHelpers';

const PackOpeningModal = ({ packOpening, onReveal, onRevealAll, onCollect, onInfo }) => {
	if (!packOpening) return null;
	
	const { cards, revealed, pack } = packOpening;
	const allRevealed = revealed.length === cards.length;
	
	return (
		<Dialog open={true} maxWidth="md" fullWidth>
			<DialogTitle sx={{ textAlign: 'center' }}>
				🎰 {pack.packName}
			</DialogTitle>
			<DialogContent>
				<Box sx={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
					gap: 2,
					py: 2,
				}}>
					{cards.map((car, idx) => {
						const isRevealed = revealed.includes(idx);
						const rarity = getRarity(car.cr);
						
						return (
							<Paper
								key={idx}
								onClick={() => !isRevealed && onReveal(idx)}
								sx={{
									p: 2,
									textAlign: 'center',
									cursor: isRevealed ? 'default' : 'pointer',
									backgroundColor: isRevealed ? 'rgba(30, 30, 30, 0.95)' : 'rgba(0, 0, 0, 0.8)',
									border: isRevealed ? `2px solid ${rarity.color}` : '2px solid #444',
									borderRadius: 2,
									transition: 'all 0.3s ease',
									transform: isRevealed ? 'rotateY(0deg)' : 'rotateY(0deg)',
									'&:hover': !isRevealed ? {
										backgroundColor: 'rgba(50, 50, 50, 0.95)',
										transform: 'scale(1.02)',
									} : {},
								}}
							>
								{isRevealed ? (
									<>
										<img 
											src={getThumbnailUrl(car.racehud, 140, 70)} 
											alt="" 
											style={{ 
												width: '100%', 
												height: 80, 
												objectFit: 'cover', 
												borderRadius: 4,
												cursor: 'pointer',
											}}
											onClick={(e) => {
												e.stopPropagation();
												onInfo(car);
											}}
										/>
										<Typography 
											variant="body2" 
											fontWeight="bold" 
											noWrap 
											sx={{ mt: 1, color: '#fff' }}
											title={getCarName(car)}
										>
											{getCarName(car)}
										</Typography>
										<Chip 
											label={rarity.name}
											size="small"
											sx={{ 
												backgroundColor: rarity.color, 
												color: '#fff',
												fontSize: '0.6rem',
												mt: 0.5,
											}}
										/>
										<Typography variant="caption" display="block" sx={{ color: '#aaa' }}>
											CR {car.cr}
										</Typography>
									</>
								) : (
									<Box sx={{ 
										height: 130, 
										display: 'flex', 
										flexDirection: 'column',
										alignItems: 'center', 
										justifyContent: 'center',
									}}>
										<CasinoIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
										<Typography variant="body2" color="text.secondary">
											Click to reveal
										</Typography>
									</Box>
								)}
							</Paper>
						);
					})}
				</Box>
			</DialogContent>
			<DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
				{!allRevealed && (
					<Button 
						variant="outlined" 
						onClick={onRevealAll}
						startIcon={<CasinoIcon />}
					>
						Reveal All
					</Button>
				)}
				<Button 
					variant="contained" 
					color="success"
					onClick={onCollect}
					startIcon={<InventoryIcon />}
				>
					{allRevealed ? 'Collect All' : 'Collect & Close'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PackOpeningModal;
