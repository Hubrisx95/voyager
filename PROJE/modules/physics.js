// modules/physics.js

window.Physics = {
    /**
     * Calculates the gravitational acceleration vector at a given position.
     * @param {THREE.Vector3} pos - Current position of the spacecraft
     * @param {THREE.Vector3} bodyPos - Position of the celestial body
     * @param {number} bodyMass - Scaled mass of the body
     * @param {number} softening - Prevents division by zero or extreme forces on close approach
     * @returns {THREE.Vector3} Acceleration vector
     */
    getGravityAcceleration: (pos, bodyPos, bodyMass, softening = 5.0) => {
        const dir = new THREE.Vector3().subVectors(bodyPos, pos);
        const distSq = dir.lengthSq() + softening;
        
        // Scaled generic gravity constant for visual simulation purposes
        const force = bodyMass / distSq;
        
        return dir.normalize().multiplyScalar(force);
    },

    /**
     * Steps the physics for a given position and velocity using simple Euler integration
     * @param {THREE.Vector3} pos - Current position, modified in place
     * @param {THREE.Vector3} vel - Current velocity, modified in place
     * @param {Array} bodies - Array of { pos: THREE.Vector3, mass: number }
     * @param {number} dt - Time step
     */
    step: (pos, vel, bodies, dt) => {
        const totalAcc = new THREE.Vector3(0, 0, 0);
        
        // Sum gravity from all relevant bodies
        for(let body of bodies) {
            const acc = window.Physics.getGravityAcceleration(pos, body.pos, body.mass);
            totalAcc.add(acc);
        }

        // v = v + a*dt
        vel.add(totalAcc.multiplyScalar(dt));
        
        // p = p + v*dt
        const deltaPos = vel.clone().multiplyScalar(dt);
        pos.add(deltaPos);
    }
};
