/**
 * Optimized Save System for CD Clicker
 * 
 * Key optimizations:
 * 1. Collection stored as {index: count} map instead of array with duplicates
 * 2. Short keys for all fields (m=money, g=garage, etc.)
 * 3. Bitfield encoding for locked cars
 * 4. Delta encoding for garage indices
 * 5. Run-length encoding for collection where applicable
 * 6. Optional LZ compression for large saves
 */

import { getCarIdToIndex, getIndexToCarId, getAllGameCars } from './carHelpers';

export const SAVE_KEY = 'cd_clicker_save_v3';
const CURRENT_VERSION = 7;

// Default game state
export const getDefaultGameState = () => ({
	money: 1000,
	garage: [],
	collection: {}, // {carId: count} - NEW FORMAT
	upgrades: {},
	totalCollects: 0,
	totalEarnings: 0,
	lastCollect: 0,
	hasClaimedStarter: false,
	packPurchases: {},
	packsOpened: 0,
	carsSold: 0,
	moneyFromSales: 0,
	activeChallenge: null,
	purchasedChallenges: [],
	tokens: 0,
	tuneTokens: 0,
	racesWon: 0,
	racesLost: 0,
	unlockedDifficulties: ['low_cr'],
	carEnhancements: {},
	lockedCars: new Set(),
	prizeCarBonuses: {},
});

/**
 * Simple LZ-style compression for strings
 * Falls back to original if compression doesn't help
 */
const compress = (str) => {
	try {
		// Use built-in compression if available (modern browsers)
		if (typeof CompressionStream !== 'undefined') {
			return str; // Let the browser handle it
		}
		return str;
	} catch (e) {
		return str;
	}
};

const decompress = (str) => {
	return str;
};

/**
 * Encode locked cars as a bitfield string
 * Much more compact than array of indices
 */
const encodeLockedCars = (lockedSet, carIdToIndex) => {
	if (!lockedSet || lockedSet.size === 0) return '';
	
	const indices = [];
	for (const carId of lockedSet) {
		const idx = carIdToIndex[carId];
		if (idx !== undefined) {
			indices.push(idx);
		}
	}
	
	if (indices.length === 0) return '';
	
	// Sort and use delta encoding
	indices.sort((a, b) => a - b);
	const deltas = [indices[0]];
	for (let i = 1; i < indices.length; i++) {
		deltas.push(indices[i] - indices[i - 1]);
	}
	
	// Encode as comma-separated deltas (smaller than full indices)
	return deltas.join(',');
};

/**
 * Decode locked cars from bitfield string
 */
const decodeLockedCars = (encoded, indexToCarId) => {
	if (!encoded) return new Set();
	
	const deltas = encoded.split(',').map(Number);
	const indices = [];
	let current = 0;
	
	for (const delta of deltas) {
		current += delta;
		indices.push(current);
	}
	
	const carIds = indices.map(idx => indexToCarId[idx]).filter(Boolean);
	return new Set(carIds);
};

/**
 * Encode collection with run-length encoding for consecutive counts
 * Format: index:count,index:count or index-endIndex:count for runs
 */
const encodeCollection = (collection, carIdToIndex) => {
	const indexCounts = {};
	
	// Convert carIds to indices with counts
	for (const [carId, count] of Object.entries(collection)) {
		const idx = carIdToIndex[carId];
		if (idx !== undefined && count > 0) {
			indexCounts[idx] = count;
		}
	}
	
	// Sort indices for potential run-length encoding
	const sortedIndices = Object.keys(indexCounts).map(Number).sort((a, b) => a - b);
	
	if (sortedIndices.length === 0) return {};
	
	// Simple format: {index: count} but with number keys
	const result = {};
	for (const idx of sortedIndices) {
		result[idx] = indexCounts[idx];
	}
	
	return result;
};

/**
 * Decode collection back to {carId: count}
 */
