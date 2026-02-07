export const CHALLENGES = [
	{
		id: 'low_cr',
		name: 'Budget Build',
		description: 'All garage cars must have CR under 300',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.cr < 300;
			});
		},
		multiplier: 2.0,
		color: '#4caf50',
		price: 25000,
	},
	{
		id: 'mid_cr',
		name: 'Middle Ground',
		description: 'All garage cars must have CR between 300-600',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.cr >= 300 && car.cr < 600;
			});
		},
		multiplier: 1.5,
		color: '#03a9f4',
		price: 15000,
	},
	{
		id: 'high_cr',
		name: 'Elite Only',
		description: 'All garage cars must have CR 700+',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.cr >= 700;
			});
		},
		multiplier: 1.25,
		color: '#9c27b0',
		price: 50000,
	},
	{
		id: 'full_garage',
		name: 'Full House',
		description: 'Fill all garage slots',
		requirement: (garage, allGameCars, maxSlots) => {
			return garage.length >= maxSlots;
		},
		multiplier: 1.5,
		color: '#ff9800',
		price: 20000,
	},
	{
		id: 'rwd_only',
		name: 'Rear Wheel Drive',
		description: 'All garage cars must be RWD',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.driveType === 'RWD';
			});
		},
		multiplier: 1.3,
		color: '#f44336',
		price: 10000,
	},
	{
		id: 'fwd_only',
		name: 'Front Wheel Drive',
		description: 'All garage cars must be FWD',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.driveType === 'FWD';
			});
		},
		multiplier: 1.3,
		color: '#2196f3',
		price: 10000,
	},
	{
		id: 'awd_only',
		name: 'All Wheel Drive',
		description: 'All garage cars must be AWD/4WD',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && (car.driveType === 'AWD' || car.driveType === '4WD');
			});
		},
		multiplier: 1.3,
		color: '#00bcd4',
		price: 10000,
	},
	{
		id: 'vintage',
		name: 'Vintage Collection',
		description: 'All garage cars must be from before 1990',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.modelYear && car.modelYear < 1990;
			});
		},
		multiplier: 1.75,
		color: '#795548',
		price: 35000,
	},
	{
		id: 'modern',
		name: 'Modern Machines',
		description: 'All garage cars must be from 2015 or later',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.modelYear && car.modelYear >= 2015;
			});
		},
		multiplier: 1.25,
		color: '#607d8b',
		price: 15000,
	},
	{
		id: 'electric',
		name: 'Electric Dreams',
		description: 'All garage cars must be Electric',
		requirement: (garage, allGameCars, maxSlots) => {
			if (garage.length === 0) return false;
			return garage.every(carId => {
				const car = allGameCars.find(c => c.carID === carId);
				return car && car.fuelType === 'Electric';
			});
		},
		multiplier: 2.0,
		color: '#8bc34a',
		price: 40000,
	},
];
