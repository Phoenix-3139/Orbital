export class PhysicsCalculator {
    // Gravitational constant as a static property
    static GRAVITATIONAL_CONSTANT = 6.67430e-11;

    /**
     * Calculate gravitational force between two masses.
     * @param {number} mass1 - Mass of the first object (kg).
     * @param {number} mass2 - Mass of the second object (kg).
     * @param {number} distance - Distance between the two objects (m).
     * @returns {number} Gravitational force (N).
     */
    static calculateGravForces(mass1, mass2, distance) {
        if (distance === 0) {
            throw new Error("Distance between objects cannot be zero.");
        }
        return (this.GRAVITATIONAL_CONSTANT * mass1 * mass2) / (distance * distance);
    }

    /**
     * Calculate gravitational acceleration.
     * @param {number} force - Gravitational force (N).
     * @param {number} mass - Mass of the object (kg).
     * @returns {number} Gravitational acceleration (m/s^2).
     */
    static calculateGravAcceleration(force, mass) {
        if (mass === 0) {
            throw new Error("Mass cannot be zero.");
        }
        return force / mass;
    }

    /**
     * Dormand-Prince RK45 Adaptive Step Size Integration
     * This is the algorithm used in professional orbital mechanics software
     * @param {Array} bodies - Array of all bodies in the system
     * @param {number} dt - Initial time step (will be adapted)
     * @param {number} tolerance - Error tolerance (default: 1e-10)
     * @param {number} maxStepSize - Maximum allowed step size
     * @param {number} minStepSize - Minimum allowed step size
     * @returns {number} - Actual time step used
     */
    static dormandPrinceRK45(bodies, dt, tolerance = 1e-10, maxStepSize = dt * 10, minStepSize = dt / 1000) {
        const n = bodies.length;
        
        // Store initial state
        const initialStates = bodies.map(body => ({
            position: { ...body.position },
            velocity: { ...body.velocity }
        }));

        let currentDt = Math.min(dt, maxStepSize);
        let stepAccepted = false;
        let actualTimeStep = 0;

        while (!stepAccepted) {
            // Dormand-Prince RK45 coefficients
            const a = [
                [0],
                [1/5],
                [3/40, 9/40],
                [44/45, -56/15, 32/9],
                [19372/6561, -25360/2187, 64448/6561, -212/729],
                [9017/3168, -355/33, 46732/5247, 49/176, -5103/18656],
                [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84]
            ];

            const b4 = [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84, 0];
            const b5 = [5179/57600, 0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40];

            // Calculate k values for all bodies simultaneously
            const k = Array(7).fill().map(() => 
                bodies.map(() => ({ 
                    velocity: { x: 0, y: 0 }, 
                    acceleration: { x: 0, y: 0 } 
                }))
            );

            // k1: derivatives at current state
            for (let i = 0; i < n; i++) {
                k[0][i].velocity = { ...bodies[i].velocity };
                k[0][i].acceleration = this.calculateTotalAcceleration(bodies, i);
            }

            // k2 through k6: intermediate derivatives
            for (let stage = 1; stage < 7; stage++) {
                // Update body states for this stage
                for (let i = 0; i < n; i++) {
                    let sumVelX = 0, sumVelY = 0, sumAccX = 0, sumAccY = 0;
                    
                    for (let j = 0; j < stage; j++) {
                        sumVelX += a[stage][j] * k[j][i].velocity.x;
                        sumVelY += a[stage][j] * k[j][i].velocity.y;
                        sumAccX += a[stage][j] * k[j][i].acceleration.x;
                        sumAccY += a[stage][j] * k[j][i].acceleration.y;
                    }

                    bodies[i].position.x = initialStates[i].position.x + currentDt * sumVelX;
                    bodies[i].position.y = initialStates[i].position.y + currentDt * sumVelY;
                    bodies[i].velocity.x = initialStates[i].velocity.x + currentDt * sumAccX;
                    bodies[i].velocity.y = initialStates[i].velocity.y + currentDt * sumAccY;
                }

                // Calculate derivatives at this stage
                for (let i = 0; i < n; i++) {
                    k[stage][i].velocity = { ...bodies[i].velocity };
                    k[stage][i].acceleration = this.calculateTotalAcceleration(bodies, i);
                }
            }

            // Calculate 4th and 5th order solutions
            const solution4 = bodies.map((body, i) => ({
                position: {
                    x: initialStates[i].position.x + currentDt * (
                        b4[0] * k[0][i].velocity.x + b4[1] * k[1][i].velocity.x + 
                        b4[2] * k[2][i].velocity.x + b4[3] * k[3][i].velocity.x + 
                        b4[4] * k[4][i].velocity.x + b4[5] * k[5][i].velocity.x + 
                        b4[6] * k[6][i].velocity.x
                    ),
                    y: initialStates[i].position.y + currentDt * (
                        b4[0] * k[0][i].velocity.y + b4[1] * k[1][i].velocity.y + 
                        b4[2] * k[2][i].velocity.y + b4[3] * k[3][i].velocity.y + 
                        b4[4] * k[4][i].velocity.y + b4[5] * k[5][i].velocity.y + 
                        b4[6] * k[6][i].velocity.y
                    )
                },
                velocity: {
                    x: initialStates[i].velocity.x + currentDt * (
                        b4[0] * k[0][i].acceleration.x + b4[1] * k[1][i].acceleration.x + 
                        b4[2] * k[2][i].acceleration.x + b4[3] * k[3][i].acceleration.x + 
                        b4[4] * k[4][i].acceleration.x + b4[5] * k[5][i].acceleration.x + 
                        b4[6] * k[6][i].acceleration.x
                    ),
                    y: initialStates[i].velocity.y + currentDt * (
                        b4[0] * k[0][i].acceleration.y + b4[1] * k[1][i].acceleration.y + 
                        b4[2] * k[2][i].acceleration.y + b4[3] * k[3][i].acceleration.y + 
                        b4[4] * k[4][i].acceleration.y + b4[5] * k[5][i].acceleration.y + 
                        b4[6] * k[6][i].acceleration.y
                    )
                }
            }));

            const solution5 = bodies.map((body, i) => ({
                position: {
                    x: initialStates[i].position.x + currentDt * (
                        b5[0] * k[0][i].velocity.x + b5[1] * k[1][i].velocity.x + 
                        b5[2] * k[2][i].velocity.x + b5[3] * k[3][i].velocity.x + 
                        b5[4] * k[4][i].velocity.x + b5[5] * k[5][i].velocity.x + 
                        b5[6] * k[6][i].velocity.x
                    ),
                    y: initialStates[i].position.y + currentDt * (
                        b5[0] * k[0][i].velocity.y + b5[1] * k[1][i].velocity.y + 
                        b5[2] * k[2][i].velocity.y + b5[3] * k[3][i].velocity.y + 
                        b5[4] * k[4][i].velocity.y + b5[5] * k[5][i].velocity.y + 
                        b5[6] * k[6][i].velocity.y
                    )
                },
                velocity: {
                    x: initialStates[i].velocity.x + currentDt * (
                        b5[0] * k[0][i].acceleration.x + b5[1] * k[1][i].acceleration.x + 
                        b5[2] * k[2][i].acceleration.x + b5[3] * k[3][i].acceleration.x + 
                        b5[4] * k[4][i].acceleration.x + b5[5] * k[5][i].acceleration.x + 
                        b5[6] * k[6][i].acceleration.x
                    ),
                    y: initialStates[i].velocity.y + currentDt * (
                        b5[0] * k[0][i].acceleration.y + b5[1] * k[1][i].acceleration.y + 
                        b5[2] * k[2][i].acceleration.y + b5[3] * k[3][i].acceleration.y + 
                        b5[4] * k[4][i].acceleration.y + b5[5] * k[5][i].acceleration.y + 
                        b5[6] * k[6][i].acceleration.y
                    )
                }
            }));

            // Calculate error estimate
            let maxError = 0;
            for (let i = 0; i < n; i++) {
                const posErrorX = Math.abs(solution5[i].position.x - solution4[i].position.x);
                const posErrorY = Math.abs(solution5[i].position.y - solution4[i].position.y);
                const velErrorX = Math.abs(solution5[i].velocity.x - solution4[i].velocity.x);
                const velErrorY = Math.abs(solution5[i].velocity.y - solution4[i].velocity.y);
                
                const bodyError = Math.max(posErrorX, posErrorY, velErrorX, velErrorY);
                maxError = Math.max(maxError, bodyError);
            }

            // Check if step is acceptable
            if (maxError <= tolerance) {
                // Accept the step - use 5th order solution
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...solution5[i].position };
                    bodies[i].velocity = { ...solution5[i].velocity };
                }
                stepAccepted = true;
                actualTimeStep = currentDt;
            } else {
                // Reject step and try with smaller dt
                // Restore original state
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...initialStates[i].position };
                    bodies[i].velocity = { ...initialStates[i].velocity };
                }
            }

            // Adapt step size for next iteration
            const safety = 0.9;
            const maxFactor = 2.0;
            const minFactor = 0.1;
            
            if (maxError > 0) {
                const factor = Math.max(minFactor, Math.min(maxFactor, 
                    safety * Math.pow(tolerance / maxError, 1/5)));
                currentDt *= factor;
            }

            // Enforce step size limits
            currentDt = Math.max(minStepSize, Math.min(maxStepSize, currentDt));

            // Safety check to prevent infinite loops
            if (currentDt < minStepSize && !stepAccepted) {
                console.warn("Minimum step size reached, accepting step with higher error");
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...solution4[i].position };
                    bodies[i].velocity = { ...solution4[i].velocity };
                }
                stepAccepted = true;
                actualTimeStep = currentDt;
            }
        }

        return actualTimeStep;
    }

    /**
     * Calculate total gravitational acceleration on one body due to all others
     * @param {Array} bodies - Array of all bodies
     * @param {number} bodyIndex - Index of the body to calculate acceleration for
     * @returns {object} - Acceleration vector {x, y}
     */
    static calculateTotalAcceleration(bodies, bodyIndex) {
        const body = bodies[bodyIndex];
        let totalAcceleration = { x: 0, y: 0 };

        for (let j = 0; j < bodies.length; j++) {
            if (j === bodyIndex) continue; // Skip self

            const otherBody = bodies[j];
            const dx = otherBody.position.x - body.position.x;
            const dy = otherBody.position.y - body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) continue; // Avoid division by zero

            // Calculate gravitational force and acceleration
            const force = this.calculateGravForces(body.mass, otherBody.mass, distance);
            const acceleration = force / body.mass;

            // Add to total acceleration
            totalAcceleration.x += (dx / distance) * acceleration;
            totalAcceleration.y += (dy / distance) * acceleration;
        }

        return totalAcceleration;
    }

    /**
     * Legacy Verlet integration (kept for compatibility)
     * @param {object} body - The body to update
     * @param {number} dt - Time step
     * @param {object} acceleration - Current acceleration
     */
    static verletIntegration(body, dt, acceleration) {
        if (!body.previousAcceleration) {
            body.previousAcceleration = { x: 0, y: 0 };
        }

        body.position.x += body.velocity.x * dt + 0.5 * body.previousAcceleration.x * dt * dt;
        body.position.y += body.velocity.y * dt + 0.5 * body.previousAcceleration.y * dt * dt;

        body.velocity.x += 0.5 * (body.previousAcceleration.x + acceleration.x) * dt;
        body.velocity.y += 0.5 * (body.previousAcceleration.y + acceleration.y) * dt;

        body.previousAcceleration.x = acceleration.x;
        body.previousAcceleration.y = acceleration.y;

        return body;
    }
}