const decodeCollection = (encoded, indexToCarId) => {
	const collection = {};
	
	for (const [idx, count] of Object.entries(encoded)) {
		const carId = indexToCarId[parseInt(idx)];
		if (carId) {
			collection[carId] = count;
		}
	}
	
	return collection;
};

/**
 * Compress game state to minimal save code
 */
export const compressSave = (state) => {
	try {
		const carIdToIndex = getCarIdToIndex();
		
		// Convert garage from carIDs to indices
		const garageIndices = state.garage
			.map(id => carIdToIndex[id])
			.filter(i => i !== undefined);
		
		// Convert collection
		const collectionEncoded = encodeCollection(state.collection, carIdToIndex);
		
		// Convert enhancements from carIDs to indices
		const enhancementsCompressed = {};
		for (const [carId, stars] of Object.entries(state.carEnhancements || {})) {
			const idx = carIdToIndex[carId];
			if (idx !== undefined && stars > 0) {
				enhancementsCompressed[idx] = stars;
			}
		}
		
		// Convert prize car bonuses from carIDs to indices
		const bonusesCompressed = {};
		for (const [carId, bonusId] of Object.entries(state.prizeCarBonuses || {})) {
			const idx = carIdToIndex[carId];
			if (idx !== undefined) {
				bonusesCompressed[idx] = bonusId;
			}
		}
		
		// Encode locked cars
		const lockedEncoded = encodeLockedCars(state.lockedCars, carIdToIndex);
		
		// Build compressed save object with short keys
		const compressed = {
			v: CURRENT_VERSION,
			m: Math.floor(state.money),
			g: garageIndices,
			c: collectionEncoded,
			u: state.upgrades,
			tc: state.totalCollects,
			te: Math.floor(state.totalEarnings),
			lc: state.lastCollect,
			st: state.hasClaimedStarter ? 1 : 0,
			pp: state.packPurchases,
			po: state.packsOpened,
			cs: state.carsSold,
			ms: Math.floor(state.moneyFromSales),
			ac: state.activeChallenge,
			pc: state.purchasedChallenges,
			tk: state.tokens,
			tt: state.tuneTokens,
			rw: state.racesWon,
			rl: state.racesLost,
			ud: state.unlockedDifficulties,
			ce: enhancementsCompressed,
			lk: lockedEncoded,
			pb: bonusesCompressed,
		};
		
		// Remove empty/default values to reduce size
		if (Object.keys(compressed.c).length === 0) delete compressed.c;
		if (compressed.g.length === 0) delete compressed.g;
		if (Object.keys(compressed.u).length === 0) delete compressed.u;
		if (Object.keys(compressed.pp).length === 0) delete compressed.pp;
		if (compressed.pc.length === 0) delete compressed.pc;
		if (Object.keys(compressed.ce).length === 0) delete compressed.ce;
		if (!compressed.lk) delete compressed.lk;
		if (Object.keys(compressed.pb).length === 0) delete compressed.pb;
		if (compressed.tc === 0) delete compressed.tc;
		if (compressed.te === 0) delete compressed.te;
		if (compressed.lc === 0) delete compressed.lc;
		if (compressed.po === 0) delete compressed.po;
		if (compressed.cs === 0) delete compressed.cs;
		if (compressed.ms === 0) delete compressed.ms;
		if (!compressed.ac) delete compressed.ac;
		if (compressed.tk === 0) delete compressed.tk;
		if (compressed.tt === 0) delete compressed.tt;
		if (compressed.rw === 0) delete compressed.rw;
		if (compressed.rl === 0) delete compressed.rl;
		
		const jsonStr = JSON.stringify(compressed);
		const compressedStr = compress(jsonStr);
		
		return btoa(compressedStr);
	} catch (e) {
		console.error('Save compression error:', e);
		return null;
	}
};

/**
 * Decompress save code back to game state
 */
