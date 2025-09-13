export class Body {
    // Constants
    static AU_TO_METERS = 149597870700; // 1 AU in meters
    static GRAVITATIONAL_CONSTANT = 6.67430e-11; // m^3 kg^-1 s^-2
    static GM_SUN = 1.32712440018e20; // m^3/s^2 (for orbital calculations)

    // Planetary data - moved outside constructor as static property
    static planetData = {
        sun: {
            name: 'Sun',
            mass: 1.9884e30, // kg
            radius: 695700, // km
            color: 'yellow',
            atmosphere: null, // No atmosphere
        },
        mercury: {
            name: 'Mercury',
            mass: 3.302e23, // kg
            radius: 2439.4, // km
            color: 'gray',
            atmosphere: null, // No significant atmosphere
            orbit: {
                semiMajorAxis: 0.387 * 149597870700, // meters (AU to meters)
                eccentricity: 0.206,
                inclination: 7.005 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 48.331 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 29.124 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 174.796 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        venus: {
            name: 'Venus',
            mass: 4.8685e24, // kg
            radius: 6051.84, // km
            color: 'orange',
            atmosphere: {
                layers: [
                    { height: 0, density: 65 }, // Surface: 65 kg/m³
                    { height: 50e3, density: 10 }, // 50 km: 10 kg/m³
                    { height: 100e3, density: 0.1 }, // 100 km: 0.1 kg/m³
                ],
                color: 'rgba(255, 165, 0, 0.3)', // Orange haze
            },
            orbit: {
                semiMajorAxis: 0.723 * 149597870700, // meters
                eccentricity: 0.007,
                inclination: 3.39458 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 76.68069 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 54.85229 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 50.115 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        earth: {
            name: 'Earth',
            mass: 5.97219e24, // kg
            radius: 6371.01, // km
            color: 'blue',
            atmosphere: {
                layers: [
                    { height: 0, density: 1.225 }, // Surface: 1.225 kg/m³
                    { height: 10e3, density: 0.4135 }, // 10 km: 0.4135 kg/m³
                    { height: 50e3, density: 0.001027 }, // 50 km: 0.001027 kg/m³
                    { height: 100e3, density: 0 }, // 100 km: 0 kg/m³ (Kármán line)
                ],
                color: 'rgba(135, 206, 250, 0.5)', // Light blue atmosphere
            },
            orbit: {
                semiMajorAxis: 1.000 * 149597870700, // meters
                eccentricity: 0.017,
                inclination: 0.00005 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: -11.26064 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 114.20783 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 357.51716 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        mars: {
            name: 'Mars',
            mass: 6.4171e23, // kg
            radius: 3389.92, // km
            color: 'red',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.020 }, // Surface: 0.020 kg/m³
                    { height: 10e3, density: 0.007 }, // 10 km: 0.007 kg/m³
                    { height: 50e3, density: 0 }, // 50 km: 0 kg/m³
                ],
                color: 'rgba(255, 0, 0, 0.3)', // Red haze
            },
            orbit: {
                semiMajorAxis: 1.524 * 149597870700, // meters
                eccentricity: 0.093,
                inclination: 1.850 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 49.57854 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 286.46230 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 19.412 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        jupiter: {
            name: 'Jupiter',
            mass: 1.89819e27, // kg
            radius: 69911, // km
            color: '#DAA520', // Dark golden rod
            atmosphere: {
                layers: [
                    { height: 0, density: 0.16 }, // Surface: 0.16 kg/m³
                    { height: 50e3, density: 0.1 }, // 50 km: 0.1 kg/m³
                    { height: 100e3, density: 0.01 }, // 100 km: 0.01 kg/m³
                ],
                color: 'rgba(218, 165, 32, 0.3)', // Golden haze
            },
            orbit: {
                semiMajorAxis: 5.203 * 149597870700, // meters
                eccentricity: 0.048,
                inclination: 1.305 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 100.55615 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 273.867 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 20.020 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        saturn: {
            name: 'Saturn',
            mass: 5.6834e26, // kg
            radius: 58232, // km
            color: '#FAD5A5', // Wheat color
            atmosphere: {
                layers: [
                    { height: 0, density: 0.19 },
                    { height: 50e3, density: 0.12 },
                    { height: 100e3, density: 0.02 },
                ],
                color: 'rgba(250, 213, 165, 0.3)',
            },
            orbit: {
                semiMajorAxis: 9.537 * 149597870700, // meters
                eccentricity: 0.054,
                inclination: 2.485 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 113.665 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 339.392 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 317.020 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        uranus: {
            name: 'Uranus',
            mass: 8.6813e25, // kg
            radius: 25362, // km
            color: '#4FD0E3', // Cyan
            atmosphere: {
                layers: [
                    { height: 0, density: 0.42 },
                    { height: 50e3, density: 0.2 },
                    { height: 100e3, density: 0.05 },
                ],
                color: 'rgba(79, 208, 227, 0.3)',
            },
            orbit: {
                semiMajorAxis: 19.19 * 149597870700, // meters
                eccentricity: 0.047,
                inclination: 0.773 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 74.006 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 96.998 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 142.238 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
        neptune: {
            name: 'Neptune',
            mass: 1.02409e26, // kg
            radius: 24624, // km
            color: '#4169E1', // Royal blue
            atmosphere: {
                layers: [
                    { height: 0, density: 0.45 },
                    { height: 50e3, density: 0.25 },
                    { height: 100e3, density: 0.08 },
                ],
                color: 'rgba(65, 105, 225, 0.3)',
            },
            orbit: {
                semiMajorAxis: 30.07 * 149597870700, // meters
                eccentricity: 0.009,
                inclination: 1.769 * (Math.PI / 180), // radians
                longitudeOfAscendingNode: 131.784 * (Math.PI / 180), // radians
                argumentOfPeriapsis: 265.646 * (Math.PI / 180), // radians
                meanAnomalyAtEpoch: 256.228 * (Math.PI / 180), // radians
                epochTime: 0, // seconds
            },
        },
    };

    // Position data from NASA JPL Horizons (2025-Sep-08 00:00:00.0000 TDB)
    static initialConditions = {
        sun: {
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
            velocity: null
        },
        earth: {
            position: {
                x: 9.704340004273962E-01 * Body.AU_TO_METERS,
                y: -2.618862968968059E-01 * Body.AU_TO_METERS
            },
            velocity: null
        },
        mars: {
            position: {
                x: -1.178115270090020E+00 * Body.AU_TO_METERS,
                y: -1.049489611879400E+00 * Body.AU_TO_METERS
            },
            velocity: null
        },
        jupiter: {
            position: {
                x: -8.466952031645225E-01 * Body.AU_TO_METERS,
                y: 5.095364448593986E+00 * Body.AU_TO_METERS
            },
            velocity: null
        },
        saturn: {
            position: {
                x: 9.535171005165544E+00 * Body.AU_TO_METERS,
                y: -3.878464193250671E-01 * Body.AU_TO_METERS
            },
            velocity: null
        },
        uranus: {
            position: {
                x: 1.026780683841551E+01 * Body.AU_TO_METERS,
                y: 1.658184090630679E+01 * Body.AU_TO_METERS
            },
            velocity: null
        },
        neptune: {
            position: {
                x: 2.987544044485914E+01 * Body.AU_TO_METERS,
                y: 1.502892955356041E-01 * Body.AU_TO_METERS
            },
            velocity: null
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
        this.atmosphere = null;

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
        this.atmosphere = planetData.atmosphere; // Assign atmosphere data
        
        // Calculate circular orbit velocity if not the Sun
        if (planetKey === 'sun') {
            this.velocity = { ...initialData.velocity };
        } else {
            const sunMass = Body.planetData.sun.mass;
            this.velocity = Body.calculateCircularOrbitVelocity(this.position, sunMass);
        }

        // Initialize trail for planets (not for Sun)
        this.trail = planetKey === 'sun' ? null : [];
    }

    static calculateCircularOrbitVelocity(position, centralMass) {
        const r = Math.sqrt(position.x * position.x + position.y * position.y);
        const v = Math.sqrt(Body.GRAVITATIONAL_CONSTANT * centralMass / r);
        
        // Velocity is perpendicular to position vector
        return {
            x: -v * position.y / r,
            y: v * position.x / r
        };
    }

    static getAtmosphereDensity(planet, altitude) {
        if (!planet.atmosphere || !planet.atmosphere.layers) {
            return 0;
        }

        const layers = planet.atmosphere.layers;
        
        // Find appropriate layer for this altitude
        for (let i = 0; i < layers.length - 1; i++) {
            if (altitude >= layers[i].height && altitude < layers[i + 1].height) {
                // Linear interpolation between layers
                const t = (altitude - layers[i].height) / (layers[i + 1].height - layers[i].height);
                return layers[i].density * (1 - t) + layers[i + 1].density * t;
            }
        }
        
        // Above highest layer
        return layers[layers.length - 1].density;
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

    getAtmosphereDensity(altitude) {
        if (!this.atmosphere || !this.atmosphere.layers) return 0;

        // Find the appropriate layer based on altitude
        for (let i = 0; i < this.atmosphere.layers.length - 1; i++) {
            const layer = this.atmosphere.layers[i];
            const nextLayer = this.atmosphere.layers[i + 1];
            if (altitude >= layer.height && altitude < nextLayer.height) {
                // Interpolate density between layers
                const t = (altitude - layer.height) / (nextLayer.height - layer.height);
                return layer.density * (1 - t) + nextLayer.density * t;
            }
        }

        // If above the last layer, return 0 or the last layer's density
        const lastLayer = this.atmosphere.layers[this.atmosphere.layers.length - 1];
        return altitude >= lastLayer.height ? 0 : lastLayer.density;
    }
}

// Export BodyData for backward compatibility
export const BodyData = Body.planetData;



