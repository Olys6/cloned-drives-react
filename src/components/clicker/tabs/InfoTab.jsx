import {
	Box,
	Typography,
	Paper,
	Chip,
} from '@mui/material';

// Context
import { useGame } from '../context';

// Utils
import { fmtMoney, fmtNumber } from '../utils/formatters';
import { UPGRADES } from '../constants/upgrades';
import { BASE_COOLDOWN_SECONDS, BASE_EARNINGS } from '../constants/gameConfig';

const InfoTab = () => {
	const game = useGame();
	
	// Calculate total upgrade progress
	const upgradeProgress = (() => {
		let total = 0;
		let current = 0;
		Object.keys(UPGRADES).forEach(key => {
			const max = game.getEffectiveMaxLevel(key);
			const level = game.getUpgradeLevel(key);
			total += max;
			current += level;
		});
		return total > 0 ? (current / total) * 100 : 0;
	})();
	
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 500 }}>
			{/* Statistics */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>📊 Statistics</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
					<Box>
						<Typography variant="caption" color="text.secondary">Total Money Earned</Typography>
						<Typography variant="h6" sx={{ color: '#4caf50' }}>{fmtMoney(game.totalEarnings)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Current Balance</Typography>
						<Typography variant="h6" sx={{ color: '#4caf50' }}>{fmtMoney(game.money)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Total Clicks</Typography>
						<Typography variant="h6">{fmtNumber(game.totalCollects)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Packs Opened</Typography>
						<Typography variant="h6">{fmtNumber(game.packsOpened)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Cars Collected</Typography>
						<Typography variant="h6">{fmtNumber(game.totalCarCount)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Unique Cars</Typography>
						<Typography variant="h6">{fmtNumber(game.uniqueCarCount)} / {fmtNumber(game.gameCars.length)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">🏆 Prize Cars</Typography>
						<Typography variant="h6" sx={{ color: '#ffd700' }}>{fmtNumber(game.uniquePrizeCarCount)} / {fmtNumber(game.prizeCars.length)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Cars Sold</Typography>
						<Typography variant="h6">{fmtNumber(game.carsSold)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Money from Sales</Typography>
						<Typography variant="h6" sx={{ color: '#ff9800' }}>{fmtMoney(game.moneyFromSales)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Races Won</Typography>
						<Typography variant="h6" sx={{ color: '#4caf50' }}>{fmtNumber(game.racesWon)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Races Lost</Typography>
						<Typography variant="h6" sx={{ color: '#f44336' }}>{fmtNumber(game.racesLost)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">🪙 Tokens</Typography>
						<Typography variant="h6" sx={{ color: '#ffd700' }}>{fmtNumber(game.tokens)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">⭐ Tune Tokens</Typography>
						<Typography variant="h6" sx={{ color: '#9c27b0' }}>{fmtNumber(game.tuneTokens)}</Typography>
					</Box>
					<Box>
						<Typography variant="caption" color="text.secondary">Upgrade Progress</Typography>
						<Typography variant="h6">{upgradeProgress.toFixed(1)}%</Typography>
					</Box>
				</Box>
			</Paper>
			
			{/* Active Bonuses */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>⚡ Active Bonuses</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Your current bonuses from upgrades and garage:
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
					{/* Earnings */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#4caf50' }}>💰 Earnings per Click</Typography>
						<Typography variant="h5" sx={{ color: '#4caf50' }}>{fmtMoney(game.currentEarnings)}</Typography>
						<Typography variant="caption" color="text.secondary">
							Base: ${BASE_EARNINGS} × {((game.vipStatusMultiplier - 1) * 100).toFixed(0)}% VIP × {game.garageStats.earnings.toFixed(2)} garage
							{game.challengeMultiplier > 1 && ` × ${game.challengeMultiplier}x challenge`}
						</Typography>
					</Paper>
					
					{/* Cooldown */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#00bcd4' }}>⏱️ Cooldown</Typography>
						<Typography variant="h5" sx={{ color: '#00bcd4' }}>{game.cooldownSeconds.toFixed(2)}s</Typography>
						<Typography variant="caption" color="text.secondary">
							Base: {BASE_COOLDOWN_SECONDS}s | Min: {game.minCooldown}s
							{game.hasCooldownBreaker && <Chip label="OVERCLOCKED" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', backgroundColor: '#b9f2ff', color: '#000' }} />}
						</Typography>
					</Paper>
					
					{/* Luck */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(156,39,176,0.1)', border: '1px solid rgba(156,39,176,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#9c27b0' }}>🍀 Pack Luck</Typography>
						<Typography variant="h5" sx={{ color: '#9c27b0' }}>{game.garageStats.luck.toFixed(1)}</Typography>
						<Typography variant="caption" color="text.secondary">
							Upgrade: +{game.bonusLuck} | Garage: +{(game.garageStats.luck - game.bonusLuck).toFixed(1)}
						</Typography>
					</Paper>
					
					{/* Passive Income */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#ff9800' }}>💤 Passive Income</Typography>
						<Typography variant="h5" sx={{ color: '#ff9800' }}>{fmtMoney(game.totalPassiveIncomePerSecond)}/s</Typography>
						<Typography variant="caption" color="text.secondary">
							Cars: ${game.passiveIncomePerSecond.toFixed(2)}/s | Prize: ${game.prizeCarPassiveIncomePerSecond.toFixed(2)}/s
						</Typography>
					</Paper>
					
					{/* Sell Bonus */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(233,30,99,0.1)', border: '1px solid rgba(233,30,99,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#e91e63' }}>🏷️ Sell Bonus</Typography>
						<Typography variant="h5" sx={{ color: '#e91e63' }}>+{((game.sellBonusMultiplier - 1) * 100).toFixed(0)}%</Typography>
						<Typography variant="caption" color="text.secondary">
							From Bulk Seller upgrade
						</Typography>
					</Paper>
					
					{/* Racing Bonuses */}
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
						<Typography variant="subtitle2" sx={{ color: '#ffd700' }}>🏁 Racing Bonuses</Typography>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
							<Chip label={`+${game.tokenBoostLevel} 🪙/win`} size="small" sx={{ backgroundColor: '#ff9800', color: '#000' }} />
							{game.tuneMasteryLevel > 0 && (
								<Chip label={`+${game.tuneMasteryLevel} ⭐/win`} size="small" sx={{ backgroundColor: '#9c27b0', color: '#fff' }} />
							)}
							{game.trophyHunterChance > 0 && (
								<Chip label={`${game.trophyHunterChance}% bonus`} size="small" sx={{ backgroundColor: '#ffd700', color: '#000' }} />
							)}
						</Box>
					</Paper>
				</Box>
			</Paper>
			
			{/* Upgrades Guide */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>📈 Upgrades Guide</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Spend money and tokens to unlock permanent bonuses:
				</Typography>
				
				{/* Income Upgrades */}
				<Typography variant="subtitle1" sx={{ color: '#4caf50', mt: 2, mb: 1 }}>💵 Income Upgrades</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Garage Slots</Typography>
						<Typography variant="caption" color="text.secondary">More cars = more bonuses. Starts at 5, expandable.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Car Showcase</Typography>
						<Typography variant="caption" color="text.secondary">Earn $/sec for each unique car you own.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Trophy Display</Typography>
						<Typography variant="caption" color="text.secondary">Earn $/sec for each unique prize car you own.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Premium Collector</Typography>
						<Typography variant="caption" color="text.secondary">Multiply ALL earnings (clicks + passive).</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">VIP Status</Typography>
						<Typography variant="caption" color="text.secondary">+3% base earnings per level. Affects click earnings directly.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Bulk Seller</Typography>
						<Typography variant="caption" color="text.secondary">+2% sell value per level. Stack those duplicates!</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Speed Collector</Typography>
						<Typography variant="caption" color="text.secondary">-0.15s cooldown per level. Min 2s (or 1s with Overclock).</Typography>
					</Paper>
				</Box>
				
				{/* Racing Upgrades */}
				<Typography variant="subtitle1" sx={{ color: '#ff9800', mt: 2, mb: 1 }}>🏁 Racing Upgrades</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Racing Sponsor</Typography>
						<Typography variant="caption" color="text.secondary">+1 token per race win. Essential for token farming.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Tune Mastery <Chip label="🪙" size="small" sx={{ height: 14, fontSize: '0.6rem', ml: 0.5 }} /></Typography>
						<Typography variant="caption" color="text.secondary">+1 tune token per race win. Costs tokens to upgrade.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Trophy Hunter <Chip label="🪙" size="small" sx={{ height: 14, fontSize: '0.6rem', ml: 0.5 }} /></Typography>
						<Typography variant="caption" color="text.secondary">+2% chance per level to get +10 bonus tokens on win.</Typography>
					</Paper>
				</Box>
				
				{/* Collection Upgrades */}
				<Typography variant="subtitle1" sx={{ color: '#2196f3', mt: 2, mb: 1 }}>📦 Collection Upgrades</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Lucky Charm</Typography>
						<Typography variant="caption" color="text.secondary">+2 luck per level. Higher luck = better pack pulls.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Bulk Buyer</Typography>
						<Typography variant="caption" color="text.secondary">Unlock multi-card repetition packs. One-time purchase.</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Bonus Lover</Typography>
						<Typography variant="caption" color="text.secondary">Set bonuses count beyond 5 cars. 6+ cars give +5% extra each!</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }}>
						<Typography variant="subtitle2">Research Lab</Typography>
						<Typography variant="caption" color="text.secondary">+1 max level to all extendable upgrades. Very powerful!</Typography>
					</Paper>
				</Box>
				
				{/* Special Upgrades */}
				<Typography variant="subtitle1" sx={{ color: '#b9f2ff', mt: 2, mb: 1 }}>💎 Special Upgrades (Token Cost)</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1.5 }}>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(185,242,255,0.05)', border: '1px solid rgba(185,242,255,0.2)' }}>
						<Typography variant="subtitle2" sx={{ color: '#b9f2ff' }}>Master Tuner (500 🪙)</Typography>
						<Typography variant="caption" color="text.secondary">Unlock 6-10 star enhancements (Diamond tier). Up to +50% earnings!</Typography>
					</Paper>
					<Paper sx={{ p: 1.5, backgroundColor: 'rgba(185,242,255,0.05)', border: '1px solid rgba(185,242,255,0.2)' }}>
						<Typography variant="subtitle2" sx={{ color: '#b9f2ff' }}>Overclock (1000 🪙)</Typography>
						<Typography variant="caption" color="text.secondary">Break the 2s cooldown floor! Allows cooldown down to 1s.</Typography>
					</Paper>
				</Box>
			</Paper>
			
			{/* Car Stat Bonuses */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>🚗 Car Stat Bonuses</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Each car in your garage provides bonuses based on its stats:
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#9c27b0' }}>🏎️ Top Speed → Luck</Typography>
						<Typography variant="body2" color="text.secondary">
							Higher top speed increases your luck for pulling rare cards.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +speed/30 luck per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#00bcd4' }}>⚡ 0-60 → Cooldown</Typography>
						<Typography variant="body2" color="text.secondary">
							Faster acceleration slightly reduces click cooldown.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +(15-accel)*0.03s reduction per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#4caf50' }}>🎯 Handling → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							Better handling increases money per click.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +handling/40 earnings multiplier per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#2196f3' }}>🏎️ Top Speed → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							Higher top speed also contributes to earnings.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +topSpeed/100 earnings bonus per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#ffd700' }}>⭐ CR → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							Higher rarity cars earn more money.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +cr/500 earnings bonus per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#ff9800' }}>📈 MRA → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							Higher MRA (Mid-Range Acceleration) boosts earnings.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +mra/300 earnings bonus per car</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#e91e63' }}>🚀 OLA → Luck</Typography>
						<Typography variant="body2" color="text.secondary">
							Lower OLA (Off-the-Line Acceleration) increases luck.
						</Typography>
						<Typography variant="caption" sx={{ color: '#888' }}>Formula: +(100-ola)/300 luck per car</Typography>
					</Paper>
				</Box>
			</Paper>
			
			{/* Set Bonuses Guide */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>🎯 Set Bonuses</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Match 3+ cars in your garage with the same attribute for bonuses.
					{game.bonusExtenderCap > 5 && (
						<Chip 
							label={`Bonus Lover: Up to ${game.bonusExtenderCap} cars!`} 
							size="small" 
							sx={{ ml: 1, backgroundColor: '#9c27b0', color: '#fff' }} 
						/>
					)}
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#ff9800' }}>🏭 Same Brand → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							3: +10% | 4: +20% | 5: +35% | 6+: +5% each
						</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#2196f3' }}>🌍 Same Country → Luck</Typography>
						<Typography variant="body2" color="text.secondary">
							3: +10% | 4: +20% | 5: +35% | 6+: +5% each
						</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#00bcd4' }}>⚙️ Same Drive Type → Cooldown</Typography>
						<Typography variant="body2" color="text.secondary">
							3: -0.05s | 4: -0.1s | 5: -0.175s | 6+: more reduction
						</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#4caf50' }}>🛞 Same Tyre Type → Earnings</Typography>
						<Typography variant="body2" color="text.secondary">
							3: +5% | 4: +10% | 5: +17.5% | 6+: +2.5% each
						</Typography>
					</Paper>
					<Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.05)' }}>
						<Typography variant="subtitle2" sx={{ color: '#9c27b0' }}>🚙 Same Body Style → Passive</Typography>
						<Typography variant="body2" color="text.secondary">
							3: +10% | 4: +20% | 5: +35% | 6+: +5% each
						</Typography>
					</Paper>
				</Box>
			</Paper>
			
			{/* Enhancement Guide */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>⭐ Car Enhancement</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Enhance cars using duplicates and Tune Tokens to boost their earnings:
				</Typography>
				
				{/* Basic Enhancement (1-5 stars) */}
				<Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#ffd700' }}>Basic Enhancement (1-5 ⭐)</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
					{[1, 2, 3, 4, 5].map(stars => (
						<Paper key={stars} sx={{ p: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
							<Typography variant="body1" sx={{ color: '#ffd700' }}>{'⭐'.repeat(stars)}</Typography>
							<Typography variant="body2" sx={{ color: '#4caf50' }}>+{[3, 7, 12, 18, 25][stars - 1]}%</Typography>
							<Typography variant="caption" color="text.secondary">
								{stars} dupe + {[1, 2, 4, 6, 10][stars - 1]}⭐
							</Typography>
						</Paper>
					))}
				</Box>
				
				{/* Advanced Enhancement (6-10 stars) */}
				<Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#b9f2ff' }}>
					Diamond Enhancement (6-10 ⭐)
					{!game.hasAdvancedEnhancement && (
						<Chip label="Requires Master Tuner" size="small" sx={{ ml: 1, backgroundColor: '#b9f2ff', color: '#000', height: 18 }} />
					)}
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
					{[6, 7, 8, 9, 10].map(stars => (
						<Paper 
							key={stars} 
							sx={{ 
								p: 1.5, 
								backgroundColor: game.hasAdvancedEnhancement ? 'rgba(185,242,255,0.1)' : 'rgba(255,255,255,0.02)', 
								textAlign: 'center',
								border: game.hasAdvancedEnhancement ? '1px solid rgba(185,242,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
								opacity: game.hasAdvancedEnhancement ? 1 : 0.5,
							}}
						>
							<Typography variant="body1" sx={{ color: '#b9f2ff' }}>{'💎'.repeat(stars - 5)}</Typography>
							<Typography variant="body2" sx={{ color: '#4caf50' }}>+{[35, 48, 65, 85, 110][stars - 6]}%</Typography>
							<Typography variant="caption" color="text.secondary">
								{[6, 7, 8, 10, 12][stars - 6]} dupe + {[15, 25, 40, 60, 100][stars - 6]}⭐
							</Typography>
						</Paper>
					))}
				</Box>
			</Paper>
			
			{/* Race Guide */}
			<Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				<Typography variant="h6" gutterBottom>🏁 Racing Guide</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Win races to earn tokens for prize cars and upgrades!
				</Typography>
				<Box sx={{ mt: 2 }}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>Track Surfaces</Typography>
					<Typography variant="body2" color="text.secondary">
						• <strong>Asphalt/Track:</strong> Performance/Slick tyres best<br/>
						• <strong>Gravel/Dirt:</strong> All-Surface/Off-Road tyres best<br/>
						• <strong>Snow/Ice:</strong> Off-Road tyres essential, AWD/4WD preferred<br/>
						• <strong>Drag:</strong> Drag tyres give advantage, RWD preferred
					</Typography>
				</Box>
				<Box sx={{ mt: 2 }}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>Track Stats</Typography>
					<Typography variant="body2" color="text.secondary">
						Each track prioritizes different stats. Check the stat distribution before selecting your car!
					</Typography>
				</Box>
				<Box sx={{ mt: 2 }}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>Earning More from Races</Typography>
					<Typography variant="body2" color="text.secondary">
						• <strong>Racing Sponsor:</strong> +1 token per win per level<br/>
						• <strong>Tune Mastery:</strong> +1 tune token per win per level<br/>
						• <strong>Trophy Hunter:</strong> Chance for +10 bonus tokens on win
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
};

export default InfoTab;
