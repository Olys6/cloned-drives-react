// Race Engine - Shared between CDClicker and RaceSimulator
// This file contains all race calculation logic

export const driveHierarchy = ["AWD", "4WD", "FWD", "RWD"];
export const gcHierarchy = ["High", "Medium", "Low"];

/**
 * weatherVars v2.0 - Scaled for new race formula
 * 
 * All penalties/bonuses scaled 2x to compensate for:
 * - Top Speed now ÷2 instead of ÷4.2 (+110% impact)
 * - Need tyre/drive advantages to remain relevant
 */
export const weatherVars = {
	// Drag surfaces
	"Sunny Drag": { drivePen: 0, absPen: 0, tcsPen: 2, tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": -15 } },
	"Rainy Drag": { drivePen: 4, absPen: 0, tcsPen: 2, tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 40, "Drag": 140 } },
	// Track surfaces
	"Sunny Track": { drivePen: 0, absPen: 0, tcsPen: 0, tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": -32, "Drag": 18 } },
	"Rainy Track": { drivePen: 8, absPen: 2, tcsPen: 2, tyrePen: { "Standard": 0, "Performance": 22, "All-Surface": 10, "Off-Road": 100, "Slick": 80, "Drag": 240 } },
	// Asphalt surfaces
	"Sunny Asphalt": { drivePen: 0, absPen: 0, tcsPen: 0, tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": 10 } },
	"Rainy Asphalt": { drivePen: 8, absPen: 2, tcsPen: 2, tyrePen: { "Standard": 0, "Performance": 22, "All-Surface": 10, "Off-Road": 80, "Slick": 100, "Drag": 200 } },
	// Gravel surfaces
	"Sunny Gravel": { drivePen: 4, absPen: 0, tcsPen: 0, tyrePen: { "Standard": 0, "Performance": 35, "All-Surface": -8, "Off-Road": -9, "Slick": 80, "Drag": 200 } },
	"Rainy Gravel": { drivePen: 11, absPen: 2.5, tcsPen: 2.5, tyrePen: { "Standard": 0, "Performance": 35, "All-Surface": -11, "Off-Road": -15, "Slick": 85, "Drag": 400 } },
	// Sand surfaces
	"Sunny Sand": { drivePen: 11, absPen: -2.5, tcsPen: -2.5, tyrePen: { "Standard": 0, "Performance": 101, "All-Surface": -31, "Off-Road": -41, "Slick": 161, "Drag": 1000 } },
	// Dirt surfaces
	"Sunny Dirt": { drivePen: 14, absPen: 3.5, tcsPen: 3.5, tyrePen: { "Standard": 0, "Performance": 40, "All-Surface": -50, "Off-Road": -66, "Slick": 130, "Drag": 1000 } },
	"Rainy Dirt": { drivePen: 17, absPen: 5, tcsPen: 5, tyrePen: { "Standard": 0, "Performance": 60, "All-Surface": -80, "Off-Road": -120, "Slick": 260, "Drag": 1000 } },
	// Snow surfaces
	"Sunny Snow": { drivePen: 24, absPen: 6, tcsPen: 6, tyrePen: { "Standard": 0, "Performance": 150, "All-Surface": -40, "Off-Road": -90, "Slick": 850, "Drag": 1400 } },
	// Ice surfaces
	"Sunny Ice": { drivePen: 34, absPen: 8.5, tcsPen: 8.5, tyrePen: { "Standard": 0, "Performance": 250, "All-Surface": -130, "Off-Road": -200, "Slick": 1750, "Drag": 1800 } },
	// Test tracks
	"TT OffRoad": { drivePen: 0, absPen: 0, tcsPen: 0, tyrePen: { "Standard": 0, "Performance": 200, "All-Surface": -150, "Off-Road": -200, "Slick": 800, "Drag": 1400 } },
	"TT OnRoad": { drivePen: 0, absPen: 0, tcsPen: 0, tyrePen: { "Standard": 0, "Performance": 0, "All-Surface": 0, "Off-Road": 0, "Slick": 0, "Drag": 0 } },
};

/**
 * Race Formula v2.0 - Balanced for 6-stat tune system
 * 
 * Changes from v1.0:
 * - Top Speed: ÷4.2 → ÷2 (+110% value)
 * - 0-60: ×15 → ×8 (-47% value)
 * - Handling: ×1 → ×1.2 (+20% value)
 * - Weight: ÷50 → ÷30 (+67% value)
 * - MRA: ÷10 → ÷6 (+67% value)
 * - OLA: ÷10 → ÷10 (unchanged)
 * 
 * This rebalancing ensures all three max tunes have viable niches:
 * - 996 (Drag): Wins on high TS + 0-60 tracks
 * - 969 (Balanced): Wins on mixed/balanced tracks
 * - 699 (Twisty): Wins on high handling + weight tracks
 * 
 * @param {Object} player - Player car stats
 * @param {Object} opponent - Opponent car stats
 * @param {Object} track - Track data
 * @returns {number} Score (positive = player wins)
 */
export const evaluateRace = (player, opponent, track) => {
	const weatherKey = track.surface?.startsWith("TT") ? track.surface : `${track.weather} ${track.surface}`;
	const vars = weatherVars[weatherKey] || weatherVars["Sunny Asphalt"];
	const { tcsPen, absPen, drivePen, tyrePen } = vars;
	
	let score = 0;
	
	// Top Speed: ÷2 (was ÷4.2) - Major buff to high-speed cars
	score += (player.topSpeed - opponent.topSpeed) / 2 * ((track.specsDistr?.topSpeed || 0) / 100);
	
	// 0-60: ×8 (was ×15) - Major nerf to launch-focused builds
	score += (opponent["0to60"] - player["0to60"]) * 8 * ((track.specsDistr?.["0to60"] || 0) / 100);
	
	// Handling: ×1.2 (was ×1) - Slight buff to cornering ability
	score += (player.handling - opponent.handling) * 1.2 * ((track.specsDistr?.handling || 0) / 100);
	
	// Weight: ÷30 (was ÷50) - Buff to lightweight cars
	score += (opponent.weight - player.weight) / 30 * ((track.specsDistr?.weight || 0) / 100);
	
	// MRA: ÷6 (was ÷10) - Buff to high-speed acceleration
	score += ((player.mra || 50) - (opponent.mra || 50)) / 6 * ((track.specsDistr?.mra || 0) / 100);
	
	// OLA: ÷10 (unchanged) - Off-the-line acceleration
	score += ((opponent.ola || 50) - (player.ola || 50)) / 10 * ((track.specsDistr?.ola || 0) / 100);
	
	// Ground clearance penalties
	const playerGC = player.gc || 'Medium';
	const opponentGC = opponent.gc || 'Medium';
	if (playerGC.toLowerCase() === "low") score -= ((track.speedbumps || 0) * 10);
	if (opponentGC.toLowerCase() === "low") score += ((track.speedbumps || 0) * 10);
	score += (gcHierarchy.indexOf(opponentGC) - gcHierarchy.indexOf(playerGC)) * (track.humps || 0) * 10;
	
	// Drive type penalties
	const playerDrive = player.driveType || 'FWD';
	const opponentDrive = opponent.driveType || 'FWD';
	score += (driveHierarchy.indexOf(opponentDrive) - driveHierarchy.indexOf(playerDrive)) * drivePen;
	
	// Tyre type penalties
	const playerTyre = player.tyreType || 'Standard';
	const opponentTyre = opponent.tyreType || 'Standard';
	score += ((tyrePen[opponentTyre] || 0) - (tyrePen[playerTyre] || 0));
	
	// ABS/TCS
	if ((track.specsDistr?.handling || 0) > 0) {
		score += ((player.abs ? 1 : 0) - (opponent.abs ? 1 : 0)) * absPen;
	}
	score += ((player.tcs ? 1 : 0) - (opponent.tcs ? 1 : 0)) * tcsPen;
	
	// MPH track special cases
	const trackName = track.trackName || track.name || '';
	if (trackName.includes("MPH")) {
		let [startMPH, endMPH] = trackName.split("-");
		startMPH = parseInt(startMPH);
		endMPH = parseInt(endMPH);
		
		if ((opponent.topSpeed < startMPH && player.topSpeed >= startMPH) || (opponent.topSpeed < endMPH && player.topSpeed >= endMPH)) {
			score = 250;
		} else if ((opponent.topSpeed >= startMPH && player.topSpeed < startMPH) || (opponent.topSpeed >= endMPH && player.topSpeed < endMPH)) {
			score = -250;
		} else if (opponent.topSpeed < endMPH && player.topSpeed < endMPH) {
			score = player.topSpeed - opponent.topSpeed;
		}
	}
	
	return Math.round((score + Number.EPSILON) * 100) / 100;
};

/**
 * Check if a car has a specific upgrade (flat property format)
 */
export const hasUpgrade = (car, upgrade) => {
	if (!car) return false;
	if (upgrade === "000") return true;
	return car[`${upgrade}TopSpeed`] !== undefined;
};

/**
 * Get car stats for a selected upgrade (flat property format: 333TopSpeed, etc.)
 */
export const getCarStats = (car, upgrade = "000") => {
	if (!car) return null;
	let topSpeed, accel, handling;
	if (upgrade === "000") {
		topSpeed = car.topSpeed;
		accel = car["0to60"];
		handling = car.handling;
	} else {
		topSpeed = car[`${upgrade}TopSpeed`] ?? car.topSpeed;
		accel = car[`${upgrade}0to60`] ?? car["0to60"];
		handling = car[`${upgrade}Handling`] ?? car.handling;
	}
	return {
		topSpeed, accel, handling,
		weight: car.weight, mra: car.mra, ola: car.ola, gc: car.gc,
		driveType: car.driveType, tyreType: car.tyreType,
		abs: car.abs ? 1 : 0, tcs: car.tcs ? 1 : 0,
	};
};

/**
 * Get race advantages as an array of strings (matches bot compare logic)
 */
export const getRaceAdvantages = (player, opponent, track, playerWon) => {
	const weatherKey = track.surface?.startsWith("TT") ? track.surface : `${track.weather} ${track.surface}`;
	const vars = weatherVars[weatherKey] || weatherVars["Sunny Asphalt"];
	const { tyrePen } = vars;
	
	const advantages = [];
	
	const comparison = {
		topSpeed: player.topSpeed - opponent.topSpeed,
		"0to60": opponent["0to60"] - player["0to60"],
		handling: player.handling - opponent.handling,
		weight: opponent.weight - player.weight,
		mra: (player.mra || 50) - (opponent.mra || 50),
		ola: (opponent.ola || 50) - (player.ola || 50),
		gc: gcHierarchy.indexOf((opponent.gc || 'Medium')) - gcHierarchy.indexOf((player.gc || 'Medium')),
		driveType: driveHierarchy.indexOf((opponent.driveType || 'FWD')) - driveHierarchy.indexOf((player.driveType || 'FWD')),
		tyreType: ((tyrePen[(opponent.tyreType || 'Standard')] || 0) - (tyrePen[(player.tyreType || 'Standard')] || 0)),
		abs: (player.abs ? 1 : 0) - (opponent.abs ? 1 : 0),
		tcs: (player.tcs ? 1 : 0) - (opponent.tcs ? 1 : 0),
	};
	
	for (const [key, rawValue] of Object.entries(comparison)) {
		const value = playerWon ? rawValue : -rawValue;
		const compareValue = track.specsDistr?.[key];
		
		// Stats with track distribution weighting
		if (compareValue !== undefined && compareValue > 0 && value > 0) {
			switch (key) {
				case "topSpeed": advantages.push("Higher top speed"); break;
				case "0to60": advantages.push("Lower 0-60"); break;
				case "handling": advantages.push("Better handling"); break;
				case "weight": advantages.push("Lower weight"); break;
				case "mra": advantages.push("Better mid-range acceleration"); break;
				case "ola": advantages.push("Better off-the-line acceleration"); break;
			}
		}
		// Special condition stats (no track distribution)
		else if (value > 0) {
			switch (key) {
				case "gc":
					if ((track.humps || 0) > 0) {
						advantages.push("Higher ground clearance");
					} else if ((track.speedbumps || 0) > 0 && ((opponent.gc || 'Medium') === "Low" || (player.gc || 'Medium') === "Low")) {
						advantages.push("Higher ground clearance");
					}
					break;
				case "driveType":
					if (!["Asphalt", "Drag", "Track"].includes(track.surface) || track.weather === "Rainy") {
						advantages.push("Better drive system for the surface conditions");
					}
					break;
				case "tyreType":
					if (track.surface !== "Asphalt" || track.weather === "Rainy") {
						advantages.push("Better tyres for the surface conditions");
					}
					break;
				case "abs":
					if ((track.surface !== "Asphalt" || track.weather === "Rainy") && (track.specsDistr?.handling || 0) > 0) {
						advantages.push("ABS");
					}
					break;
				case "tcs":
					if (track.surface !== "Asphalt" || track.weather === "Rainy") {
						advantages.push("Traction Control");
					}
					break;
			}
		}
	}
	
	// MPH track special case
	const trackName = track.trackName || track.name || '';
	if (trackName.includes("MPH") && comparison.topSpeed !== 0) {
		const [, endMPH] = trackName.split("-");
		const end = parseInt(endMPH);
		const tsAdv = playerWon ? comparison.topSpeed : -comparison.topSpeed;
		if (tsAdv > 0 && opponent.topSpeed < end && player.topSpeed < end) {
			return ["Higher top speed"];
		}
	}
	
	return advantages.length > 0 ? advantages : ["Close race!"];
};

/**
 * Generate an opponent car within CR range
 */
export const generateOpponent = (gameCars, crRange, excludeIds = []) => {
	const [minCR, maxCR] = crRange;
	
	let pool = gameCars.filter(car => 
		car.cr >= minCR && 
		car.cr <= maxCR && 
		!excludeIds.includes(car.carID)
	);
	
	// If no cars in range, expand the search
	if (pool.length === 0) {
		pool = gameCars.filter(car => 
			car.cr >= minCR - 50 && 
			car.cr <= maxCR + 50 &&
			!excludeIds.includes(car.carID)
		);
	}
	
	// Still no cars? Get any car
	if (pool.length === 0) {
		const targetCR = (minCR + maxCR) / 2;
		pool = [...gameCars].sort((a, b) => Math.abs(a.cr - targetCR) - Math.abs(b.cr - targetCR)).slice(0, 50);
	}
	
	return pool[Math.floor(Math.random() * pool.length)];
};
