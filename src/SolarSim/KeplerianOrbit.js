/**
 * Keplerian Orbital Mechanics System
 * 
 * This module implements precise orbital mechanics based on Kepler's laws of planetary motion.
 * It provides:
 * - Accurate orbital position and velocity calculations
 * - Real-time orbit propagation using Keplerian elements
 * - Solar system body creation with realistic orbital parameters
 * - Support for orbital perturbations and dynamical evolution
 * 
 * The system uses classical orbital elements (Keplerian elements) to describe
 * the motion of celestial bodies in elliptical orbits around the Sun.
 * 
 * Mathematical Foundation:
 * - Kepler's Laws of Planetary Motion
 * - Newton's Law of Universal Gravitation
 * - Classical orbital mechanics theory
 * - Numerical methods for solving transcendental equations
 */

// Import the Body class for planetary data and physical constants
import { Body } from './body.js';

/**
 * KeplerianOrbit Class
 * 
 * Represents a single orbital trajectory using classical Keplerian elements.
 * This class encapsulates all the mathematics needed to compute the position
 * and velocity of an orbiting body at any given time.
 */
export class KeplerianOrbit {
    /**
     * Constructor - Initialize orbital elements
     * 
     * @param {number} semiMajorAxis - Semi-major axis in meters (a)
     * @param {number} eccentricity - Orbital eccentricity (e), 0=circle, <1=ellipse
     * @param {number} meanAnomalyAtEpoch - Mean anomaly at epoch in radians (M₀)
     * @param {number} argumentOfPeriapsis - Argument of periapsis in radians (ω)
     * @param {number} longitudeOfAscendingNode - Longitude of ascending node in radians (Ω)
     * @param {number} inclination - Orbital inclination in radians (i)
     * @param {number} epochTime - Reference epoch time in seconds (t₀)
     */
    constructor(semiMajorAxis, eccentricity, meanAnomalyAtEpoch, argumentOfPeriapsis = 0, longitudeOfAscendingNode = 0, inclination = 0, epochTime = 0) {
        // Store the six classical orbital elements that completely define an orbit
        this.a = semiMajorAxis;              // Semi-major axis (a) - size of the orbit in meters
        this.e = eccentricity;               // Eccentricity (e) - shape of the orbit (0=circle, >0=ellipse)
        this.M0 = meanAnomalyAtEpoch;        // Mean anomaly at epoch (M₀) - position at reference time
        this.omega = argumentOfPeriapsis;    // Argument of periapsis (ω) - orientation of ellipse in orbital plane
        this.Omega = longitudeOfAscendingNode; // Longitude of ascending node (Ω) - orientation of orbital plane
        this.i = inclination;                // Inclination (i) - tilt of orbital plane relative to reference
        this.t0 = epochTime;                 // Epoch time (t₀) - reference time for mean anomaly
        
        // Calculate mean motion (n) using Kepler's Third Law
        // n = √(GM/a³) where G is gravitational constant, M is central mass, a is semi-major axis
        // This tells us how fast the body moves around its orbit (radians per second)
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
    }

