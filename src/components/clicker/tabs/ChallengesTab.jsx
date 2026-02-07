import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { useGame } from '../context';
import { CHALLENGES } from '../constants/challenges';
import { fmtMoney } from '../utils/formatters';

const ChallengesTab = ({ showSnackbar }) => {
	const game = useGame();
	
	const handlePurchaseChallenge = (challengeId) => {
		const challenge = CHALLENGES.find(c => c.id === challengeId);
		if (game.purchaseChallenge(challengeId)) {
			showSnackbar(`Purchased ${challenge.name}!`);
		} else {
			showSnackbar(`Cannot afford challenge!`, 'error');
		}
	};
	
	return (
		<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)', minHeight: 500 }}>
			<Typography variant="h6" gutterBottom>Challenges</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Purchase and activate challenges to boost your click earnings! Your garage must meet the challenge requirements to receive the bonus.
			</Typography>
			
			{/* Active Challenge Display */}
			{game.activeChallengeData && (
				<Paper sx={{ 
					p: 2, 
					mb: 3, 
					backgroundColor: game.challengeMet ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
					border: `2px solid ${game.challengeMet ? '#4caf50' : '#f44336'}`,
				}}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
						<Box>
							<Typography variant="subtitle1" fontWeight="bold" sx={{ color: game.activeChallengeData.color }}>
								Active: {game.activeChallengeData.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{game.activeChallengeData.description}
							</Typography>
						</Box>
						<Box sx={{ textAlign: 'right' }}>
							<Chip 
								icon={game.challengeMet ? <CheckIcon sx={{ fontSize: 16 }} /> : <CloseIcon sx={{ fontSize: 16 }} />}
								label={game.challengeMet ? `${game.activeChallengeData.multiplier}x ACTIVE` : 'Not Met'}
								sx={{ 
									backgroundColor: game.challengeMet ? '#4caf50' : '#f44336',
									color: '#fff',
									fontWeight: 'bold',
								}}
							/>
							<Button 
								variant="outlined" 
								size="small" 
								color="error" 
								onClick={() => game.setActiveChallenge(null)}
								sx={{ ml: 1 }}
							>
								Disable
							</Button>
						</Box>
					</Box>
				</Paper>
			)}
			
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
				{CHALLENGES.map(challenge => {
					const isActive = game.activeChallenge === challenge.id;
					const isPurchased = game.purchasedChallenges.includes(challenge.id);
					const isMet = challenge.requirement(game.garage, game.gameCars, game.maxGarageSlots);
					const canAfford = game.money >= challenge.price;
					
					return (
						<Paper 
							key={challenge.id}
							sx={{ 
								p: 2, 
								backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : isPurchased ? 'rgba(30, 30, 30, 0.95)' : 'rgba(20, 20, 20, 0.95)',
								border: `2px solid ${isActive ? challenge.color : isPurchased ? '#444' : '#333'}`,
								borderRadius: 2,
								opacity: isPurchased ? 1 : 0.85,
							}}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
								<Typography variant="subtitle1" fontWeight="bold" sx={{ color: isPurchased ? challenge.color : '#888' }}>
									{isPurchased ? '' : ' '}{challenge.name}
								</Typography>
								<Chip 
									label={`${challenge.multiplier}x`}
									size="small"
									sx={{ backgroundColor: isPurchased ? challenge.color : '#555', color: '#fff' }}
								/>
							</Box>
							
							<Typography variant="body2" sx={{ mb: 2, color: isPurchased ? 'text.secondary' : '#666' }}>
								{challenge.description}
							</Typography>
							
							{isPurchased ? (
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<Chip 
										icon={isMet ? <CheckIcon sx={{ fontSize: 14 }} /> : <CloseIcon sx={{ fontSize: 14 }} />}
										label={isMet ? 'Requirements Met' : 'Not Met'}
										size="small"
										variant="outlined"
										sx={{ 
											borderColor: isMet ? '#4caf50' : '#f44336',
											color: isMet ? '#4caf50' : '#f44336',
										}}
									/>
									{isActive ? (
										<Chip label="Active" size="small" sx={{ backgroundColor: challenge.color, color: '#fff' }} />
									) : (
										<Button 
											variant="contained" 
											size="small" 
											onClick={() => game.setActiveChallenge(challenge.id)}
											sx={{ backgroundColor: challenge.color }}
										>
											Activate
										</Button>
									)}
								</Box>
							) : (
								<Button
									variant="contained"
									fullWidth
									onClick={() => handlePurchaseChallenge(challenge.id)}
									disabled={!canAfford}
									sx={{ 
										backgroundColor: canAfford ? '#4caf50' : '#555',
										'&.Mui-disabled': { backgroundColor: '#444', color: '#bbb' },
									}}
								>
									Buy {fmtMoney(challenge.price)}
								</Button>
							)}
						</Paper>
					);
				})}
			</Box>
		</Paper>
	);
};

export default ChallengesTab;
