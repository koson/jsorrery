
import MoveAlgorithm from 'algorithm/MoveAlgorithm';
import Gravity from 'algorithm/Gravity';


const Quadratic = Object.create(MoveAlgorithm);

Quadratic.name = 'Quadratic';
Quadratic.moveBodies = function moveBodies(epochTime, deltaT) {

	this.computeDeltaT(deltaT);

	let i; 
	let b;
	const n = {};

	//forces at t0;
	Gravity.calculateGForces(this.bodies);

	//find accel at t0 and pos at t0.5
	for (i = 0; i < this.bodies.length; i++) {
		b = this.bodies[i];
		if (!b.isStill) {
			b.beforeMove(deltaT);

			if (b.calculateFromElements) {
				b.setPositionFromDate(epochTime + (this.halfDeltaT));
			} else {
				n[i] = {};
				n[i].accel = [
					b.force.clone().multiplyScalar(b.invMass),
				];
				n[i].pos = [
					b.position.clone(),
					//pos0.5 = pos0 + ((deltat/2) * vel0) + (0.5 * Math.pow((deltat / 2), 2)) * accel);
					b.position.clone()
						.add(b.getAbsoluteVelocity().multiplyScalar(this.halfDeltaT))
						.add(n[i].accel[0].clone().multiplyScalar(this.onehalf_halfDeltaTSq)),
				];
				b.position.copy(n[i].pos[1]);
			}
		}
	}

	//forces at t0.5 (all this.bodies are positionned at t0.5)
	Gravity.calculateGForces(this.bodies);

	//find accel at t0.5 and positions at t1
	for (i = 0; i < this.bodies.length; i++) {
		b = this.bodies[i];
		if (!b.isStill) {
			if (b.calculateFromElements) {
				b.setPositionFromDate(epochTime + deltaT);
			} else {
				n[i].accel.push(b.force.clone().multiplyScalar(b.invMass));

				//pos1 = pos0 + (vel0 * deltat) + (accel05 * 0.5 * Math.pow(deltaT, 2))
				n[i].pos.push(
					n[i].pos[0].clone()
						.add(b.getAbsoluteVelocity().multiplyScalar(deltaT))
						.add(n[i].accel[1].clone().multiplyScalar(this.onehalf_deltaTSq))
				);
				b.position.copy(n[i].pos[2]);
			}
		}
	}

	//forces at t1
	Gravity.calculateGForces(this.bodies);

	//find accel at t1
	for (i = 0; i < this.bodies.length; i++) {
		b = this.bodies[i];
		if (!b.isStill && !b.calculateFromElements) {
			n[i].accel.push(b.force.clone().multiplyScalar(b.invMass));
		}
	}

	//perform the actual integration
	let c1;
	let c2;
	let deltaV;
	let deltaP;
	for (i = 0; i < this.bodies.length; i++) {		

		b = this.bodies[i];
		if (!b.calculateFromElements && !b.isStill) {
			c1 = n[i].accel[0].clone().multiplyScalar(-3)
				.sub(n[i].accel[2])
				.add(n[i].accel[1].clone().multiplyScalar(4))
				.multiplyScalar(1 / deltaT);

			c2 = n[i].accel[0].clone()
				.add(n[i].accel[2])
				.sub(n[i].accel[1].clone().multiplyScalar(2))
				.multiplyScalar(2)
				.multiplyScalar(this.inverted_deltaTSq);

			deltaV = n[i].accel[0].clone()
				.multiplyScalar(deltaT)
				.add(c1.clone().multiplyScalar((this.onehalf_deltaTSq)))
				.add(c2.clone().multiplyScalar((this.onethird_deltaT3rd)));

			deltaP = b.getAbsoluteVelocity()
				.multiplyScalar(deltaT)
				.add(n[i].accel[0].clone().multiplyScalar(this.onehalf_deltaTSq))
				.add(c1.clone().multiplyScalar((this.onesixth_deltaT3rd)))
				.add(c2.clone().multiplyScalar((this.onetwelvth_deltaT4th)));

			this.bodies[i].position.copy(n[i].pos[0]).add(deltaP);	
			this.bodies[i].addToAbsoluteVelocity(deltaV);
		}

		b.afterMove(deltaT);

	}
};

export default Quadratic;