    /**
     * Solve Kepler's Equation using Newton-Raphson Iteration
     * 
     * Kepler's equation: E - e·sin(E) = M
     * Where: E = eccentric anomaly, e = eccentricity, M = mean anomaly
     * 
     * This is a transcendental equation that cannot be solved analytically,
     * so we use numerical iteration to find the eccentric anomaly E.
     * 
     * @param {number} meanAnomaly - Mean anomaly M in radians
     * @param {number} eccentricity - Orbital eccentricity e
     * @param {number} tolerance - Convergence tolerance (default: 1e-12)
     * @returns {number} Eccentric anomaly E in radians
     */
    solveKeplersEquation(meanAnomaly, eccentricity, tolerance = 1e-12) {
        // Initial guess for eccentric anomaly - use mean anomaly as starting point
        let E = meanAnomaly;
        
        // Iteration counter and maximum iterations to prevent infinite loops
        let iteration = 0;
        const maxIterations = 50;

        // Newton-Raphson iteration loop
        while (iteration < maxIterations) {
            // Calculate function value: f(E) = E - e·sin(E) - M
            // When f(E) = 0, we have solved Kepler's equation
            const f = E - eccentricity * Math.sin(E) - meanAnomaly;
            
            // Calculate derivative: f'(E) = 1 - e·cos(E)
            // This is needed for Newton-Raphson method
            const df = 1 - eccentricity * Math.cos(E);
            
            // Newton-Raphson update: E_new = E_old - f(E)/f'(E)
            const deltaE = f / df;
            E -= deltaE;
            
            // Check for convergence - if change is smaller than tolerance, we're done
            if (Math.abs(deltaE) < tolerance) {
                break; // Solution found with sufficient accuracy
            }
            iteration++;
        }
        
        // Return the eccentric anomaly (should be accurate to tolerance)
        return E;
    }

    /**
     * Calculate Position and Velocity at Given Time
     * 
     * This is the core orbital mechanics calculation that transforms
     * Keplerian elements into Cartesian position and velocity vectors.
     * 
     * The calculation follows these steps:
     * 1. Compute mean anomaly at current time using mean motion
     * 2. Solve Kepler's equation for eccentric anomaly
     * 3. Calculate true anomaly from eccentric anomaly
     * 4. Compute distance and position in orbital plane
     * 5. Calculate velocity using conservation of energy and angular momentum
     * 
     * @param {number} currentTime - Current simulation time in seconds
     * @returns {object} State object containing position, velocity, and orbital parameters
     */
    getStateAtTime(currentTime) {
        // Step 1: Calculate mean anomaly at current time
        // Mean anomaly changes linearly with time: M = M₀ + n·(t - t₀)
        const deltaTime = currentTime - this.t0;          // Time since epoch
        const meanAnomaly = this.M0 + this.n * deltaTime;  // Mean anomaly at current time
        
        // Step 2: Solve Kepler's equation for eccentric anomaly
        // This is the computationally intensive part - solving transcendental equation
        const eccentricAnomaly = this.solveKeplersEquation(meanAnomaly, this.e);
        
        // Step 3: Calculate true anomaly from eccentric anomaly
        // True anomaly is the actual angle from periapsis to the body's current position
        const cosE = Math.cos(eccentricAnomaly);    // Cosine of eccentric anomaly
        const sinE = Math.sin(eccentricAnomaly);    // Sine of eccentric anomaly
        const beta = Math.sqrt(1 - this.e * this.e); // Helper term: √(1 - e²)
        
        // True anomaly formula: ν = atan2(β·sin(E), cos(E) - e)
        const trueAnomaly = Math.atan2(beta * sinE, cosE - this.e);
        
        // Step 4: Calculate distance from focus (Sun)
        // Distance formula: r = a·(1 - e·cos(E))
        const r = this.a * (1 - this.e * cosE);
        
        // Step 5: Calculate position in orbital plane (2D)
        // Include argument of periapsis to orient the ellipse correctly
        const cosNu = Math.cos(trueAnomaly + this.omega); // Cosine of oriented true anomaly
        const sinNu = Math.sin(trueAnomaly + this.omega); // Sine of oriented true anomaly
        
        // Position components in orbital plane
        const x_orbital = r * cosNu;  // X position in orbital plane
        const y_orbital = r * sinNu;  // Y position in orbital plane
        
        // Step 6: Calculate velocity in orbital plane
        // Use specific angular momentum: h = √(GM·a·(1-e²))
        const h = Math.sqrt(Body.GM_SUN * this.a * (1 - this.e * this.e));
        
        // Velocity components using orbital mechanics formulas
        const vx_orbital = -(Body.GM_SUN / h) * Math.sin(trueAnomaly + this.omega);
        const vy_orbital = (Body.GM_SUN / h) * (this.e + Math.cos(trueAnomaly + this.omega));
        
        // Return complete orbital state
        return {
            position: { x: x_orbital, y: y_orbital },  // Position vector in meters
            velocity: { x: vx_orbital, y: vy_orbital }, // Velocity vector in m/s
            trueAnomaly: trueAnomaly,                   // True anomaly in radians
            distance: r                                 // Distance from Sun in meters
        };
    }

