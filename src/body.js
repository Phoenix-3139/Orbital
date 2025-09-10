// Updated Body class with energy-corrected circular orbits
export class Body {
    // Physical data from NASA JPL Horizons (masses in kg, 2025-Sep-08 data)
    static planetData = {
        sun: {
            mass: 1.9884e30, // From Horizons: ~1988410 x 10^24 kg
            radius: 695700, // km
            color: 'yellow',
            name: 'Sun'
        },
        mercury: {
            mass: 3.302e23, // From Horizons: 3.302 x10^23 kg
            radius: 2439.4, // km
            color: 'gray',
            name: 'Mercury'
        },
        venus: {
            mass: 4.8685e24, // From Horizons: 48.685 x10^23 kg
            radius: 6051.84, // km
            color: 'orange',
            name: 'Venus'
        },
        earth: {
            mass: 5.97219e24, // From Horizons: 5.97219+-0.0006 x10^24 kg
            radius: 6371.01, // km
            color: 'blue',
            name: 'Earth'
        },
        mars: {
            mass: 6.4171e23, // From Horizons: 6.4171 x10^23 kg
            radius: 3389.92, // km
            color: 'red',
            name: 'Mars'
        }
    };

    // Constants
    static AU_TO_METERS = 149597870700; // 1 AU in meters
    static GRAVITATIONAL_CONSTANT = 6.67430e-11; // m^3 kg^-1 s^-2

    // Position data from NASA JPL Horizons (2025-Sep-08 00:00:00.0000 TDB)
    // Positions in AU converted to meters, velocities calculated for circular orbits
    static initialConditions = {
        sun: {
            // Sun at origin for simplified heliocentric system
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 }
        },
        mercury: {
            position: {
                x: -2.833038099203199E-01 * Body.AU_TO_METERS,
                y: 1.901776638931361E-01 * Body.AU_TO_METERS
            },
            velocity: null // Will be calculated for circular orbit
        },
        venus: {
            position: {
                x: -2.710618632817853E-02 * Body.AU_TO_METERS,
                y: 7.135856161465192E-01 * Body.AU_TO_METERS
            },
            velocity: null // Will be calculated for circular orbit
        },
        earth: {
            position: {
                x: 9.704340004273962E-01 * Body.AU_TO_METERS,
                y: -2.618862968968059E-01 * Body.AU_TO_METERS
            },
            velocity: null // Will be calculated for circular orbit
        },
        mars: {
            position: {
                x: -1.178115270090020E+00 * Body.AU_TO_METERS,
                y: -1.049489611879400E+00 * Body.AU_TO_METERS
            },
            velocity: null // Will be calculated for circular orbit
        }
    };

    constructor(planetKey = null) {
        this.name = '';
        this.mass = 0;
        this.radius = 0;
        this.color = 'white';
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.previousAcceleration = { x: 0, y: 0 };
        this.trail = null;

        // If a planet key is provided, initialize with that planet's data
        if (planetKey && Body.planetData[planetKey]) {
            this.initializeFromPlanet(planetKey);
        }
    }

    /**
     * Calculate circular orbital velocity for a planet at its current position
     * Uses v = sqrt(GM/r) where M is the central mass (Sun)
     */
    static calculateCircularOrbitVelocity(position, centralMass) {
        const distance = Math.sqrt(position.x * position.x + position.y * position.y);
        
        if (distance === 0) {
            return { x: 0, y: 0 };
        }

        // Calculate orbital speed for circular orbit: v = sqrt(GM/r)
        const orbitalSpeed = Math.sqrt(Body.GRAVITATIONAL_CONSTANT * centralMass / distance);
        
        // Velocity should be perpendicular to position vector
        // For counterclockwise motion: vx = -orbitalSpeed * (y/r), vy = orbitalSpeed * (x/r)
        const velocity = {
            x: -orbitalSpeed * (position.y / distance),
            y: orbitalSpeed * (position.x / distance)
        };

        return velocity;
    }

    initializeFromPlanet(planetKey) {
        const planetData = Body.planetData[planetKey];
        const initialData = Body.initialConditions[planetKey];
        
        if (!planetData || !initialData) {
            console.error(`Planet data not found for: ${planetKey}`);
            return;
        }

        this.name = planetData.name;
        this.mass = planetData.mass;
        this.radius = planetData.radius;
        this.color = planetData.color;
        this.position = { ...initialData.position };
        
        // Calculate circular orbit velocity if not the Sun
        if (planetKey === 'sun') {
            this.velocity = { ...initialData.velocity };
        } else {
            // Calculate stable circular orbit velocity at this position
            const sunMass = Body.planetData.sun.mass;
            this.velocity = Body.calculateCircularOrbitVelocity(this.position, sunMass);
            
            console.log(`${this.name}: Orbital velocity = ${Math.sqrt(this.velocity.x**2 + this.velocity.y**2).toFixed(0)} m/s`);
        }
        
        // Initialize trail for planets (not for Sun)
        this.trail = planetKey === 'sun' ? null : [];
    }

    getMass() {
        return this.mass;
    }

    getPosition() {
        return this.position;
    }

    setPosition(x, y) {
        this.position = { x: x, y: y };
    }

    getVelocity() {
        return this.velocity;
    }

    setVelocity(vx, vy) {
        this.velocity = { x: vx, y: vy };
    }

    setMass(mass) {
        this.mass = mass;
    }

    setName(name) {
        this.name = name;
    }

    setColor(color) {
        this.color = color;
    }

    setRadius(radius) {
        this.radius = radius;
    }

    // Helper method to get display radius (scaled for visualization)
    getDisplayRadius() {
        // Logarithmic scaling for better visualization
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }
}