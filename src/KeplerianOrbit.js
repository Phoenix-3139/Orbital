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
     * Calculate position and velocity at given time
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
        
        // Position in orbital plane
        const cosNu = Math.cos(trueAnomaly);
        const sinNu = Math.sin(trueAnomaly);
        
        const x_orbital = r * cosNu;
        const y_orbital = r * sinNu;
        
        // Velocity in orbital plane
        const h = Math.sqrt(KeplerianOrbit.GM_SUN * this.a * (1 - this.e * this.e)); // Specific angular momentum
        const vx_orbital = -(KeplerianOrbit.GM_SUN / h) * sinNu;
        const vy_orbital = (KeplerianOrbit.GM_SUN / h) * (this.e + cosNu);
        
        // Transform to 3D coordinates using rotation matrices
        const position = this.rotateFromOrbitalPlane(x_orbital, y_orbital, 0);
        const velocity = this.rotateFromOrbitalPlane(vx_orbital, vy_orbital, 0);
        
        return {
            position: position,
            velocity: velocity,
            trueAnomaly: trueAnomaly,
            distance: r
        };
    }

    /**
     * Rotate coordinates from orbital plane to reference frame
     */
    rotateFromOrbitalPlane(x, y, z) {
        // Rotation sequence: Z(Omega) * X(i) * Z(omega)
        const cosOmega = Math.cos(this.Omega);
        const sinOmega = Math.sin(this.Omega);
        const cosi = Math.cos(this.i);
        const sini = Math.sin(this.i);
        const cosomega = Math.cos(this.omega);
        const sinomega = Math.sin(this.omega);
        
        // Combined rotation matrix elements
        const r11 = cosOmega * cosomega - sinOmega * sinomega * cosi;
        const r12 = -cosOmega * sinomega - sinOmega * cosomega * cosi;
        const r13 = sinOmega * sini;
        
        const r21 = sinOmega * cosomega + cosOmega * sinomega * cosi;
        const r22 = -sinOmega * sinomega + cosOmega * cosomega * cosi;
        const r23 = -cosOmega * sini;
        
        const r31 = sinomega * sini;
        const r32 = cosomega * sini;
        const r33 = cosi;
        
        return {
            x: r11 * x + r12 * y + r13 * z,
            y: r21 * x + r22 * y + r23 * z,
            z: r31 * x + r32 * y + r33 * z
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
     * Create planetary system with real orbital data
     */
    static createSolarSystem() {
        const bodies = [];
        
        // Sun at origin
        const sun = new KeplerianBody('Sun', 1.9884e30, 695700, 'yellow', null);
        sun.position = { x: 0, y: 0 };
        sun.velocity = { x: 0, y: 0 };
        bodies.push(sun);
        
        // Mercury - Real orbital elements
        const mercuryOrbit = new KeplerianOrbit(
            0.387 * KeplerianOrbit.AU,  // Semi-major axis
            0.206,                      // Eccentricity
            Math.random() * 2 * Math.PI // Random starting position
        );
        bodies.push(new KeplerianBody('Mercury', 3.302e23, 2439.4, 'gray', mercuryOrbit));
        
        // Venus
        const venusOrbit = new KeplerianOrbit(
            0.723 * KeplerianOrbit.AU,
            0.007,
            Math.random() * 2 * Math.PI
        );
        bodies.push(new KeplerianBody('Venus', 4.8685e24, 6051.84, 'orange', venusOrbit));
        
        // Earth
        const earthOrbit = new KeplerianOrbit(
            1.000 * KeplerianOrbit.AU,
            0.017,
            Math.random() * 2 * Math.PI
        );
        bodies.push(new KeplerianBody('Earth', 5.97219e24, 6371.01, 'blue', earthOrbit));
        
        // Mars
        const marsOrbit = new KeplerianOrbit(
            1.524 * KeplerianOrbit.AU,
            0.093,
            Math.random() * 2 * Math.PI
        );
        bodies.push(new KeplerianBody('Mars', 6.4171e23, 3389.92, 'red', marsOrbit));
        
        return bodies;
    }

    /**
     * Calculate perturbations between planets (optional, for advanced realism)
     */
    static calculatePerturbations(bodies, currentTime, perturbationStrength = 1e-12) {
        for (let i = 1; i < bodies.length; i++) { // Skip Sun
            for (let j = 1; j < bodies.length; j++) {
                if (i === j) continue;
                
                const body1 = bodies[i];
                const body2 = bodies[j];
                
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0 && body1.orbit) {
                    // Calculate small perturbation to orbital elements
                    const perturbationMagnitude = perturbationStrength * body2.mass / (distance * distance);
                    
                    // Apply very small changes to orbital elements
                    body1.orbit.applyPerturbation(
                        perturbationMagnitude * Math.random() * 1e6,  // Small change to semi-major axis
                        perturbationMagnitude * Math.random() * 1e-6, // Small change to eccentricity
                        perturbationMagnitude * Math.random() * 1e-3  // Small change to mean anomaly
                    );
                }
            }
        }
    }
}