    /**
     * Get Orbital Period in Seconds
     * 
     * Calculates the time it takes for one complete orbit using Kepler's Third Law.
     * Period = 2π/n where n is the mean motion.
     * 
     * @returns {number} Orbital period in seconds
     */
    getOrbitalPeriod() {
        // Period formula: T = 2π/n
        // This gives the time for one complete revolution around the Sun
        return 2 * Math.PI / this.n;
    }

    /**
     * Apply Small Perturbations to Orbital Elements
     * 
     * This method allows for dynamic evolution of orbits due to:
     * - Gravitational perturbations from other planets
     * - Non-gravitational forces (solar radiation pressure, etc.)
     * - Relativistic effects
     * - Atmospheric drag (for low orbits)
     * 
     * @param {number} deltaSemiMajorAxis - Change in semi-major axis (meters)
     * @param {number} deltaEccentricity - Change in eccentricity
     * @param {number} deltaMeanAnomaly - Change in mean anomaly (radians)
     * @param {number} deltaArgumentOfPeriapsis - Change in argument of periapsis (radians)
     */
    applyPerturbation(deltaSemiMajorAxis, deltaEccentricity, deltaMeanAnomaly, deltaArgumentOfPeriapsis = 0) {
        // Apply incremental changes to orbital elements
        this.a += deltaSemiMajorAxis;           // Modify orbit size
        this.e += deltaEccentricity;            // Modify orbit shape
        this.M0 += deltaMeanAnomaly;            // Modify orbital phase
        this.omega += deltaArgumentOfPeriapsis; // Modify orbit orientation
        
        // Recalculate mean motion after semi-major axis change
        // This is necessary because mean motion depends on orbital size
        this.n = Math.sqrt(Body.GM_SUN / (this.a * this.a * this.a));
        
        // Keep eccentricity in physically valid range
        // e = 0: circular orbit, e < 1: elliptical orbit, e ≥ 1: hyperbolic/parabolic (unbound)
        this.e = Math.max(0, Math.min(0.99, this.e)); // Clamp between 0 and 0.99
    }
}

/**
 * KeplerianBody Class
 * 
 * Represents a celestial body with Keplerian orbital mechanics.
 * This class combines physical properties (mass, radius, color) with
 * orbital dynamics to create a complete celestial object.
 */
export class KeplerianBody {
    /**
     * Constructor - Create a celestial body with orbital mechanics
     * 
     * @param {string} name - Name of the celestial body
     * @param {number} mass - Mass in kilograms
     * @param {number} radius - Radius in kilometers (for consistency with Body class)
     * @param {string} color - Color for visualization (CSS color format)
     * @param {KeplerianOrbit} orbit - Orbital mechanics object (null for Sun)
     */
    constructor(name, mass, radius, color, orbit) {
        // Basic physical properties
        this.name = name;           // Display name (e.g., "Earth", "Mars")
        this.mass = mass;           // Mass in kilograms
        this.radius = radius;       // Radius in kilometers (matches Body class convention)
        this.color = color;         // Color for rendering
        this.orbit = orbit;         // KeplerianOrbit object (null for stationary bodies like Sun)
        
        // Dynamic state variables
        this.trail = [];                        // Array of previous positions for orbital trail visualization
        this.position = { x: 0, y: 0 };         // Current position in meters (world coordinates)
        this.velocity = { x: 0, y: 0 };         // Current velocity in meters/second
        
        // Additional orbital state (populated by updatePosition)
        this.trueAnomaly = 0;       // Current true anomaly in radians
        this.distance = 0;          // Current distance from Sun in meters
    }

