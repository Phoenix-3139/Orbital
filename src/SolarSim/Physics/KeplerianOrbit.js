/**
 * Keplerian Orbital Mechanics System
 * 
 * Implements precise orbital mechanics based on Kepler's laws of planetary motion.
 * Provides accurate orbital position and velocity calculations using classical
 * orbital elements (Keplerian elements).
 */

import { Body } from '../Data/body.js';

/**
 * KeplerianOrbit Class
 * Represents a single orbital trajectory using classical Keplerian elements.
 */
export class KeplerianOrbit {
    /**
     * Constructor - Initialize orbital elements
     */
    constructor(semiMajorAxis, eccentricity, meanAnomalyAtEpoch, argumentOfPeriapsis = 0, longitudeOfAscendingNode = 0, inclination = 0, epochTime = 0) {
        this.a = semiMajorAxis;              // Semi-major axis in meters
        this.e = eccentricity;               // Eccentricity (0=circle, <1=ellipse)
        this.M0 = meanAnomalyAtEpoch;        // Mean anomaly at epoch in radians
        this.omega = argumentOfPeriapsis;    // Argument of periapsis in radians
        this.Omega = longitudeOfAscendingNode; // Longitude of ascending node in radians
        this.i = inclination;                // Inclination in radians
        this.t0 = epochTime;                 // Epoch time in seconds
        
        // Calculate mean motion using Kepler's Third Law: n = √(GM/a³)
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
    }

    /**
     * Solve Kepler's Equation using Newton-Raphson Iteration
     * Kepler's equation: E - e·sin(E) = M
     */
    solveKeplersEquation(meanAnomaly, eccentricity, tolerance = 1e-12) {
        let E = meanAnomaly;
        let iteration = 0;
        const maxIterations = 50;

        while (iteration < maxIterations) {
            const f = E - eccentricity * Math.sin(E) - meanAnomaly;
            const df = 1 - eccentricity * Math.cos(E);
            const deltaE = f / df;
            E -= deltaE;
            
            if (Math.abs(deltaE) < tolerance) break;
            iteration++;
        }
        
        return E;
    }

    /**
     * Calculate Position and Velocity at Given Time
     */
    getStateAtTime(currentTime) {
        // Calculate mean anomaly at current time
        const deltaTime = currentTime - this.t0;
        const meanAnomaly = this.M0 + this.n * deltaTime;
        
        // Solve Kepler's equation for eccentric anomaly
        const eccentricAnomaly = this.solveKeplersEquation(meanAnomaly, this.e);
        
        // Calculate true anomaly from eccentric anomaly
        const cosE = Math.cos(eccentricAnomaly);
        const sinE = Math.sin(eccentricAnomaly);
        const beta = Math.sqrt(1 - this.e * this.e);
        const trueAnomaly = Math.atan2(beta * sinE, cosE - this.e);
        
        // Calculate distance from focus (Sun)
        const r = this.a * (1 - this.e * cosE);
        
        // Calculate position in orbital plane
        const cosNu = Math.cos(trueAnomaly + this.omega);
        const sinNu = Math.sin(trueAnomaly + this.omega);
        const x_orbital = r * cosNu;
        const y_orbital = r * sinNu;
        
        // Calculate velocity in orbital plane
        const h = Math.sqrt(Body.GM_SUN * this.a * (1 - this.e * this.e));
        const vx_orbital = -(Body.GM_SUN / h) * Math.sin(trueAnomaly + this.omega);
        const vy_orbital = (Body.GM_SUN / h) * (this.e + Math.cos(trueAnomaly + this.omega));
        
        return {
            position: { x: x_orbital, y: y_orbital },
            velocity: { x: vx_orbital, y: vy_orbital },
            trueAnomaly: trueAnomaly,
            distance: r
        };
    }

    /**
     * Get Orbital Period in Seconds
     */
    getOrbitalPeriod() {
        return 2 * Math.PI / this.n;
    }

