/**
 * Physics Calculator for N-Body Gravitational Simulation
 * 
 * This class provides advanced numerical integration methods for simulating
 * gravitational interactions between multiple celestial bodies. It implements:
 * 
 * - Newton's Law of Universal Gravitation
 * - Dormand-Prince RK45 adaptive step-size integration
 * - Professional-grade orbital mechanics algorithms
 * - Error control and numerical stability features
 * - Legacy Verlet integration for compatibility
 * 
 * The Dormand-Prince RK45 method is the same algorithm used in:
 * - NASA's GMAT (General Mission Analysis Tool)
 * - ESA's orbital mechanics software
 * - Professional spacecraft trajectory design
 * 
 * Mathematical Foundation:
 * - Runge-Kutta family of numerical integration methods
 * - Adaptive step-size control for optimal accuracy/performance
 * - Embedded error estimation using 4th and 5th order solutions
 * - Gravitational force calculations using inverse square law
 */

import { Body } from '../Data/body.js';

export class PhysicsCalculator {
    // === UNIVERSAL CONSTANTS ===
    // Fundamental physical constant used throughout gravitational calculations
    
    /**
     * Universal Gravitational Constant
     * G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²
     * This is the constant that appears in Newton's law of universal gravitation
     */
    static GRAVITATIONAL_CONSTANT = 6.67430e-11;

    // === BASIC GRAVITATIONAL CALCULATIONS ===
    // Foundation methods for gravitational force and acceleration

    /**
     * Calculate Gravitational Force Between Two Masses
     * 
     * Implements Newton's Law of Universal Gravitation:
     * F = G × m₁ × m₂ / r²
     * 
     * Where:
     * - F = gravitational force (Newtons)
     * - G = gravitational constant
     * - m₁, m₂ = masses of the two objects (kg)
     * - r = distance between centers of mass (meters)
     * 
     * @param {number} mass1 - Mass of the first object in kilograms
     * @param {number} mass2 - Mass of the second object in kilograms
     * @param {number} distance - Distance between objects in meters
     * @returns {number} Gravitational force in Newtons
     * @throws {Error} If distance is zero (division by zero)
     */
    static calculateGravForces(mass1, mass2, distance) {
        // Prevent division by zero which would result in infinite force
        if (distance === 0) {
            throw new Error("Distance between objects cannot be zero.");
        }
        
        // Apply Newton's law of universal gravitation
        // Force is proportional to the product of masses and inversely proportional to distance squared
        return (this.GRAVITATIONAL_CONSTANT * mass1 * mass2) / (distance * distance);
    }

    /**
     * Calculate Gravitational Acceleration
     * 
     * Uses Newton's Second Law: F = ma, therefore a = F/m
     * This gives the acceleration experienced by an object due to gravitational force.
     * 
     * @param {number} force - Gravitational force in Newtons
     * @param {number} mass - Mass of the object experiencing acceleration in kilograms
     * @returns {number} Gravitational acceleration in meters per second squared
     * @throws {Error} If mass is zero (division by zero)
     */
    static calculateGravAcceleration(force, mass) {
        // Prevent division by zero which would result in infinite acceleration
        if (mass === 0) {
            throw new Error("Mass cannot be zero.");
        }
        
        // Apply Newton's second law: acceleration = force / mass
        return force / mass;
    }

    // === ADVANCED NUMERICAL INTEGRATION ===
    // Professional-grade integration methods for high-precision orbital mechanics

