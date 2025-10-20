/**
 * ORBITAL MECHANICS - SIMPLIFIED
 * 
 * This file calculates where planets are at any given time.
 * It uses Kepler's laws (elliptical orbits).
 */

import { Body } from '../Data/body.js';

// ============================================
// PART 1: THE ORBIT CLASS
// Stores the shape and timing of an orbit
// ============================================
export class Orbit {
    constructor(orbitData, gravitationalParameter = Body.GM_SUN) {
        // Orbit shape (how stretched/tilted the ellipse is)
        this.semiMajorAxis = orbitData.semiMajorAxis;  // Size of orbit
        this.eccentricity = orbitData.eccentricity;    // How elliptical (0=circle, 0.9=very stretched)
        
        // Orbit orientation (which way it's tilted/rotated)
        this.inclination = orbitData.inclination || 0;
        this.longitudeOfAscendingNode = orbitData.longitudeOfAscendingNode || 0;
        this.argumentOfPeriapsis = orbitData.argumentOfPeriapsis || 0;
        
        // Orbit timing (where the planet starts)
        this.meanAnomalyAtEpoch = orbitData.meanAnomalyAtEpoch || 0;
        this.epochTime = orbitData.epochTime || 0;
        
        // Physics constant (bigger = faster orbit)
        this.GM = gravitationalParameter;
        
        // Calculate how fast the planet moves (radians per second)
        this.meanMotion = Math.sqrt(this.GM / (this.semiMajorAxis ** 3));
        
        // Remember what this orbits around
        this.centralBody = orbitData.centralBody;
    }

    // Calculate position at a specific time
    getPositionAtTime(currentTime) {
        // Step 1: How much time has passed?
        const timeSinceEpoch = currentTime - this.epochTime;
        
        // Step 2: Where SHOULD the planet be? (mean anomaly)
        const meanAnomaly = this.meanAnomalyAtEpoch + this.meanMotion * timeSinceEpoch;
        
        // Step 3: Solve Kepler's equation (where IS the planet?)
        const eccentricAnomaly = this.solveKeplersEquation(meanAnomaly);
        
        // Step 4: Convert to actual angle (true anomaly)
        const trueAnomaly = this.eccentricToTrue(eccentricAnomaly);
        
        // Step 5: Calculate distance from center
        const distance = this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));
        
        // Step 6: Calculate x, y position
        const angle = trueAnomaly + this.argumentOfPeriapsis;
        const x = distance * Math.cos(angle);
        const y = distance * Math.sin(angle);
        
        return { x, y, distance, trueAnomaly };
    }

    // Solve Kepler's equation using iteration
    // (This is the tricky math part - converts time to position)
    solveKeplersEquation(meanAnomaly) {
        let eccentricAnomaly = meanAnomaly;  // Initial guess
        
        // Iterate 10 times to get close enough
        for (let i = 0; i < 10; i++) {
            const error = eccentricAnomaly - this.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
            const derivative = 1 - this.eccentricity * Math.cos(eccentricAnomaly);
            eccentricAnomaly = eccentricAnomaly - error / derivative;
        }
        
        return eccentricAnomaly;
    }

    // Convert eccentric anomaly to true anomaly
    eccentricToTrue(eccentricAnomaly) {
        const cosE = Math.cos(eccentricAnomaly);
        const sinE = Math.sin(eccentricAnomaly);
        const sqrtTerm = Math.sqrt(1 - this.eccentricity * this.eccentricity);
        return Math.atan2(sqrtTerm * sinE, cosE - this.eccentricity);
    }

    // How long does one orbit take? (in seconds)
    getOrbitalPeriod() {
        return (2 * Math.PI) / this.meanMotion;
    }
}

// ============================================
// PART 2: THE CELESTIAL BODY CLASS
// A planet/moon with position, velocity, trail
// ============================================
export class CelestialBody {
    constructor(name, mass, radius, color, orbit) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.orbit = orbit;  // Can be null for Sun
        
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.trail = [];
    }

    // Update position based on current simulation time
    updatePosition(currentTime) {
        if (!this.orbit) {
            return; // Sun doesn't move
        }
        
        const state = this.orbit.getPositionAtTime(currentTime);
        this.position.x = state.x;
        this.position.y = state.y;
    }

    // Add current position to trail
    addToTrail(maxTrailLength = 2000) {
        this.trail.push({ x: this.position.x, y: this.position.y });
        
        // Keep trail from getting too long
        if (this.trail.length > maxTrailLength) {
            this.trail.shift(); // Remove oldest point
        }
    }

    // How long is one orbit?
    getOrbitalPeriod() {
        return this.orbit ? this.orbit.getOrbitalPeriod() : null;
    }
}

// ============================================
// PART 3: SOLAR SYSTEM FACTORY
// Creates all planets from the data
// ============================================
export class SolarSystem {
    static createAllBodies() {
        const bodies = [];

        // Loop through all planets in our data
        for (const [key, planetData] of Object.entries(Body.planetData)) {
            
            // Skip Sun (it doesn't have an orbit)
            if (!planetData.orbit) {
                const sun = new CelestialBody(
                    planetData.name,
                    planetData.mass,
                    planetData.radius,
                    planetData.color,
                    null  // No orbit
                );
                sun.position = { x: 0, y: 0 };  // Sun at center
                bodies.push(sun);
                continue;
            }

            // Get the right gravity constant
            const GM = Body.getGravitationalParameter(key);

            // Create the orbit
            const orbit = new Orbit(planetData.orbit, GM);

            // Create the body
            const body = new CelestialBody(
                planetData.name,
                planetData.mass,
                planetData.radius,
                planetData.color,
                orbit
            );

            bodies.push(body);
        }

        return bodies;
    }
}