export const RACE_DIFFICULTIES = [
	{ 
		id: 'low_cr', 
		name: 'Low CR Challenge', 
		description: 'Cars with 1-500 CR only',
		crRange: [1, 500], 
		restrictions: null,
		tokenReward: 1,
		unlockCost: 0,
		color: '#4caf50',
		icon: '🌱'
	},
	{ 
		id: 'wide_cr', 
		name: 'Wide CR Challenge', 
		description: 'Cars with 1-800 CR',
		crRange: [1, 800], 
		restrictions: null,
		tokenReward: 2,
		unlockCost: 10,
		color: '#2196f3',
		icon: '🔵'
	},
	{ 
		id: 'high_cr', 
		name: 'High CR Challenge', 
		description: 'All CR allowed',
		crRange: [1, 9999], 
		restrictions: null,
		tokenReward: 3,
		unlockCost: 25,
		color: '#ff9800',
		icon: '🔥'
	},
	{ 
		id: 'wide_restricted', 
		name: 'Restricted Challenge', 
		description: '1-800 CR with random restrictions',
		crRange: [1, 800], 
		restrictions: 'random',
		tokenReward: 5,
		unlockCost: 50,
		color: '#9c27b0',
		icon: '🎲'
	},
	{ 
		id: 'one_cr', 
		name: '1 CR Challenge', 
		description: 'Only 1 CR cars allowed!',
		crRange: [1, 1], 
		restrictions: null,
		tokenReward: 8,
		unlockCost: 100,
		color: '#e91e63',
		icon: '💎'
	},
	{ 
		id: 'maximum_tune', 
		name: 'Maximum Tune', 
		description: 'All CR, random restrictions, earns Tune Tokens',
		crRange: [1, 9999], 
		restrictions: 'random',
		tokenReward: 5,
		tuneTokenReward: 1,
		unlockCost: 200,
		color: '#ffd700',
		icon: '⭐'
	},
];

export const RESTRICTION_TYPES = [
	{ 
		id: 'bodyStyle', 
		name: 'Body Style', 
		values: ['Pickup', 'Open Air', 'Sedan', 'Coupe', 'Other', 'Hatchback', 'Convertible', 'SUV', 'Wagon'],
		getFilter: (value) => (car) => {
			if (Array.isArray(car.bodyStyle)) {
				return car.bodyStyle.includes(value);
			}
			return car.bodyStyle === value;
		},
		display: (value) => `Body: ${value}`
	},
	{ 
		id: 'driveType', 
		name: 'Drive Type', 
		values: ['RWD', 'FWD', 'AWD', '4WD'],
		getFilter: (value) => (car) => car.driveType === value,
		display: (value) => `Drive: ${value}`
	},
	{ 
		id: 'country', 
		name: 'Country', 
		values: [
			{ code: 'DE', label: 'Germany' },
			{ code: 'JP', label: 'Japan' },
			{ code: 'US', label: 'USA' },
			{ code: 'IT', label: 'Italy' },
			{ code: 'GB', label: 'UK' },
			{ code: 'FR', label: 'France' },
			{ code: 'SE', label: 'Sweden' },
			{ code: 'KR', label: 'South Korea' },
		],
		getFilter: (value) => (car) => car.country === value.code,
		display: (value) => `Country: ${value.label}`
	},
	{ 
		id: 'tyreType', 
		name: 'Tyre Type', 
		values: ['Standard', 'Performance', 'All-Surface', 'Off-Road', 'Slick'],
		getFilter: (value) => (car) => car.tyreType === value,
		display: (value) => `Tyres: ${value}`
	},
	{ 
		id: 'fuelType', 
		name: 'Fuel Type', 
		values: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
		getFilter: (value) => (car) => car.fuelType === value,
		display: (value) => `Fuel: ${value}`
	},
	{ 
		id: 'decade', 
		name: 'Decade', 
		values: ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
		getFilter: (value) => {
			const startYear = parseInt(value);
			return (car) => car.modelYear >= startYear && car.modelYear < startYear + 10;
		},
		display: (value) => `Era: ${value}`
	},
];

export const generateRandomRestriction = () => {
	const type = RESTRICTION_TYPES[Math.floor(Math.random() * RESTRICTION_TYPES.length)];
	const value = type.values[Math.floor(Math.random() * type.values.length)];
	return { type, value };
};
