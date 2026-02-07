// Icons are passed in from the component that uses them
// This keeps constants serializable and testable

export const UPGRADE_CATEGORIES = {
	income: { name: 'Income', icon: 'AttachMoneyIcon', color: '#4caf50' },
	racing: { name: 'Racing', icon: 'SportsScoreIcon', color: '#ff9800' },
	collection: { name: 'Collection', icon: 'CollectionsIcon', color: '#2196f3' },
	special: { name: 'Special', icon: 'DiamondIcon', color: '#b9f2ff' },
};

export const UPGRADES = {
	// ============================================================
	// INCOME UPGRADES
	// ============================================================
	garageSlots: {
		name: 'Garage Slots',
		description: 'Expand your garage capacity',
		iconName: 'GarageIcon',
		category: 'income',
		baseCost: 25000,
		costMultiplier: 2.5,
		maxLevel: 10,
		baseValue: 5,
		increment: 1,
		extendable: true,
	},
	passiveIncome: {
		name: 'Car Showcase',
		description: 'Earn $/sec based on unique cars owned',
		iconName: 'AutoAwesomeIcon',
		category: 'income',
		baseCost: 10000,
		costMultiplier: 2.2,
		maxLevel: 15,
		baseValue: 0,
		increment: 0.5,
		extendable: true,
	},
	prizeCarIncome: {
		name: 'Trophy Display',
		description: 'Earn $/sec based on unique prize cars owned',
		iconName: 'EmojiEventsIcon',
		category: 'income',
		baseCost: 50000,
		costMultiplier: 2.5,
		maxLevel: 15,
		baseValue: 0,
		increment: 2,
		extendable: true,
	},
	earningsMultiplier: {
		name: 'Premium Collector',
		description: 'Multiply all earnings',
		iconName: 'TrendingUpIcon',
		category: 'income',
		baseCost: 50000,
		costMultiplier: 3,
		maxLevel: 10,
		baseValue: 1,
		increment: 0.25,
		extendable: true,
	},
	vipStatus: {
		name: 'VIP Status',
		description: 'Increase base collect earnings by 3% per level',
		iconName: 'StarIcon',
		category: 'income',
		baseCost: 30000,
		costMultiplier: 1.8,
		maxLevel: 20,
		baseValue: 1,
		increment: 0.03,
		extendable: true,
	},
	sellBonus: {
		name: 'Bulk Seller',
		description: 'Increase car sell value by 2% per level',
		iconName: 'SellIcon',
		category: 'income',
		baseCost: 20000,
		costMultiplier: 2.0,
		maxLevel: 10,
		baseValue: 1,
		increment: 0.02,
		extendable: true,
	},
	cooldownReduction: {
		name: 'Speed Collector',
		description: 'Reduce collect cooldown by 0.15s per level (min 2s)',
		iconName: 'SpeedIcon',
		category: 'income',
		baseCost: 10000,
		costMultiplier: 2.5,
		maxLevel: 10,
		baseValue: 0,
		increment: 0.15,
		extendable: true,
	},
	
	// ============================================================
	// RACING UPGRADES
	// ============================================================
	tokenBoost: {
		name: 'Racing Sponsor',
		description: 'Earn more tokens per race win',
		iconName: 'SportsScoreIcon',
		category: 'racing',
		baseCost: 5000,
		costMultiplier: 1.5,
		maxLevel: 25,
		baseValue: 1,
		increment: 1,
		extendable: false,
	},
	tuneMastery: {
		name: 'Tune Mastery',
		description: '+1 tune token per race win',
		iconName: 'BuildIcon',
		category: 'racing',
		baseCost: 2000,
		costMultiplier: 2.5,
		maxLevel: 4,
		baseValue: 0,
		increment: 1,
		extendable: false,
		tokenCost: true,
	},
	trophyHunter: {
		name: 'Trophy Hunter',
		description: '+2% chance to win +10 bonus tokens on victory',
		iconName: 'MilitaryTechIcon',
		category: 'racing',
		baseCost: 50,
		costMultiplier: 1.4,
		maxLevel: 20,
		baseValue: 0,
		increment: 2,
		extendable: true,
		tokenCost: true,
	},
	
	// ============================================================
	// COLLECTION UPGRADES
	// ============================================================
	luckBonus: {
		name: 'Lucky Charm',
		description: 'Increase rare pull chances',
		iconName: 'CasinoIcon',
		category: 'collection',
		baseCost: 15000,
		costMultiplier: 2.2,
		maxLevel: 20,
		baseValue: 0,
		increment: 2,
		extendable: true,
	},
	multiPackAccess: {
		name: 'Bulk Buyer',
		description: 'Unlock multi-card packs (repetition packs)',
		iconName: 'InventoryIcon',
		category: 'collection',
		baseCost: 200000,
		costMultiplier: 1,
		maxLevel: 1,
		baseValue: 0,
		increment: 1,
		extendable: false,
	},
	bonusExtender: {
		name: 'Bonus Lover',
		description: 'Set bonuses can count beyond 5 cars (+1 per level)',
		iconName: 'AddCircleIcon',
		category: 'collection',
		baseCost: 7500000,
		costMultiplier: 1.75,
		maxLevel: 15,
		baseValue: 5,
		increment: 1,
		extendable: false,
	},
	upgradeExtension: {
		name: 'Research Lab',
		description: 'Increase max level of extendable upgrades by 1',
		iconName: 'UpgradeIcon',
		category: 'collection',
		baseCost: 500000,
		costMultiplier: 5,
		maxLevel: 5,
		baseValue: 0,
		increment: 1,
		extendable: false,
	},
	
	// ============================================================
	// SPECIAL UPGRADES (Token Cost)
	// ============================================================
	advancedEnhancement: {
		name: 'Master Tuner',
		description: 'Unlock 6-10 star enhancements (Diamond tier)',
		iconName: 'DiamondIcon',
		category: 'special',
		baseCost: 5000,
		costMultiplier: 1,
		maxLevel: 1,
		baseValue: 0,
		increment: 1,
		extendable: false,
		tokenCost: true,
	},
	cooldownBreaker: {
		name: 'Overclock',
		description: 'Break the 2s cooldown floor (allows down to 1s)',
		iconName: 'BoltIcon',
		category: 'special',
		baseCost: 10000,
		costMultiplier: 1,
		maxLevel: 1,
		baseValue: 0,
		increment: 1,
		extendable: false,
		tokenCost: true,
	},
};

export const getUpgradeCost = (upgrade, level) => {
	return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
};

export const getUpgradeValue = (upgrade, level) => {
	return upgrade.baseValue + (upgrade.increment * level);
};
