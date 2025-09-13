// Legacy Body class maintained for compatibility
// Note: This is superseded by the KeplerianBody class for new implementations

export class Body {
    // Complete planetary data from NASA JPL Horizons
    static planetData = {
        sun: {
            mass: 1.9884e30, // ~1988410 x 10^24 kg
            radius: 695700, // km
            color: 'yellow',
            name: 'Sun',
            atmosphere: null // No atmosphere for the Sun
        },
        mercury: {
            mass: 3.302e23, // 3.302 x10^23 kg
            radius: 2439.4, // km
            color: 'gray',
            name: 'Mercury',
            atmosphere: null // No significant atmosphere
        },
        venus: {
            mass: 4.8685e24, // 48.685 x10^23 kg
            radius: 6051.84, // km
            color: 'orange',
            name: 'Venus',
            atmosphere: {
                layers: [
                    { height: 0, density: 65 }, // Surface: 65 kg/m³
                    { height: 50e3, density: 10 }, // 50 km: 10 kg/m³
                    { height: 100e3, density: 0.1 } // 100 km: 0.1 kg/m³
                ],
                color: 'rgba(255, 165, 0, 0.3)' // Orange haze
            }
        },
        earth: {
            mass: 5.97219e24, // 5.97219 x10^24 kg
            radius: 6371.01, // km
            color: 'blue',
            name: 'Earth',
            atmosphere: {
                layers: [
                    { height: 0, density: 1.225 }, // Surface: 1.225 kg/m³
                    { height: 10e3, density: 0.4135 }, // 10 km: 0.4135 kg/m³
                    { height: 50e3, density: 0.001027 }, // 50 km: 0.001027 kg/m³
                    { height: 100e3, density: 0 } // 100 km: 0 kg/m³ (Kármán line)
                ],
                color: 'rgba(135, 206, 250, 0.5)' // Light blue atmosphere
            }
        },
        mars: {
            mass: 6.4171e23, // 6.4171 x10^23 kg
            radius: 3389.92, // km
            color: 'red',
            name: 'Mars',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.020 }, // Surface: 0.020 kg/m³
                    { height: 10e3, density: 0.007 }, // 10 km: 0.007 kg/m³
                    { height: 50e3, density: 0 } // 50 km: 0 kg/m³
                ],
                color: 'rgba(255, 0, 0, 0.3)' // Red haze
            }
        },
        jupiter: {
            mass: 1.89819e27, // 18.9819 x10^26 kg
            radius: 69911, // km
            color: '#DAA520', // Dark golden rod
            name: 'Jupiter',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.16 }, // Surface: 0.16 kg/m³
                    { height: 50e3, density: 0.1 }, // 50 km: 0.1 kg/m³
                    { height: 100e3, density: 0.01 } // 100 km: 0.01 kg/m³
                ],
                color: 'rgba(218, 165, 32, 0.3)' // Golden haze
            }
        },
        // Add similar atmospheric data for Saturn, Uranus, and Neptune
        saturn: {
            mass: 5.6834e26,
            radius: 58232,
            color: '#FAD5A5',
            name: 'Saturn',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.19 },
                    { height: 50e3, density: 0.12 },
                    { height: 100e3, density: 0.02 }
                ],
                color: 'rgba(250, 213, 165, 0.3)'
            }
        },
        uranus: {
            mass: 8.6813e25,
            radius: 25362,
            color: '#4FD0E3',
            name: 'Uranus',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.42 },
                    { height: 50e3, density: 0.2 },
                    { height: 100e3, density: 0.05 }
                ],
                color: 'rgba(79, 208, 227, 0.3)'
            }
        },
        neptune: {
            mass: 1.02409e26,
            radius: 24624,
            color: '#4169E1',
            name: 'Neptune',
            atmosphere: {
                layers: [
                    { height: 0, density: 0.45 },
                    { height: 50e3, density: 0.25 },
                    { height: 100e3, density: 0.08 }
                ],
                color: 'rgba(65, 105, 225, 0.3)'
            }
        }
    };

    // Constants
    static AU_TO_METERS = 149597870700; // 1 AU in meters
    static GRAVITATIONAL_CONSTANT = 6.67430e-11; // m^3 kg^-1 s^-2

    // Position data from NASA JPL Horizons (2025-Sep-08 00:00:00.0000 TDB)
    // Using real positions but will calculate stable circular orbit velocities
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

    /**
     * Calculate circular orbital velocity for a planet at its current position
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

        // If above the last layer, return the last layer's density
        const lastLayer = this.atmosphere.layers[this.atmosphere.layers.length - 1];
        return altitude >= lastLayer.height ? 0 : lastLayer.density;
    }
}