    /**
     * Apply Small Perturbations to Orbital Elements
     */
    applyPerturbation(deltaSemiMajorAxis, deltaEccentricity, deltaMeanAnomaly, deltaArgumentOfPeriapsis = 0) {
        this.a += deltaSemiMajorAxis;
        this.e += deltaEccentricity;
        this.M0 += deltaMeanAnomaly;
        this.omega += deltaArgumentOfPeriapsis;
        
        // Recalculate mean motion after semi-major axis change
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
        
        // Keep eccentricity in valid range [0, 0.99]
        this.e = Math.max(0, Math.min(0.99, this.e));
    }
}

/**
 * KeplerianBody Class
 * Represents a celestial body with Keplerian orbital mechanics.
 */
export class KeplerianBody {
    constructor(name, mass, radius, color, orbit) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.orbit = orbit;
        
        // Dynamic state variables
        this.trail = [];
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.trueAnomaly = 0;
        this.distance = 0;
    }

    /**
     * Get radius information for rendering
     */
    getRadiusInMeters() {
        return this.radius * 1000;
    }

    getWorldRadius() {
        return this.getRadiusInMeters();
    }

    getDisplayRadius() {
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    /**
     * Update Position Based on Current Time
     */
    updatePosition(currentTime) {
        if (this.orbit) {
            const state = this.orbit.getStateAtTime(currentTime);
            this.position = { x: state.position.x, y: state.position.y };
            this.velocity = { x: state.velocity.x, y: state.velocity.y };
            this.trueAnomaly = state.trueAnomaly;
            this.distance = state.distance;
        }
    }

    /**
     * Add Current Position to Orbital Trail
     */
    addToTrail(maxTrailLength = 2000) {
        if (this.name !== 'Sun') {
            this.trail.push({ x: this.position.x, y: this.position.y });
            if (this.trail.length > maxTrailLength) {
                this.trail.shift();
            }
        }
    }

    /**
     * Get orbital analysis data
     */
    getOrbitalPeriod() {
        return this.orbit ? this.orbit.getOrbitalPeriod() : null;
    }

    getDistanceFromFocus() {
        return this.distance || 0;
    }

    getTrueAnomaly() {
        return this.trueAnomaly || 0;
    }

    getOrbitalSpeed() {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    getDistanceFrom(otherBody) {
        const dx = this.position.x - otherBody.position.x;
        const dy = this.position.y - otherBody.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * PlanetarySystem Class
 * Factory class for creating complete solar system simulations.
 */
export class PlanetarySystem {
    static createSolarSystem() {
        const bodies = [];

        for (const [key, planetData] of Object.entries(Body.planetData)) {
            const orbitData = planetData.orbit;

            const orbit = orbitData
                ? new KeplerianOrbit(
                      orbitData.semiMajorAxis,
                      orbitData.eccentricity,
                      orbitData.meanAnomalyAtEpoch,
                      orbitData.argumentOfPeriapsis,
                      orbitData.longitudeOfAscendingNode,
                      orbitData.inclination,
                      orbitData.epochTime
                  )
                : null;

            const body = new KeplerianBody(
                planetData.name,
                planetData.mass,
                planetData.radius,
                planetData.color,
                orbit
            );

            bodies.push(body);
        }

        console.log(`Created solar system with ${bodies.length} bodies`);
        return bodies;
    }

    static createInnerSolarSystem() {
        const innerPlanets = ['sun', 'mercury', 'venus', 'earth', 'mars'];
        const bodies = [];

        for (const planetKey of innerPlanets) {
            const planetData = Body.planetData[planetKey];
            if (!planetData) continue;

            const orbitData = planetData.orbit;
            const orbit = orbitData
                ? new KeplerianOrbit(
                      orbitData.semiMajorAxis,
                      orbitData.eccentricity,
                      orbitData.meanAnomalyAtEpoch,
                      orbitData.argumentOfPeriapsis,
                      orbitData.longitudeOfAscendingNode,
                      orbitData.inclination,
                      orbitData.epochTime
                  )
                : null;

            const body = new KeplerianBody(
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