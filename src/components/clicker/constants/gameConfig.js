// Rarity configuration based on CR
export const getRarity = (cr) => {
	if (cr >= 1000) return { name: 'Mystic', color: '#ff69b4', key: 'mystic' };
	if (cr >= 850) return { name: 'Legendary', color: '#ffd700', key: 'legendary' };
	if (cr >= 700) return { name: 'Exotic', color: '#9c27b0', key: 'exotic' };
	if (cr >= 550) return { name: 'Epic', color: '#f44336', key: 'epic' };
	if (cr >= 400) return { name: 'Rare', color: '#03a9f4', key: 'rare' };
	if (cr >= 250) return { name: 'Uncommon', color: '#4caf50', key: 'uncommon' };
	if (cr >= 100) return { name: 'Common', color: '#616161', key: 'common' };
	return { name: 'Standard', color: '#9e9e9e', key: 'standard' };
};

// Rarity thresholds for filtering
export const RARITY_THRESHOLDS = {
	standard: { min: 0, max: 99 },
	common: { min: 100, max: 249 },
	uncommon: { min: 250, max: 399 },
	rare: { min: 400, max: 549 },
	epic: { min: 550, max: 699 },
	exotic: { min: 700, max: 849 },
	legendary: { min: 850, max: 999 },
	mystic: { min: 1000, max: 9999 },
};

// Enhancement costs: Stars 1-10
// Stars 1-5: Standard enhancement (dupes + tune tokens)
// Stars 6-10: Advanced enhancement (requires unlock + higher costs)
export const ENHANCEMENT_COSTS = {
	1: { dupes: 1, tuneTokens: 1 },
	2: { dupes: 2, tuneTokens: 2 },
	3: { dupes: 3, tuneTokens: 4 },
	4: { dupes: 4, tuneTokens: 6 },
	5: { dupes: 5, tuneTokens: 10 },
	// Advanced tiers (require unlock)
	6: { dupes: 6, tuneTokens: 15, requiresAdvanced: true },
	7: { dupes: 7, tuneTokens: 25, requiresAdvanced: true },
	8: { dupes: 8, tuneTokens: 40, requiresAdvanced: true },
	9: { dupes: 10, tuneTokens: 60, requiresAdvanced: true },
	10: { dupes: 12, tuneTokens: 100, requiresAdvanced: true },
};

// Enhancement tier names for display
export const ENHANCEMENT_TIER_NAMES = {
	0: 'Stock',
	1: 'Bronze',
	2: 'Orange',
	3: 'Gold',
	4: 'Gold+',
	5: 'Rainbow',
	6: 'Platinum',
	7: 'Cyan',
	8: 'Sapphire',
	9: 'Amethyst',
	10: 'Diamond',
};

// Escalating enhancement bonuses - higher stars are more rewarding
const ENHANCEMENT_BONUSES = [0, 0.03, 0.07, 0.12, 0.18, 0.25, 0.35, 0.48, 0.65, 0.85, 1.10];
// Stars:                    0   1     2     3     4     5     6     7     8     9    10

export const getEnhancementBonus = (stars) => ENHANCEMENT_BONUSES[Math.min(stars, 10)] || 0;

export const getStarDisplay = (stars) => 'â­'.repeat(Math.min(stars || 0, 10));

export const getEnhancementTierName = (stars) => ENHANCEMENT_TIER_NAMES[Math.min(stars, 10)] || 'Stock';

export const MAX_BASIC_STARS = 5;
export const MAX_ADVANCED_STARS = 10;

// Prize car random bonuses
export const PRIZE_CAR_BONUSES = [
	{ id: 'speed_boost', name: 'Speed Demon', description: '+10% Top Speed in races', icon: 'ðŸŽï¸', raceBonus: { stat: 'topSpeed', mult: 1.1 } },
	{ id: 'accel_boost', name: 'Quick Launch', description: '+10% Acceleration in races', icon: 'âš¡', raceBonus: { stat: '0to60', mult: 0.9 } },
	{ id: 'handling_boost', name: 'Corner Master', description: '+10% Handling in races', icon: 'ðŸŽ¯', raceBonus: { stat: 'handling', mult: 1.1 } },
	{ id: 'token_boost', name: 'Token Magnet', description: '+25% tokens from races', icon: 'ðŸª™', tokenBonus: 0.25 },
	{ id: 'luck_boost', name: 'Lucky Charm', description: '+15 Pack Luck when in garage', icon: 'ðŸ€', garageLuck: 15 },
	{ id: 'earnings_boost', name: 'Money Maker', description: '+20% earnings when in garage', icon: 'ðŸ’°', garageEarnings: 0.2 },
	{ id: 'passive_boost', name: 'Idle King', description: '+$50/s passive income', icon: 'ðŸ’¤', passiveIncome: 50 },
	{ id: 'cr_boost', name: 'Overtuned', description: '+50 CR in races', icon: 'ðŸ“ˆ', raceCR: 50 },
];

export const getRandomPrizeBonus = () => {
	return PRIZE_CAR_BONUSES[Math.floor(Math.random() * PRIZE_CAR_BONUSES.length)];
};

export const getPrizeBonusById = (bonusId) => {
	return PRIZE_CAR_BONUSES.find(b => b.id === bonusId);
};

// Sell value calculation based on CR
export const getSellValue = (car) => {
	const cr = car.cr;
	if (cr >= 1000) return Math.floor(cr * 50); // Mystic
	if (cr >= 850) return Math.floor(cr * 40);  // Legendary
	if (cr >= 700) return Math.floor(cr * 30);  // Exotic
	if (cr >= 550) return Math.floor(cr * 20);  // Epic
	if (cr >= 400) return Math.floor(cr * 12);  // Rare
	if (cr >= 250) return Math.floor(cr * 8);   // Uncommon
	if (cr >= 100) return Math.floor(cr * 5);   // Common
	return Math.floor(cr * 3);                   // Standard
};

// Prize car token cost
export const getPrizeCarTokenCost = (car) => {
	const cr = car.cr;
	if (cr >= 850) return Math.floor(600 + cr * 1.8);  // Legendary
	if (cr >= 700) return Math.floor(360 + cr * 1.2);  // Exotic
	if (cr >= 550) return Math.floor(240 + cr * 0.96); // Epic
	if (cr >= 400) return Math.floor(180 + cr * 0.72); // Rare
	if (cr >= 250) return Math.floor(120 + cr * 0.48); // Uncommon
	if (cr >= 100) return Math.floor(60 + cr * 0.36);  // Common
	return Math.floor(36 + cr * 0.24);                  // Standard
};

// Surface colors for track display
export const SURFACE_COLORS = {
	'Asphalt': '#607d8b',
	'Drag': '#ff5722',
	'Track': '#9c27b0',
	'Gravel': '#8d6e63',
	'Dirt': '#5d4037',
	'Snow': '#90caf9',
	'Sand': '#ffcc80',
	'Ice': '#81d4fa',
	'Grass': '#66bb6a',
	'default': '#757575',
};

export const getTrackColor = (surface) => SURFACE_COLORS[surface] || SURFACE_COLORS.default;

// Game constants
export const BASE_COOLDOWN_SECONDS = 5;
export const MIN_COOLDOWN_SECONDS = 2;
export const BASE_EARNINGS = 250;
export const CARS_PER_PAGE = 12;
export const RACE_CARS_PER_PAGE = 12;
export const PRIZE_CARS_PER_PAGE = 20;

// Advanced Enhancement Unlock Cost (tokens)
export const ADVANCED_ENHANCEMENT_UNLOCK_COST = 500;
