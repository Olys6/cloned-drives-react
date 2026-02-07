import carData from '../../../data/data.js';
import packData from '../../../data/packData.js';
import { STARTER_PACKS } from '../constants/starterPacks';
import { getRarity } from '../constants/gameConfig';

// Filter out BM cars, prize cars, and cars without essential data
// Regular game cars (from packs, excludes prize cars)
let _gameCars = null;
export const getGameCars = () => {
	if (!_gameCars) {
		_gameCars = carData.filter(car => 
			!car.reference && 
			!car.isPrize &&
			car.topSpeed && 
			car["0to60"] && 
			car.handling &&
			car.cr
		);
	}
	return _gameCars;
};

// Prize cars (purchasable with tokens)
let _prizeCars = null;
export const getPrizeCars = () => {
	if (!_prizeCars) {
		_prizeCars = carData.filter(car =>
			car.isPrize === true &&
			car.cr < 1000 && // Not mystic
			car.topSpeed &&
			car["0to60"] &&
			car.handling &&
			car.cr
		);
	}
	return _prizeCars;
};

// All usable cars (for collection, garage, races)
let _allGameCars = null;
export const getAllGameCars = () => {
	if (!_allGameCars) {
		_allGameCars = [...getGameCars(), ...getPrizeCars()];
	}
	return _allGameCars;
};

// Car index mappings for efficient saves
let _carIdToIndex = null;
let _indexToCarId = null;

export const getCarIdToIndex = () => {
	if (!_carIdToIndex) {
		_carIdToIndex = {};
		getAllGameCars().forEach((car, idx) => {
			_carIdToIndex[car.carID] = idx;
		});
	}
	return _carIdToIndex;
};

export const getIndexToCarId = () => {
	if (!_indexToCarId) {
		_indexToCarId = {};
		getAllGameCars().forEach((car, idx) => {
			_indexToCarId[idx] = car.carID;
		});
	}
	return _indexToCarId;
};

// Group cars by rarity for pack pulls
let _carsByRarity = null;
export const getCarsByRarity = () => {
	if (!_carsByRarity) {
		const gameCars = getGameCars();
		_carsByRarity = {
			standard: gameCars.filter(c => c.cr < 100),
			common: gameCars.filter(c => c.cr >= 100 && c.cr < 250),
			uncommon: gameCars.filter(c => c.cr >= 250 && c.cr < 400),
			rare: gameCars.filter(c => c.cr >= 400 && c.cr < 550),
			epic: gameCars.filter(c => c.cr >= 550 && c.cr < 700),
			exotic: gameCars.filter(c => c.cr >= 700 && c.cr < 850),
			legendary: gameCars.filter(c => c.cr >= 850 && c.cr < 1000),
			mystic: gameCars.filter(c => c.cr >= 1000),
		};
	}
	return _carsByRarity;
};

// Get purchasable packs
let _allPacks = null;
export const getAllPacks = () => {
	if (!_allPacks) {
		const purchasablePacks = packData.filter(pack => pack.price && pack.price > 0);
		_allPacks = [...STARTER_PACKS, ...purchasablePacks].sort((a, b) => a.price - b.price);
	}
	return _allPacks;
};

// Get car name
export const getCarName = (car) => {
	if (!car) return 'Unknown';
	const make = Array.isArray(car.make) ? car.make[0] : car.make;
	return `${make} ${car.model}`;
};

// Find car by ID
export const findCarById = (carId) => {
	return getAllGameCars().find(c => c.carID === carId);
};

// Weighted random selection for pack pulls
export const weightedPick = (weights) => {
	const entries = Object.entries(weights).filter(([, w]) => w > 0);
	const total = entries.reduce((sum, [, w]) => sum + w, 0);
	if (total === 0) return 'common';
	let roll = Math.random() * total;
	for (const [type, weight] of entries) {
		roll -= weight;
		if (roll <= 0) return type;
	}
	return entries[0]?.[0] || 'common';
};

// Get random car from pack sequence slot with filters
export const getRandomCarFromSlot = (slot, filter, luck = 0) => {
	const carsByRarity = getCarsByRarity();
	const gameCars = getGameCars();
	
	// Apply luck bonus to weights
	const weights = { ...slot };
	weights.mystic = (weights.mystic || 0) * (1 + luck * 0.01);
	weights.legendary = (weights.legendary || 0) * (1 + luck * 0.008);
	weights.exotic = (weights.exotic || 0) * (1 + luck * 0.006);
	weights.epic = (weights.epic || 0) * (1 + luck * 0.004);
	
	const rarity = weightedPick(weights);
	let pool = carsByRarity[rarity] || [];
	
	// Apply pack filters
	if (filter && pool.length > 0) {
		pool = pool.filter(car => {
			if (filter.make && filter.make !== "None") {
				const carMake = Array.isArray(car.make) ? car.make : [car.make];
				if (!carMake.includes(filter.make)) return false;
			}
			if (filter.country && filter.country !== "None" && car.country !== filter.country) return false;
			if (filter.driveType && filter.driveType !== "None" && car.driveType !== filter.driveType) return false;
			if (filter.tyreType && filter.tyreType !== "None" && car.tyreType !== filter.tyreType) return false;
			if (filter.fuelType && filter.fuelType !== "None" && car.fuelType !== filter.fuelType) return false;
			if (filter.bodyStyle && filter.bodyStyle !== "None" && car.bodyStyle !== filter.bodyStyle) return false;
			if (filter.modelYear && filter.modelYear.start && filter.modelYear.end) {
				if (car.modelYear < filter.modelYear.start || car.modelYear > filter.modelYear.end) return false;
			}
			if (filter.tags && filter.tags !== "None") {
				if (!car.tags || !car.tags.includes(filter.tags)) return false;
			}
			return true;
		});
	}
	
	if (pool.length === 0) {
		pool = carsByRarity[rarity]?.length > 0 ? carsByRarity[rarity] : gameCars;
	}
	
	return pool[Math.floor(Math.random() * pool.length)];
};