    // === RADIUS AND SIZE METHODS ===
    // These methods provide radius information in different units and contexts

    /**
     * Get Radius in Meters
     * Converts radius from kilometers (storage format) to meters (calculation format)
     * 
     * @returns {number} Radius in meters
     */
    getRadiusInMeters() {
        return this.radius * 1000; // Convert kilometers to meters
    }

    /**
     * Get World-Space Radius for Rendering
     * Returns the actual physical radius for scale-accurate visualization
     * Used by coordinate system for true-scale rendering
     * 
     * @returns {number} Radius in meters (world space)
     */
    getWorldRadius() {
        return this.getRadiusInMeters(); // Same as getRadiusInMeters for consistency
    }

    /**
     * Get Minimum Display Radius
     * Returns minimum size in pixels to ensure visibility on screen
     * Used as fallback when calculated size would be too small to see
     * 
     * @returns {number} Minimum radius in pixels for visibility
     */
    getMinDisplayRadius() {
        return 2; // Minimum 2 pixels for visibility on any display
    }

    /**
     * Get Display Radius (Logarithmic Scaling)
     * Provides logarithmic scaling for visualization when not using real scale
     * This ensures all bodies are visible regardless of actual size differences
     * 
     * @returns {number} Display radius in pixels using logarithmic scaling
     */
    getDisplayRadius() {
        // Logarithmic scaling based on mass: radius = max(2, log₁₀(mass/10²⁰) × 2)
        // This makes massive objects larger while keeping small objects visible
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    // === ATMOSPHERIC METHODS ===
    // Interface with atmospheric data from Body class

    /**
     * Get Atmospheric Density at Altitude
     * Calculates atmospheric density for spacecraft drag and entry modeling
     * Uses realistic atmospheric profiles from Body.planetData
     * 
     * @param {number} altitude - Altitude above surface in meters
     * @returns {number} Atmospheric density in kg/m³
     */
    getAtmosphereDensity(altitude) {
        // Look up atmospheric data from Body.planetData by matching name
        const bodyData = Object.values(Body.planetData).find(data => data.name === this.name);
        
        // Return 0 if no atmospheric data available
        if (!bodyData?.atmosphere?.layers) return 0;

        const layers = bodyData.atmosphere.layers;
        
        // Find appropriate atmospheric layer for this altitude
        for (let i = 0; i < layers.length - 1; i++) {
            const layer = layers[i];
            const nextLayer = layers[i + 1];
            
            // Check if altitude falls within this layer
            if (altitude >= layer.height && altitude < nextLayer.height) {
                // Linear interpolation between layer densities for smooth transitions
                const t = (altitude - layer.height) / (nextLayer.height - layer.height);
                return layer.density * (1 - t) + nextLayer.density * t;
            }
        }
        
        // If above the highest atmospheric layer
        const lastLayer = layers[layers.length - 1];
        return altitude >= lastLayer.height ? 0 : lastLayer.density;
    }

    // === ORBITAL MECHANICS METHODS ===
    // Core orbital dynamics functionality

    /**
     * Update Position Based on Current Time
     * 
     * This is the main orbital mechanics update method that calculates
     * the body's current position and velocity based on Keplerian orbital elements.
     * Called every simulation frame to propagate the orbit forward in time.
     * 
     * @param {number} currentTime - Current simulation time in seconds
     */
    updatePosition(currentTime) {
        // Only update if this body has orbital mechanics (not the Sun)
        if (this.orbit) {
            // Calculate orbital state at current time
            const state = this.orbit.getStateAtTime(currentTime);
            
            // Update position and velocity from orbital calculations
            this.position = { x: state.position.x, y: state.position.y };
            this.velocity = { x: state.velocity.x, y: state.velocity.y };
            
            // Store additional orbital parameters for analysis/debugging
            this.trueAnomaly = state.trueAnomaly;  // Current angle from periapsis
            this.distance = state.distance;        // Current distance from Sun
        }
        // If no orbit (like the Sun), position remains unchanged
    }

    /**
     * Add Current Position to Orbital Trail
     * 
     * Builds up a trail of previous positions for orbital visualization.
     * The trail shows the path the body has taken over time.
     * 
     * @param {number} maxTrailLength - Maximum number of trail points to keep (default: 2000)
     */
    addToTrail(maxTrailLength = 2000) {
        // Only add trail points for moving bodies (not the Sun)
        if (this.name !== 'Sun') {
            // Add current position to trail array
            this.trail.push({ x: this.position.x, y: this.position.y });
            
            // Remove old trail points if we exceed maximum length
            // This prevents memory usage from growing indefinitely
            if (this.trail.length > maxTrailLength) {
                this.trail.shift(); // Remove oldest trail point
            }
        }
    }

    // === ORBITAL ANALYSIS METHODS ===
    // Methods for analyzing orbital characteristics

    /**
     * Get Orbital Period
     * Returns the time for one complete orbit around the Sun
     * 
     * @returns {number|null} Orbital period in seconds, or null if no orbit
     */
    getOrbitalPeriod() {
        return this.orbit ? this.orbit.getOrbitalPeriod() : null;
    }

    /**
     * Get Current Distance from Focus (Sun)
     * Returns the instantaneous distance from the central body
     * 
     * @returns {number} Distance from Sun in meters
     */
    getDistanceFromFocus() {
        return this.distance || 0; // Return stored distance or 0 if not available
    }

    /**
     * Get Current True Anomaly
     * Returns the current angle from periapsis (closest approach point)
     * 
     * @returns {number} True anomaly in radians
     */
    getTrueAnomaly() {
        return this.trueAnomaly || 0; // Return stored true anomaly or 0 if not available
    }

    /**
     * Get Orbital Speed at Current Position
     * Calculates current orbital velocity magnitude
     * 
     * @returns {number} Speed in meters/second
     */
    getOrbitalSpeed() {
        // Calculate speed from velocity components using Pythagorean theorem
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }

    /**
     * Get Distance from Another Body
     * Calculates distance between this body and another celestial body
     * 
     * @param {KeplerianBody} otherBody - Other celestial body
     * @returns {number} Distance in meters
     */
    getDistanceFrom(otherBody) {
        const dx = this.position.x - otherBody.position.x; // X distance component
        const dy = this.position.y - otherBody.position.y; // Y distance component
        return Math.sqrt(dx * dx + dy * dy);               // Euclidean distance
    }

    // === LEGACY COMPATIBILITY METHODS ===
    // These methods maintain compatibility with older code

    /**
     * Get Mass (Legacy Compatibility)
     * @returns {number} Mass in kilograms
     */
    getMass() { 
        return this.mass; 
    }

    /**
     * Get Position (Legacy Compatibility)
     * @returns {object} Position vector {x, y} in meters
     */
    getPosition() { 
        return this.position; 
    }

    /**
     * Get Velocity (Legacy Compatibility)
     * @returns {object} Velocity vector {x, y} in meters/second
     */
    getVelocity() { 
        return this.velocity; 
    }
}

/**
 * PlanetarySystem Class
 * 
 * Factory class for creating complete solar system simulations.
 * This class integrates data from the Body class with Keplerian orbital mechanics
 * to create a realistic solar system with accurate planetary orbits.
 */
export class PlanetarySystem {
    /**
     * Create Complete Solar System
     * 
     * This static method creates all solar system bodies using real astronomical data
     * from the Body class combined with Keplerian orbital mechanics.
     * 
     * The resulting system includes:
     * - The Sun (stationary at origin)
     * - All 8 planets with realistic orbital elements
     * - Proper scaling and physical properties
     * - Ready-to-use orbital mechanics
     * 
     * @returns {Array<KeplerianBody>} Array of all solar system bodies
     */
    static createSolarSystem() {
        const bodies = []; // Array to hold all celestial bodies

        // Iterate through all planetary data from the Body class
        for (const [key, planetData] of Object.entries(Body.planetData)) {
            const orbitData = planetData.orbit; // Get orbital elements (null for Sun)

            // Create KeplerianOrbit object if orbital data exists
            const orbit = orbitData
                ? new KeplerianOrbit(
                      orbitData.semiMajorAxis,           // Semi-major axis (a)
                      orbitData.eccentricity,            // Eccentricity (e)
                      orbitData.meanAnomalyAtEpoch,      // Mean anomaly at epoch (M₀)
                      orbitData.argumentOfPeriapsis,     // Argument of periapsis (ω)
                      orbitData.longitudeOfAscendingNode, // Longitude of ascending node (Ω)
                      orbitData.inclination,             // Inclination (i)
                      orbitData.epochTime                // Epoch time (t₀)
                  )
                : null; // No orbit for the Sun

            // Create KeplerianBody with physical and orbital properties
            const body = new KeplerianBody(
                planetData.name,    // Name (e.g., "Earth", "Mars")
                planetData.mass,    // Mass in kilograms
                planetData.radius,  // Radius in kilometers
                planetData.color,   // Color for visualization
                orbit               // Orbital mechanics (null for Sun)
            );

            // Add the completed body to our solar system
            bodies.push(body);
        }

        // Log creation of solar system for debugging
        console.log(`Created solar system with ${bodies.length} bodies:`);
        bodies.forEach(body => {
            const period = body.getOrbitalPeriod();
            if (period) {
                console.log(`  ${body.name}: Period = ${(period / (365.25 * 24 * 3600)).toFixed(2)} years`);
            } else {
                console.log(`  ${body.name}: Stationary (no orbit)`);
            }
        });

        return bodies; // Return complete solar system
    }