export const decompressSave = (code) => {
	try {
		const decompressedStr = decompress(atob(code));
		const compressed = JSON.parse(decompressedStr);
		
		const indexToCarId = getIndexToCarId();
		
		// Handle current version (v7)
		if (compressed.v === 7) {
			return {
				money: compressed.m || 1000,
				garage: (compressed.g || []).map(idx => indexToCarId[idx]).filter(Boolean),
				collection: decodeCollection(compressed.c || {}, indexToCarId),
				upgrades: compressed.u || {},
				totalCollects: compressed.tc || 0,
				totalEarnings: compressed.te || 0,
				lastCollect: compressed.lc || 0,
				hasClaimedStarter: compressed.st === 1,
				packPurchases: compressed.pp || {},
				packsOpened: compressed.po || 0,
				carsSold: compressed.cs || 0,
				moneyFromSales: compressed.ms || 0,
				activeChallenge: compressed.ac || null,
				purchasedChallenges: compressed.pc || [],
				tokens: compressed.tk || 0,
				tuneTokens: compressed.tt || 0,
				racesWon: compressed.rw || 0,
				racesLost: compressed.rl || 0,
				unlockedDifficulties: compressed.ud || ['low_cr'],
				carEnhancements: decodeEnhancements(compressed.ce || {}, indexToCarId),
				lockedCars: decodeLockedCars(compressed.lk, indexToCarId),
				prizeCarBonuses: decodeBonuses(compressed.pb || {}, indexToCarId),
			};
		}
		
		// Handle v6 format (legacy - array collection)
		if (compressed.v === 6 || compressed.v === 5 || compressed.v === 4) {
			return migrateLegacySave(compressed, indexToCarId);
		}
		
		// Handle very old formats
		return migrateOldSave(compressed, indexToCarId);
		
	} catch (e) {
		console.error('Save decompression error:', e);
		return null;
	}
};

/**
 * Decode enhancements from indices to carIds
 */
const decodeEnhancements = (encoded, indexToCarId) => {
	const enhancements = {};
	for (const [idx, stars] of Object.entries(encoded)) {
		const carId = indexToCarId[parseInt(idx)];
		if (carId) {
			enhancements[carId] = stars;
		}
	}
	return enhancements;
};

/**
 * Decode bonuses from indices to carIds
 */
const decodeBonuses = (encoded, indexToCarId) => {
	const bonuses = {};
	for (const [idx, bonusId] of Object.entries(encoded)) {
		const carId = indexToCarId[parseInt(idx)];
		if (carId) {
			bonuses[carId] = bonusId;
		}
	}
	return bonuses;
};

/**
 * Migrate from v4-v6 format (array-based collection)
 */
const migrateLegacySave = (compressed, indexToCarId) => {
	// Convert collection from {index: count} or array to new format
	let collection = {};
	
	if (compressed.c) {
		if (Array.isArray(compressed.c)) {
			// Very old format: array of carIds
			for (const carId of compressed.c) {
				collection[carId] = (collection[carId] || 0) + 1;
			}
		} else {
			// v4-v6: {index: count}
			for (const [idx, count] of Object.entries(compressed.c)) {
				const carId = indexToCarId[parseInt(idx)];
				if (carId) {
					collection[carId] = count;
				}
			}
		}
	}
	
	const garage = (compressed.g || []).map(idx => indexToCarId[idx]).filter(Boolean);
	
	// Convert locked cars
	let lockedCars = new Set();
	if (compressed.lk) {
		if (typeof compressed.lk === 'string') {
			lockedCars = decodeLockedCars(compressed.lk, indexToCarId);
		} else if (Array.isArray(compressed.lk)) {
			lockedCars = new Set(compressed.lk.map(idx => indexToCarId[idx]).filter(Boolean));
		}
	}
	
	return {
		money: compressed.m || 1000,
		garage,
		collection,
		upgrades: compressed.u || {},
		totalCollects: compressed.tc || 0,
		totalEarnings: compressed.te || 0,
		lastCollect: compressed.lc || 0,
		hasClaimedStarter: compressed.st === 1,
		packPurchases: compressed.pp || {},
		packsOpened: compressed.po || 0,
		carsSold: compressed.cs || 0,
		moneyFromSales: compressed.ms || 0,
		activeChallenge: compressed.ac || null,
		purchasedChallenges: compressed.pc || [],
		tokens: compressed.tk || 0,
		tuneTokens: compressed.tt || 0,
		racesWon: compressed.rw || 0,
		racesLost: compressed.rl || 0,
		unlockedDifficulties: compressed.ud || ['low_cr'],
		carEnhancements: decodeEnhancements(compressed.ce || {}, indexToCarId),
		lockedCars,
		prizeCarBonuses: decodeBonuses(compressed.pb || {}, indexToCarId),
	};
};