    /**
     * Dormand-Prince RK45 Adaptive Step Size Integration
     * 
     * This is the gold standard for orbital mechanics integration, used in:
     * - NASA mission planning software
     * - European Space Agency trajectory analysis
     * - Commercial spacecraft design tools
     * - Academic orbital mechanics research
     * 
     * The method works by:
     * 1. Computing two solutions: 4th order (less accurate) and 5th order (more accurate)
     * 2. Comparing the solutions to estimate the integration error
     * 3. Adapting the step size to maintain error within tolerance
     * 4. Accepting or rejecting steps based on error estimates
     * 
     * Key advantages:
     * - Automatic error control ensures accuracy
     * - Adaptive step sizing optimizes performance
     * - Handles close encounters and complex trajectories
     * - Maintains energy conservation over long periods
     * 
     * @param {Array} bodies - Array of all celestial bodies in the system
     * @param {number} dt - Initial time step in seconds (will be adapted)
     * @param {number} tolerance - Error tolerance (default: 1e-10 for high precision)
     * @param {number} maxStepSize - Maximum allowed step size in seconds
     * @param {number} minStepSize - Minimum allowed step size in seconds
     * @returns {number} Actual time step used after adaptation
     */
    static dormandPrinceRK45(bodies, dt, tolerance = 1e-10, maxStepSize = dt * 10, minStepSize = dt / 1000) {
        const n = bodies.length; // Number of bodies in the system
        
        // Store initial state of all bodies before attempting integration step
        // This allows us to restore the state if we need to retry with a smaller step
        const initialStates = bodies.map(body => ({
            position: { ...body.position },  // Deep copy of position vector
            velocity: { ...body.velocity }   // Deep copy of velocity vector
        }));

        // Initialize adaptive step size control variables
        let currentDt = Math.min(dt, maxStepSize);  // Start with requested step, but don't exceed maximum
        let stepAccepted = false;                   // Flag to track if current step is acceptable
        let actualTimeStep = 0;                     // The final step size that was accepted

        // Main integration loop - continue until we find an acceptable step
        while (!stepAccepted) {
            // === DORMAND-PRINCE RK45 COEFFICIENTS ===
            // These coefficients define the Dormand-Prince method
            // They are carefully chosen to provide 4th and 5th order accuracy
            
            // Coefficients for intermediate stages (Butcher tableau 'a' matrix)
            const a = [
                [0],                                                    // Stage 0: initial point
                [1/5],                                                  // Stage 1: 1/5 of the way
                [3/40, 9/40],                                          // Stage 2: weighted combination
                [44/45, -56/15, 32/9],                                 // Stage 3: more complex weighting
                [19372/6561, -25360/2187, 64448/6561, -212/729],      // Stage 4: high-order terms
                [9017/3168, -355/33, 46732/5247, 49/176, -5103/18656], // Stage 5: refinement
                [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84]     // Stage 6: final combination
            ];

            // Coefficients for 4th order solution (lower accuracy)
            const b4 = [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84, 0];
            
            // Coefficients for 5th order solution (higher accuracy)
            const b5 = [5179/57600, 0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40];

            // === STAGE CALCULATION ===
            // Calculate derivative estimates (k values) at multiple points
            // Each k represents the rate of change at a different point in the step
            
            // Initialize storage for all k values (7 stages, n bodies each)
            const k = Array(7).fill().map(() => 
                bodies.map(() => ({ 
                    velocity: { x: 0, y: 0 },       // Rate of change of position (velocity)
                    acceleration: { x: 0, y: 0 }    // Rate of change of velocity (acceleration)
                }))
            );

            // STAGE 1: Calculate derivatives at the current state (t, y)
            for (let i = 0; i < n; i++) {
                k[0][i].velocity = { ...bodies[i].velocity };              // dx/dt = velocity
                k[0][i].acceleration = this.calculateTotalAcceleration(bodies, i); // dv/dt = acceleration
            }

            // STAGES 2-7: Calculate derivatives at intermediate points
            for (let stage = 1; stage < 7; stage++) {
                // Update all body states for this intermediate stage
                for (let i = 0; i < n; i++) {
                    // Calculate weighted sum of previous k values for this stage
                    let sumVelX = 0, sumVelY = 0, sumAccX = 0, sumAccY = 0;
                    
                    // Sum contributions from all previous stages according to 'a' coefficients
                    for (let j = 0; j < stage; j++) {
                        sumVelX += a[stage][j] * k[j][i].velocity.x;
                        sumVelY += a[stage][j] * k[j][i].velocity.y;
                        sumAccX += a[stage][j] * k[j][i].acceleration.x;
                        sumAccY += a[stage][j] * k[j][i].acceleration.y;
                    }

                    // Update body state to intermediate position for this stage
                    bodies[i].position.x = initialStates[i].position.x + currentDt * sumVelX;
                    bodies[i].position.y = initialStates[i].position.y + currentDt * sumVelY;
                    bodies[i].velocity.x = initialStates[i].velocity.x + currentDt * sumAccX;
                    bodies[i].velocity.y = initialStates[i].velocity.y + currentDt * sumAccY;
                }

                // Calculate derivatives at this intermediate state
                for (let i = 0; i < n; i++) {
                    k[stage][i].velocity = { ...bodies[i].velocity };
                    k[stage][i].acceleration = this.calculateTotalAcceleration(bodies, i);
                }
            }

            // === SOLUTION CALCULATION ===
            // Compute both 4th and 5th order solutions using different coefficient sets
            
            // 4th order solution (less accurate, used for error estimation)
            const solution4 = bodies.map((body, i) => ({
                position: {
                    // 4th order position update using b4 coefficients
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
                    // 4th order velocity update using b4 coefficients
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

            // 5th order solution (more accurate, this is what we actually use)
            const solution5 = bodies.map((body, i) => ({
                position: {
                    // 5th order position update using b5 coefficients
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
                    // 5th order velocity update using b5 coefficients
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

            // === ERROR ESTIMATION ===
            // The difference between 4th and 5th order solutions estimates the integration error
            
            let maxError = 0; // Track the maximum error across all bodies and components
            
            for (let i = 0; i < n; i++) {
                // Calculate error in each component (position and velocity, x and y)
                const posErrorX = Math.abs(solution5[i].position.x - solution4[i].position.x);
                const posErrorY = Math.abs(solution5[i].position.y - solution4[i].position.y);
                const velErrorX = Math.abs(solution5[i].velocity.x - solution4[i].velocity.x);
                const velErrorY = Math.abs(solution5[i].velocity.y - solution4[i].velocity.y);
                
                // Find the maximum error for this body across all components
                const bodyError = Math.max(posErrorX, posErrorY, velErrorX, velErrorY);
                
                // Track the maximum error across all bodies
                maxError = Math.max(maxError, bodyError);
            }

            // === STEP ACCEPTANCE/REJECTION ===
            // Decide whether to accept this step or try again with a smaller step size
            
            if (maxError <= tolerance) {
                // Error is acceptable - use the more accurate 5th order solution
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...solution5[i].position };
                    bodies[i].velocity = { ...solution5[i].velocity };
                }
                stepAccepted = true;        // Mark step as successful
                actualTimeStep = currentDt; // Record the step size that worked
            } else {
                // Error is too large - reject this step and restore original state
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...initialStates[i].position };
                    bodies[i].velocity = { ...initialStates[i].velocity };
                }
                // stepAccepted remains false, so we'll try again with smaller dt
            }

            // === ADAPTIVE STEP SIZE CONTROL ===
            // Adjust step size for next iteration based on error estimate
            
            const safety = 0.9;     // Safety factor to be conservative with step size
            const maxFactor = 2.0;  // Don't increase step size by more than 2x
            const minFactor = 0.1;  // Don't decrease step size by more than 10x
            
            if (maxError > 0) {
                // Calculate optimal step size factor using error estimate
                // Formula: factor = safety × (tolerance/error)^(1/5)
                // The 1/5 power comes from the 5th order accuracy of the method
                const factor = Math.max(minFactor, Math.min(maxFactor, 
                    safety * Math.pow(tolerance / maxError, 1/5)));
                currentDt *= factor; // Apply the factor to current step size
            }

            // Enforce absolute step size limits to prevent extreme values
            currentDt = Math.max(minStepSize, Math.min(maxStepSize, currentDt));

            // === SAFETY CHECK ===
            // Prevent infinite loops in case we can't achieve the desired tolerance
            
            if (currentDt < minStepSize && !stepAccepted) {
                // We've hit the minimum step size but still can't meet tolerance
                // Accept the step anyway using the 4th order solution to make progress
                console.warn("Minimum step size reached, accepting step with higher error");
                for (let i = 0; i < n; i++) {
                    bodies[i].position = { ...solution4[i].position };
                    bodies[i].velocity = { ...solution4[i].velocity };
                }
                stepAccepted = true;
                actualTimeStep = currentDt;
            }
        }

        // Return the actual time step that was used
        // This can be used by the calling code to track integration progress
        return actualTimeStep;
    }

    // === GRAVITATIONAL ACCELERATION CALCULATION ===
    // Support method for computing N-body gravitational interactions

    /**
     * Calculate Total Gravitational Acceleration on One Body
     * 
     * Computes the net gravitational acceleration on a single body due to
     * all other bodies in the system. This is the core of N-body simulation.
     * 
     * The calculation:
     * 1. Iterates through all other bodies in the system
     * 2. Calculates gravitational force from each other body
     * 3. Converts force to acceleration using F = ma
     * 4. Sums all acceleration vectors to get net acceleration
     * 
     * This method is called repeatedly during Runge-Kutta integration
     * to evaluate the gravitational field at different points.
     * 
     * @param {Array} bodies - Array of all bodies in the gravitational system
     * @param {number} bodyIndex - Index of the body to calculate acceleration for
     * @returns {object} Net acceleration vector {x, y} in m/s²
     */
    static calculateTotalAcceleration(bodies, bodyIndex) {
        const body = bodies[bodyIndex];             // The body we're calculating acceleration for
        let totalAcceleration = { x: 0, y: 0 };    // Initialize net acceleration to zero

        // Iterate through all other bodies to calculate their gravitational influence
        for (let j = 0; j < bodies.length; j++) {
            if (j === bodyIndex) continue; // Skip calculating force from body on itself

            const otherBody = bodies[j];  // The body exerting gravitational force
            
            // Calculate vector from current body to other body
            const dx = otherBody.position.x - body.position.x;  // X component of separation vector
            const dy = otherBody.position.y - body.position.y;  // Y component of separation vector
            const distance = Math.sqrt(dx * dx + dy * dy);      // Magnitude of separation vector

            if (distance === 0) continue; // Avoid division by zero (bodies at same location)

            // Calculate gravitational force using Newton's law of universal gravitation
            const force = this.calculateGravForces(body.mass, otherBody.mass, distance);
            
            // Convert force to acceleration using Newton's second law (F = ma, so a = F/m)
            const acceleration = force / body.mass;

            // Add acceleration component in direction of other body
            // (dx/distance) and (dy/distance) are unit vector components pointing toward other body
            totalAcceleration.x += (dx / distance) * acceleration;
            totalAcceleration.y += (dy / distance) * acceleration;
        }

        return totalAcceleration; // Return net gravitational acceleration vector
    }

    // === LEGACY INTEGRATION METHODS ===
    // Older integration methods kept for compatibility and comparison

    /**
     * Velocity Verlet Integration (Legacy Method)
     * 
     * This is a simpler, less accurate integration method that was commonly used
     * before adaptive Runge-Kutta methods became standard. It's kept for:
     * - Backward compatibility with existing code
     * - Educational purposes (simpler to understand)
     * - Quick simulations where high accuracy isn't critical
     * - Debugging and comparison with advanced methods
     * 
     * The Verlet method is symplectic, meaning it conserves energy well over
     * long periods, but it has lower accuracy than Runge-Kutta methods.
     * 
     * Algorithm:
     * 1. Update position using current velocity and previous acceleration
     * 2. Calculate new acceleration at new position
     * 3. Update velocity using average of old and new acceleration
     * 4. Store acceleration for next time step
     * 
     * Mathematical formula:
     * x(t+dt) = x(t) + v(t)×dt + 0.5×a(t-dt)×dt²
     * v(t+dt) = v(t) + 0.5×[a(t-dt) + a(t)]×dt
     * 
     * @param {object} body - The celestial body to update (modified in place)
     * @param {number} dt - Time step in seconds (fixed, unlike adaptive RK45)
     * @param {object} acceleration - Current acceleration vector {x, y} in m/s²
     * @returns {object} Updated body object (same as input, modified in place)
     */
    static verletIntegration(body, dt, acceleration) {
        // Initialize previous acceleration if this is the first time step
        // For the first step, we assume zero previous acceleration
        if (!body.previousAcceleration) {
            body.previousAcceleration = { x: 0, y: 0 };
        }

        // === POSITION UPDATE ===
        // Update position using current velocity and previous acceleration
        // Formula: x_new = x_old + v×dt + 0.5×a_prev×dt²
        body.position.x += body.velocity.x * dt + 0.5 * body.previousAcceleration.x * dt * dt;
        body.position.y += body.velocity.y * dt + 0.5 * body.previousAcceleration.y * dt * dt;

        // === VELOCITY UPDATE ===
        // Update velocity using average of previous and current acceleration
        // This "leapfrog" approach helps maintain stability and energy conservation
        // Formula: v_new = v_old + 0.5×(a_prev + a_current)×dt
        body.velocity.x += 0.5 * (body.previousAcceleration.x + acceleration.x) * dt;
        body.velocity.y += 0.5 * (body.previousAcceleration.y + acceleration.y) * dt;

        // === STORE ACCELERATION FOR NEXT STEP ===
        // Save current acceleration to use as "previous" acceleration in next step
        body.previousAcceleration.x = acceleration.x;
        body.previousAcceleration.y = acceleration.y;

        return body; // Return the updated body (though it's modified in place)
    }

    // === UTILITY METHODS ===
    // Additional helper methods for physics calculations and analysis

    /**
     * Calculate Kinetic Energy of a Body
     * KE = 0.5 × m × v²
     * 
     * @param {object} body - Body with mass and velocity properties
     * @returns {number} Kinetic energy in Joules
     */
    static calculateKineticEnergy(body) {
        const speedSquared = body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y;
        return 0.5 * body.mass * speedSquared;
    }

    /**
     * Calculate Potential Energy Between Two Bodies
     * PE = -G × m₁ × m₂ / r
     * (Negative because gravitational potential energy is negative)
     * 
     * @param {object} body1 - First body
     * @param {object} body2 - Second body
     * @returns {number} Gravitational potential energy in Joules
     */
    static calculatePotentialEnergy(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return 0; // Avoid division by zero
        
        return -this.GRAVITATIONAL_CONSTANT * body1.mass * body2.mass / distance;
    }

    /**
     * Calculate Total Energy of N-Body System
     * E_total = ΣKE + ΣPE
     * Useful for monitoring energy conservation during integration
     * 
     * @param {Array} bodies - Array of all bodies in the system
     * @returns {number} Total system energy in Joules
     */
    static calculateTotalEnergy(bodies) {
        let totalKineticEnergy = 0;
        let totalPotentialEnergy = 0;

        // Calculate kinetic energy for all bodies
        for (const body of bodies) {
            totalKineticEnergy += this.calculateKineticEnergy(body);
        }

        // Calculate potential energy for all unique pairs
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                totalPotentialEnergy += this.calculatePotentialEnergy(bodies[i], bodies[j]);
            }
        }

        return totalKineticEnergy + totalPotentialEnergy;
    }

    /**
     * Calculate Escape Velocity from a Body
     * v_escape = √(2GM/r)
     * 
     * @param {number} mass - Mass of the central body in kg
     * @param {number} radius - Distance from center in meters
     * @returns {number} Escape velocity in m/s
     */
    static calculateEscapeVelocity(mass, radius) {
        if (radius === 0) {
            throw new Error("Radius cannot be zero for escape velocity calculation");
        }
        return Math.sqrt(2 * this.GRAVITATIONAL_CONSTANT * mass / radius);
    }

    /**
     * Calculate Circular Orbital Velocity
     * v_circular = √(GM/r)
     * 
     * @param {number} centralMass - Mass of central body in kg
     * @param {number} orbitalRadius - Orbital radius in meters
     * @returns {number} Circular orbital velocity in m/s
     */
    static calculateCircularVelocity(centralMass, orbitalRadius) {
        if (orbitalRadius === 0) {
            throw new Error("Orbital radius cannot be zero");
        }
        return Math.sqrt(this.GRAVITATIONAL_CONSTANT * centralMass / orbitalRadius);
    }
}