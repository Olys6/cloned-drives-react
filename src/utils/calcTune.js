/**
 * 6-Stat Tune Calculation System v2.2 (ES Module)
 *
 * Each tune digit represents an upgrade category:
 * - 1st digit (Gearing): Top Speed + MRA
 * - 2nd digit (Engine): 0-60 + OLA
 * - 3rd digit (Chassis): Handling + Weight
 *
 * Tune Identities:
 * - 996: Drag   (Best TS, MRA, 0-60, OLA | Worst Handling, Weight)
 * - 969: Balanced (Best TS, MRA, Handling, Weight | Worst 0-60, OLA)
 * - 699: Circuit  (Best 0-60, OLA, Handling, Weight | Worst TS, MRA)
 */

const upgradeLevels = {
	gearing: {
		0: { tsMult: 0, mraBase: 0 },
		3: { tsMult: 1, mraBase: 3 },
		6: { tsMult: 2, mraBase: 5 },
		9: { tsMult: 3, mraBase: 8 },
	},
	engine: {
		0: { accelMult: 1.0, olaBase: 0 },
		3: { accelMult: 0.95, olaBase: 3 },
		6: { accelMult: 0.9, olaBase: 5 },
		9: { accelMult: 0.85, olaBase: 8 },
	},
	chassis: {
		0: { handlingMult: 1.0, weightBase: 0 },
		3: { handlingMult: 1.033, weightBase: 0.02 },
		6: { handlingMult: 1.066, weightBase: 0.05 },
		9: { handlingMult: 1.1, weightBase: 0.08 },
	},
};

const REFERENCE_MRA = 80;
const REFERENCE_OLA = 80;
const REFERENCE_WEIGHT = 1500;

export const VALID_TUNES = ['000', '333', '666', '699', '969', '996'];

export const TUNE_NAMES = {
	'000': 'Stock',
	'333': 'Stage 1',
	'666': 'Stage 2',
	'699': 'Circuit',
	'969': 'Balanced',
	'996': 'Drag',
};

/**
 * Calculate all 6 tuned stats for a car.
 * @param {Object} car  - must have topSpeed, 0to60, handling, weight, mra, ola
 * @param {string} tune - "000" | "333" | "666" | "699" | "969" | "996"
 * @returns {{ topSpeed:number, accel:number, handling:number, weight:number, mra:number, ola:number }}
 */
export function calcTune(car, tune = '000') {
	const gearingLvl = parseInt(tune[0]);
	const engineLvl = parseInt(tune[1]);
	const chassisLvl = parseInt(tune[2]);

	const gearing = upgradeLevels.gearing[gearingLvl];
	const engine = upgradeLevels.engine[engineLvl];
	const chassis = upgradeLevels.chassis[chassisLvl];

	if (!gearing || !engine || !chassis) {
		return {
			topSpeed: car.topSpeed,
			accel: car['0to60'],
			handling: car.handling,
			weight: car.weight,
			mra: car.mra || 0,
			ola: car.ola || 0,
		};
	}

	const baseTS = car.topSpeed;
	const baseAccel = car['0to60'];
	const baseHandling = car.handling;
	const baseWeight = car.weight;
	const baseMRA = car.mra || 0;
	const baseOLA = car.ola || 0;

	// Top Speed (needed first - other calcs depend on tuned TS)
	let topSpeed;
	if (baseTS < 60) {
		topSpeed = Math.round(baseTS + 26 * (gearingLvl / 9));
	} else {
		topSpeed = Math.round(baseTS + (520 / baseTS) * gearing.tsMult);
	}

	// 0-60
	let accel;
	if (topSpeed < 60) {
		accel = 99.9;
	} else if (baseTS < 60 && topSpeed >= 60) {
		const mphOver60 = topSpeed - 60;
		const estimatedAccel = Math.max(4.0, 60 - mphOver60 * 2.5);
		accel = Number((estimatedAccel * engine.accelMult).toFixed(1));
	} else {
		accel = Number((baseAccel * engine.accelMult).toFixed(1));
	}

	// Handling
	const handling = Math.round(baseHandling * chassis.handlingMult);

	// Weight (inverse scaling - heavy cars lose more kg)
	let weight;
	if (chassis.weightBase === 0) {
		weight = baseWeight;
	} else {
		const scaledReduction = chassis.weightBase * (baseWeight / REFERENCE_WEIGHT);
		weight = Math.round(baseWeight * (1 - scaledReduction));
	}

	// MRA (inverse scaling - low-MRA cars gain more)
	let mra;
	if (topSpeed >= 100 && baseMRA > 0 && gearing.mraBase > 0) {
		const scaledBonus = gearing.mraBase * (REFERENCE_MRA / baseMRA);
		mra = Number((baseMRA + scaledBonus).toFixed(2));
	} else {
		mra = Number(Number(baseMRA).toFixed(2));
	}

	// OLA (inverse scaling - low-OLA cars gain more)
	let ola;
	if (topSpeed >= 60 && baseOLA > 0 && engine.olaBase > 0) {
		const scaledBonus = engine.olaBase * (REFERENCE_OLA / baseOLA);
		ola = Number((baseOLA + scaledBonus).toFixed(2));
	} else {
		ola = Number(Number(baseOLA).toFixed(2));
	}

	return { topSpeed, accel, handling, weight, mra, ola };
}