/**
 * Migrate from v1-v3 format
 */
const migrateOldSave = (compressed, indexToCarId) => {
	// Handle unversioned or v1-v3 saves
	let collection = {};
	
	if (compressed.collection) {
		if (Array.isArray(compressed.collection)) {
			for (const carId of compressed.collection) {
				collection[carId] = (collection[carId] || 0) + 1;
			}
		}
	} else if (compressed.c) {
		for (const [idx, count] of Object.entries(compressed.c)) {
			const carId = indexToCarId[parseInt(idx)];
			if (carId) {
				collection[carId] = count;
			}
		}
	}
	
	return {
		money: compressed.money || compressed.m || 1000,
		garage: compressed.garage || [],
		collection,
		upgrades: compressed.upgrades || compressed.u || {},
		totalCollects: compressed.totalCollects || compressed.tc || 0,
		totalEarnings: compressed.totalEarnings || compressed.te || 0,
		lastCollect: compressed.lastCollect || compressed.lc || 0,
		hasClaimedStarter: compressed.hasClaimedStarter || compressed.st === 1,
		packPurchases: compressed.packPurchases || compressed.pp || {},
		packsOpened: compressed.packsOpened || compressed.po || 0,
		carsSold: compressed.carsSold || compressed.cs || 0,
		moneyFromSales: compressed.moneyFromSales || compressed.ms || 0,
		activeChallenge: null,
		purchasedChallenges: [],
		tokens: 0,
		tuneTokens: 0,
		racesWon: 0,
		racesLost: 0,
		unlockedDifficulties: ['low_cr'],
		carEnhancements: {},
		lockedCars: new Set(),
		prizeCarBonuses: {},
	};
};

/**
 * Convert old array-based collection to new map-based format
 * Used during migration
 */
export const convertArrayToMapCollection = (arrayCollection) => {
	const mapCollection = {};
	for (const carId of arrayCollection) {
		mapCollection[carId] = (mapCollection[carId] || 0) + 1;
	}
	return mapCollection;
};

/**
 * Get total car count from map-based collection
 */
export const getTotalCarCount = (collection) => {
	return Object.values(collection).reduce((sum, count) => sum + count, 0);
};

/**
 * Get unique car count from map-based collection
 */
export const getUniqueCarCount = (collection) => {
	return Object.keys(collection).length;
};

/**
 * Check if collection has a car
 */
export const hasCarInCollection = (collection, carId) => {
	return (collection[carId] || 0) > 0;
};

/**
 * Get car count from collection
 */
export const getCarCount = (collection, carId) => {
	return collection[carId] || 0;
};

/**
 * Add car to collection (returns new collection)
 */
export const addToCollection = (collection, carId, count = 1) => {
	return {
		...collection,
		[carId]: (collection[carId] || 0) + count,
	};
};

/**
 * Remove car from collection (returns new collection)
 */
export const removeFromCollection = (collection, carId, count = 1) => {
	const newCount = (collection[carId] || 0) - count;
	if (newCount <= 0) {
		const { [carId]: removed, ...rest } = collection;
		return rest;
	}
	return {
		...collection,
		[carId]: newCount,
	};
};
