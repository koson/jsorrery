
/**
number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position, depending on the precision of the integration.
*/

import Quadratic from 'algorithm/Quadratic';

let calculationsPerTick = 1;
let actualCalculationsPerTick = 1;
let secondsPerTick = 1;
let deltaTIncrement = 1;
let bodies = [];
let integration;

function setDT() {
	if (!calculationsPerTick || !secondsPerTick) return;
	if (secondsPerTick < calculationsPerTick) {
		actualCalculationsPerTick = secondsPerTick;
	} else {
		actualCalculationsPerTick = calculationsPerTick;
	}
	deltaTIncrement = Math.round(secondsPerTick / actualCalculationsPerTick);
	secondsPerTick = deltaTIncrement * actualCalculationsPerTick;
}

function moveByGravity(epochTime) {
	for (let t = 1; t <= actualCalculationsPerTick; t++) {
		integration.moveBodies(epochTime + (t * deltaTIncrement), deltaTIncrement);
	}
}

function moveByElements(epochTime) {
	// console.log(bodies.length);
	for (let i = 0; i < bodies.length; i++) {
		bodies[i].setPositionFromDate(epochTime);
	}
}

export default {
	
	tick(computePhysics, epochTime) {
		if (computePhysics) {
			moveByGravity(epochTime - secondsPerTick);
		} else {
			moveByElements(epochTime);
		}

		for (let i = 0; i < bodies.length; i++) {
			bodies[i].afterTick(secondsPerTick, !computePhysics);
		}/**/
		
		return secondsPerTick;
	},
	
	setBodies(b) {
		bodies = [ 
			...b,
		];
		integration = Quadratic.init(bodies);
	},
	
	setCalculationsPerTick(n) {
		calculationsPerTick = n || calculationsPerTick;
		setDT();
	},
	
	setSecondsPerTick(s) {
		secondsPerTick = s;
		setDT();
	},

	getDeltaT() {
		return secondsPerTick;
	},
};