    /**
     * Create Inner Solar System Only
     * Creates just the inner planets (Mercury through Mars) for focused simulations
     * 
     * @returns {Array<KeplerianBody>} Array of inner solar system bodies
     */
    static createInnerSolarSystem() {
        // List of inner solar system bodies
        const innerPlanets = ['sun', 'mercury', 'venus', 'earth', 'mars'];
        const bodies = [];

        // Create only the specified inner planets
        for (const planetKey of innerPlanets) {
            const planetData = Body.planetData[planetKey];
            if (!planetData) continue; // Skip if data not found

            const orbitData = planetData.orbit;

            // Create orbit (null for Sun)
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

            // Create body
            const body = new KeplerianBody(
                planetData.name,
                planetData.mass,
                planetData.radius,
                planetData.color,
                orbit
            );

            bodies.push(body);
        }

        console.log(`Created inner solar system with ${bodies.length} bodies`);
        return bodies;
    }

    /**
     * Create Custom Planetary System
     * Allows creation of custom solar systems with specified bodies
     * 
     * @param {Array<string>} planetKeys - Array of planet keys to include
     * @returns {Array<KeplerianBody>} Array of specified celestial bodies
     */
    static createCustomSystem(planetKeys) {
        const bodies = [];

        // Create bodies for specified planet keys
        for (const planetKey of planetKeys) {
            const planetData = Body.planetData[planetKey];
            if (!planetData) {
                console.warn(`Planet data not found for: ${planetKey}`);
                continue;
            }

            const orbitData = planetData.orbit;

            // Create orbit
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

            // Create body
            const body = new KeplerianBody(
                planetData.name,
                planetData.mass,
                planetData.radius,
                planetData.color,
                orbit
            );

            bodies.push(body);
        }

        console.log(`Created custom system with ${bodies.length} bodies:`, planetKeys);
        return bodies;
    }
}