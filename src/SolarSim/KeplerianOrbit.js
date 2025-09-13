import { Body } from './body.js'; // Import Body class instead of BodyData

export class KeplerianOrbit {
    constructor(semiMajorAxis, eccentricity, meanAnomalyAtEpoch, argumentOfPeriapsis = 0, longitudeOfAscendingNode = 0, inclination = 0, epochTime = 0) {
        this.a = semiMajorAxis; // Semi-major axis (meters)
        this.e = eccentricity; // Eccentricity (0 = circle, <1 = ellipse)
        this.M0 = meanAnomalyAtEpoch; // Mean anomaly at epoch (radians)
        this.omega = argumentOfPeriapsis; // Argument of periapsis (radians)
        this.Omega = longitudeOfAscendingNode; // Longitude of ascending node (radians)
        this.i = inclination; // Inclination (radians)
        this.t0 = epochTime; // Epoch time (seconds)
        
        // Calculate mean motion using Kepler's Third Law: n = sqrt(GM/a^3)
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
    }

    /**
     * Solve Kepler's equation using Newton-Raphson iteration
     * E - e*sin(E) = M
     */
    solveKeplersEquation(meanAnomaly, eccentricity, tolerance = 1e-12) {
        let E = meanAnomaly; // Initial guess
        let iteration = 0;
        const maxIterations = 50;

        while (iteration < maxIterations) {
            const f = E - eccentricity * Math.sin(E) - meanAnomaly;
            const df = 1 - eccentricity * Math.cos(E);
            
            const deltaE = f / df;
            E -= deltaE;
            
            if (Math.abs(deltaE) < tolerance) {
                break;
            }
            iteration++;
        }
        
        return E;
    }

    /**
     * Calculate position and velocity at given time (simplified 2D version)
     */
    getStateAtTime(currentTime) {
        // Calculate mean anomaly at current time
        const deltaTime = currentTime - this.t0;
        const meanAnomaly = this.M0 + this.n * deltaTime;
        
        // Solve Kepler's equation for eccentric anomaly
        const eccentricAnomaly = this.solveKeplersEquation(meanAnomaly, this.e);
        
        // Calculate true anomaly
        const cosE = Math.cos(eccentricAnomaly);
        const sinE = Math.sin(eccentricAnomaly);
        const beta = Math.sqrt(1 - this.e * this.e);
        
        const trueAnomaly = Math.atan2(beta * sinE, cosE - this.e);
        
        // Calculate distance from focus
        const r = this.a * (1 - this.e * cosE);
        
        // Position in orbital plane (2D simplification)
        const cosNu = Math.cos(trueAnomaly + this.omega); // Include argument of periapsis
        const sinNu = Math.sin(trueAnomaly + this.omega);
        
        const x_orbital = r * cosNu;
        const y_orbital = r * sinNu;
        
        // Velocity in orbital plane (simplified)
        const h = Math.sqrt(Body.GM_SUN * this.a * (1 - this.e * this.e)); // Specific angular momentum
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
     * Get orbital period in seconds
     */
    getOrbitalPeriod() {
        return 2 * Math.PI / this.n;
    }

    /**
     * Apply small perturbations to orbital elements
     */
    applyPerturbation(deltaSemiMajorAxis, deltaEccentricity, deltaMeanAnomaly, deltaArgumentOfPeriapsis = 0) {
        this.a += deltaSemiMajorAxis;
        this.e += deltaEccentricity;
        this.M0 += deltaMeanAnomaly;
        this.omega += deltaArgumentOfPeriapsis;
        
        // Recalculate mean motion
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
        
        // Keep eccentricity in valid range
        this.e = Math.max(0, Math.min(0.99, this.e));
    }
}

export class KeplerianBody {
    constructor(name, mass, radius, color, orbit) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.color = color;
        this.orbit = orbit;
        this.trail = [];
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
    }

    getAtmosphereDensity(altitude) {
        // Get atmosphere data from Body.planetData
        const bodyData = Object.values(Body.planetData).find(data => data.name === this.name);
        if (!bodyData?.atmosphere?.layers) return 0;

        const layers = bodyData.atmosphere.layers;
        for (let i = 0; i < layers.length - 1; i++) {
            const layer = layers[i];
            const nextLayer = layers[i + 1];
            if (altitude >= layer.height && altitude < nextLayer.height) {
                const t = (altitude - layer.height) / (nextLayer.height - layer.height);
                return layer.density * (1 - t) + nextLayer.density * t;
            }
        }
        
        const lastLayer = layers[layers.length - 1];
        return altitude >= lastLayer.height ? 0 : lastLayer.density;
    }

    /**
     * Update position based on current time
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
     * Add current position to trail
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
     * Get the orbital period of the body
     */
    getOrbitalPeriod() {
        return this.orbit ? this.orbit.getOrbitalPeriod() : null;
    }

    /**
     * Get the current distance from the focus (e.g., the Sun)
     */
    getDistanceFromFocus() {
        return this.distance || 0;
    }

    /**
     * Get the current true anomaly of the body
     */
    getTrueAnomaly() {
        return this.trueAnomaly || 0;
    }

    /**
     * Get the display radius for visualization
     */
    getDisplayRadius() {
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    // Legacy methods for compatibility
    getMass() { return this.mass; }
    getPosition() { return this.position; }
    getVelocity() { return this.velocity; }
}

export class PlanetarySystem {
    /**
     * Create planetary system using data from body.js
     */
    static createSolarSystem() {
        const bodies = [];

        // Iterate through the planet data in Body.planetData
        for (const [key, planetData] of Object.entries(Body.planetData)) {
            const orbitData = planetData.orbit;

            // If the planet has orbital data, create a KeplerianOrbit
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

            // Create a KeplerianBody for the planet
            const body = new KeplerianBody(
                planetData.name,
                planetData.mass,
                planetData.radius,
                planetData.color,
                orbit
            );

            // Add the body to the list of bodies
            bodies.push(body);
        }

        return bodies;
    }
}