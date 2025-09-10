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
        this.n = Math.sqrt(KeplerianOrbit.GM_SUN / (this.a * this.a * this.a));
    }

    // Gravitational parameter for the Sun
    static GM_SUN = 1.32712440018e20; // m^3/s^2
    static AU = 149597870700; // meters

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
        const h = Math.sqrt(KeplerianOrbit.GM_SUN * this.a * (1 - this.e * this.e)); // Specific angular momentum
        const vx_orbital = -(KeplerianOrbit.GM_SUN / h) * Math.sin(trueAnomaly + this.omega);
        const vy_orbital = (KeplerianOrbit.GM_SUN / h) * (this.e + Math.cos(trueAnomaly + this.omega));
        
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
        this.n = Math.sqrt(KeplerianOrbit.GM_SUN / (this.a * this.a * this.a));
        
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
     * Create planetary system with NASA JPL Horizons data
     */
    static createSolarSystem() {
        const bodies = [];
        
        // Sun at origin
        const sun = new KeplerianBody('Sun', 1.9884e30, 695700, 'yellow', null);
        sun.position = { x: 0, y: 0 };
        sun.velocity = { x: 0, y: 0 };
        bodies.push(sun);
        
        // Mercury - Real orbital elements (from NASA data)
        const mercuryOrbit = new KeplerianOrbit(
            0.387 * KeplerianOrbit.AU,  // Semi-major axis
            0.206,                      // Eccentricity
            Math.random() * 2 * Math.PI, // Random starting position
            0.5 * Math.PI               // Argument of periapsis (90 degrees)
        );
        bodies.push(new KeplerianBody('Mercury', 3.302e23, 2439.4, 'gray', mercuryOrbit));
        
        // Venus
        const venusOrbit = new KeplerianOrbit(
            0.723 * KeplerianOrbit.AU,
            0.007,
            Math.random() * 2 * Math.PI,
            0.9 * Math.PI
        );
        bodies.push(new KeplerianBody('Venus', 4.8685e24, 6051.84, 'orange', venusOrbit));
        
        // Earth
        const earthOrbit = new KeplerianOrbit(
            1.000 * KeplerianOrbit.AU,
            0.017,
            Math.random() * 2 * Math.PI,
            1.8 * Math.PI
        );
        bodies.push(new KeplerianBody('Earth', 5.97219e24, 6371.01, 'blue', earthOrbit));
        
        // Mars
        const marsOrbit = new KeplerianOrbit(
            1.524 * KeplerianOrbit.AU,
            0.093,
            Math.random() * 2 * Math.PI,
            0.4 * Math.PI
        );
        bodies.push(new KeplerianBody('Mars', 6.4171e23, 3389.92, 'red', marsOrbit));
        
        // Jupiter - From NASA JPL Horizons data
        const jupiterOrbit = new KeplerianOrbit(
            5.203 * KeplerianOrbit.AU,  // Semi-major axis
            0.048,                      // Eccentricity
            Math.random() * 2 * Math.PI,
            0.3 * Math.PI
        );
        bodies.push(new KeplerianBody('Jupiter', 1.89819e27, 69911, '#DAA520', jupiterOrbit)); // Dark golden rod
        
        // Saturn
        const saturnOrbit = new KeplerianOrbit(
            9.537 * KeplerianOrbit.AU,
            0.054,
            Math.random() * 2 * Math.PI,
            1.9 * Math.PI
        );
        bodies.push(new KeplerianBody('Saturn', 5.6834e26, 58232, '#FAD5A5', saturnOrbit)); // Wheat color
        
        // Uranus
        const uranusOrbit = new KeplerianOrbit(
            19.19 * KeplerianOrbit.AU,
            0.047,
            Math.random() * 2 * Math.PI,
            1.7 * Math.PI
        );
        bodies.push(new KeplerianBody('Uranus', 8.6813e25, 25362, '#4FD0E3', uranusOrbit)); // Cyan
        
        // Neptune
        const neptuneOrbit = new KeplerianOrbit(
            30.07 * KeplerianOrbit.AU,
            0.009,
            Math.random() * 2 * Math.PI,
            0.5 * Math.PI
        );
        bodies.push(new KeplerianBody('Neptune', 1.02409e26, 24624, '#4169E1', neptuneOrbit)); // Royal blue
        
        return bodies;
    }

    /**
     * Calculate perturbations between planets (optional, for advanced realism)
     */
    static calculatePerturbations(bodies, currentTime, perturbationStrength = 1e-15) {
        // Only apply perturbations to inner planets from outer planets
        for (let i = 1; i < Math.min(5, bodies.length); i++) { // Inner planets only
            for (let j = 5; j < bodies.length; j++) { // Outer planets only
                if (i === j) continue;
                
                const innerPlanet = bodies[i];
                const outerPlanet = bodies[j];
                
                const dx = outerPlanet.position.x - innerPlanet.position.x;
                const dy = outerPlanet.position.y - innerPlanet.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && innerPlanet.orbit) {
                    // Calculate small perturbation to orbital elements
                    const perturbationMagnitude = perturbationStrength * outerPlanet.mass / (distance * distance);
                    
                    // Apply very small changes to orbital elements
                    innerPlanet.orbit.applyPerturbation(
                        perturbationMagnitude * 1e6,     // Small change to semi-major axis
                        perturbationMagnitude * 1e-7,    // Small change to eccentricity
                        perturbationMagnitude * 1e-4     // Small change to mean anomaly
                    );
                }
            }
        }
    }
}