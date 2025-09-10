// Updated Body class with NASA JPL Horizons data
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

    // Position and velocity data from NASA JPL Horizons (2025-Sep-08 00:00:00.0000 TDB)
    // Positions in AU, velocities in AU/day - converted to meters and m/s
    static AU_TO_METERS = 149597870700; // 1 AU in meters
    static DAY_TO_SECONDS = 86400; // 1 day in seconds

    static initialConditions = {
        sun: {
            // Sun position relative to Solar System Barycenter
            position: {
                x: -3.908173326479530E-03 * Body.AU_TO_METERS,
                y: -5.486610401446179E-03 * Body.AU_TO_METERS
            },
            velocity: {
                x: 7.402030005774010E-06 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS,
                y: -1.038587714102809E-06 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS
            }
        },
        mercury: {
            position: {
                x: -2.833038099203199E-01 * Body.AU_TO_METERS,
                y: 1.901776638931361E-01 * Body.AU_TO_METERS
            },
            velocity: {
                x: -2.188138855874340E-02 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS,
                y: -2.188001165864181E-02 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS
            }
        },
        venus: {
            position: {
                x: -2.710618632817853E-02 * Body.AU_TO_METERS,
                y: 7.135856161465192E-01 * Body.AU_TO_METERS
            },
            velocity: {
                x: -2.027788720992199E-02 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS,
                y: -7.610838489737338E-04 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS
            }
        },
        earth: {
            position: {
                x: 9.704340004273962E-01 * Body.AU_TO_METERS,
                y: -2.618862968968059E-01 * Body.AU_TO_METERS
            },
            velocity: {
                x: 4.105369107069331E-03 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS,
                y: 1.656496047701150E-02 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS
            }
        },
        mars: {
            position: {
                x: -1.178115270090020E+00 * Body.AU_TO_METERS,
                y: -1.049489611879400E+00 * Body.AU_TO_METERS
            },
            velocity: {
                x: 9.831532927675158E-03 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS,
                y: -9.260925610938555E-03 * Body.AU_TO_METERS / Body.DAY_TO_SECONDS
            }
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
        this.velocity = { ...initialData.velocity };
        
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