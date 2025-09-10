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
     * Proper Verlet Velocity Integration
     * @param {object} body - The body to update (must have position, velocity, acceleration, and previousAcceleration).
     * @param {number} dt - Time step (seconds).
     * @param {object} newAcceleration - The new acceleration for this time step (e.g., { x, y }).
     */
    static verletIntegration(body, dt, newAcceleration) {
        // Initialize previousAcceleration if it doesn't exist (first time step)
        if (!body.previousAcceleration) {
            body.previousAcceleration = { x: 0, y: 0 };
        }

        // Update position using current velocity and current acceleration
        body.position.x += body.velocity.x * dt + 0.5 * body.previousAcceleration.x * dt * dt;
        body.position.y += body.velocity.y * dt + 0.5 * body.previousAcceleration.y * dt * dt;

        // Update velocity using the average of previous and new acceleration
        body.velocity.x += 0.5 * (body.previousAcceleration.x + newAcceleration.x) * dt;
        body.velocity.y += 0.5 * (body.previousAcceleration.y + newAcceleration.y) * dt;

        // Store current acceleration as previous for next iteration
        body.previousAcceleration.x = newAcceleration.x;
        body.previousAcceleration.y = newAcceleration.y;

        return body;
    }

    /**
     * Alternative: Leapfrog Integration (often more stable for orbital mechanics)
     * @param {object} body - The body to update
     * @param {number} dt - Time step
     * @param {object} acceleration - Current acceleration
     */
    static leapfrogIntegration(body, dt, acceleration) {
        // Initialize half-step velocity if it doesn't exist
        if (!body.halfStepVelocity) {
            body.halfStepVelocity = {
                x: body.velocity.x - 0.5 * acceleration.x * dt,
                y: body.velocity.y - 0.5 * acceleration.y * dt
            };
        }

        // Update position using half-step velocity
        body.position.x += body.halfStepVelocity.x * dt;
        body.position.y += body.halfStepVelocity.y * dt;

        // Update half-step velocity
        body.halfStepVelocity.x += acceleration.x * dt;
        body.halfStepVelocity.y += acceleration.y * dt;

        // Update full velocity (for external use)
        body.velocity.x = body.halfStepVelocity.x + 0.5 * acceleration.x * dt;
        body.velocity.y = body.halfStepVelocity.y + 0.5 * acceleration.y * dt;

        return body;
    }

    /**
     * Calculate gravitational acceleration between two bodies
     * @param {object} body1 - First body with position and mass
     * @param {object} body2 - Second body with position and mass
     * @returns {object} Acceleration vector for body1 due to body2
     */
    static calculateGravitationalAcceleration(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) {
            return { x: 0, y: 0 };
        }

        const force = this.calculateGravForces(body1.mass, body2.mass, distance);
        const acceleration = force / body1.mass;
        
        // Normalize direction and apply acceleration
        return {
            x: (dx / distance) * acceleration,
            y: (dy / distance) * acceleration
        };
    }
}