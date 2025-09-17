/**
 * Celestial Body Class for Solar System Simulation
 * Contains physical properties, orbital mechanics data, and atmospheric modeling
 */

export class Body {
    // Universal Constants
    static AU_TO_METERS = 149597870700;
    static GRAVITATIONAL_CONSTANT = 6.67430e-11;
    static GM_SUN = 1.32712440018e20;

    // Planetary Database with real astronomical data
    static planetData = {
        sun: {
            name: 'Sun',
            mass: 1.9884e30,
            radius: 695700,
            color: 'yellow',
            atmosphere: null,
        },
        
        mercury: {
            name: 'Mercury',
            mass: 3.302e23,
            radius: 2439.4,
            color: 'gray',
            atmosphere: null,
            orbit: {
                semiMajorAxis: 0.387 * 149597870700,
                eccentricity: 0.206,
                inclination: 7.005 * (Math.PI / 180),
                longitudeOfAscendingNode: 48.331 * (Math.PI / 180),
                argumentOfPeriapsis: 29.124 * (Math.PI / 180),
                meanAnomalyAtEpoch: 174.796 * (Math.PI / 180),
                epochTime: 0,
            },
        },
        
        venus: {
            name: 'Venus',
            mass: 4.8685e24,
            radius: 6051.84,
            color: 'orange',
            atmosphere: {
                layers: [
                    { height: 0,      density: 66.0 },
                    { height: 10e3,   density: 40.0 },
                    { height: 20e3,   density: 25.0 },
                    { height: 30e3,   density: 15.0 },
                    { height: 40e3,   density: 8.0 },
                    { height: 50e3,   density: 1.20 },
                    { height: 60e3,   density: 0.45 },
                    { height: 70e3,   density: 0.12 },
                    { height: 80e3,   density: 0.018 },
                    { height: 90e3,   density: 0.0030 },
                    { height: 100e3,  density: 0.00030 }
                ],
                color: 'rgba(255, 165, 0, 0.30)',
            },
            orbit: {
                semiMajorAxis: 0.723 * 149597870700,
                eccentricity: 0.007,
                inclination: 3.39458 * (Math.PI / 180),
                longitudeOfAscendingNode: 76.68069 * (Math.PI / 180),
                argumentOfPeriapsis: 54.85229 * (Math.PI / 180),
                meanAnomalyAtEpoch: 50.115 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        earth: {
            name: 'Earth',
            mass: 5.97219e24,
            radius: 6371.01,
            color: 'blue',
            atmosphere: {
                layers: [
                    { height: 0,      density: 1.22500 },
                    { height: 1e3,    density: 1.11200 },
                    { height: 5e3,    density: 0.73600 },
                    { height: 11e3,   density: 0.36391 },
                    { height: 20e3,   density: 0.08891 },
                    { height: 32e3,   density: 0.01330 },
                    { height: 47e3,   density: 0.00143 },
                    { height: 51e3,   density: 0.00086 },
                    { height: 71e3,   density: 0.000064 },
                    { height: 86e3,   density: 0.000013 },
                    { height: 100e3,  density: 5.6e-7 },
                    { height: 120e3,  density: 9.0e-8 },
                    { height: 150e3,  density: 1.0e-8 },
                    { height: 200e3,  density: 2.0e-9 },
                    { height: 300e3,  density: 2.0e-10 },
                    { height: 400e3,  density: 3.9e-11 },
                    { height: 600e3,  density: 1.0e-12 }
                ],
                color: 'rgba(135, 206, 250, 0.50)',
            },
            orbit: {
                semiMajorAxis: 1.000 * 149597870700,
                eccentricity: 0.017,
                inclination: 0.00005 * (Math.PI / 180),
                longitudeOfAscendingNode: -11.26064 * (Math.PI / 180),
                argumentOfPeriapsis: 114.20783 * (Math.PI / 180),
                meanAnomalyAtEpoch: 357.51716 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        mars: {
            name: 'Mars',
            mass: 6.4171e23,
            radius: 3389.92,
            color: 'red',
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.0200 },
                    { height: 5e3,    density: 0.0110 },
                    { height: 10e3,   density: 0.0070 },
                    { height: 20e3,   density: 0.0025 },
                    { height: 30e3,   density: 0.0010 },
                    { height: 40e3,   density: 0.00035 },
                    { height: 50e3,   density: 0.00012 },
                    { height: 60e3,   density: 4.0e-5 },
                    { height: 80e3,   density: 7.0e-6 },
                    { height: 100e3,  density: 1.0e-6 }
                ],
                color: 'rgba(255, 0, 0, 0.30)',
            },
            orbit: {
                semiMajorAxis: 1.524 * 149597870700,
                eccentricity: 0.093,
                inclination: 1.850 * (Math.PI / 180),
                longitudeOfAscendingNode: 49.57854 * (Math.PI / 180),
                argumentOfPeriapsis: 286.46230 * (Math.PI / 180),
                meanAnomalyAtEpoch: 19.412 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        jupiter: {
            name: 'Jupiter',
            mass: 1.89819e27,
            radius: 69911,
            color: '#DAA520',
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.160 },
                    { height: 25e3,   density: 0.0589 },
                    { height: 50e3,   density: 0.0217 },
                    { height: 75e3,   density: 0.0080 },
                    { height: 100e3,  density: 0.00293 },
                    { height: 125e3,  density: 0.00108 },
                    { height: 150e3,  density: 0.000397 },
                    { height: 200e3,  density: 5.37e-5 },
                    { height: 300e3,  density: 9.83e-7 },
                    { height: 400e3,  density: 1.80e-8 }
                ],
                color: 'rgba(218, 165, 32, 0.30)',
            },
            orbit: {
                semiMajorAxis: 5.203 * 149597870700,
                eccentricity: 0.048,
                inclination: 1.305 * (Math.PI / 180),
                longitudeOfAscendingNode: 100.55615 * (Math.PI / 180),
                argumentOfPeriapsis: 273.867 * (Math.PI / 180),
                meanAnomalyAtEpoch: 20.020 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        saturn: {
            name: 'Saturn',
            mass: 5.6834e26,
            radius: 58232,
            color: '#FAD5A5',
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.190 },
                    { height: 50e3,   density: 0.0726 },
                    { height: 100e3,  density: 0.0278 },
                    { height: 150e3,  density: 0.0106 },
                    { height: 200e3,  density: 0.00406 },
                    { height: 250e3,  density: 0.00156 },
                    { height: 300e3,  density: 0.000600 },
                    { height: 400e3,  density: 0.000189 },
                    { height: 600e3,  density: 1.82e-5 }
                ],
                color: 'rgba(250, 213, 165, 0.30)',
            },
            orbit: {
                semiMajorAxis: 9.537 * 149597870700,
                eccentricity: 0.054,
                inclination: 2.485 * (Math.PI / 180),
                longitudeOfAscendingNode: 113.665 * (Math.PI / 180),
                argumentOfPeriapsis: 339.392 * (Math.PI / 180),
                meanAnomalyAtEpoch: 317.020 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        uranus: {
            name: 'Uranus',
            mass: 8.6813e25,
            radius: 25362,
            color: '#4FD0E3',
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.420 },
                    { height: 25e3,   density: 0.170 },
                    { height: 50e3,   density: 0.0686 },
                    { height: 75e3,   density: 0.0277 },
                    { height: 100e3,  density: 0.0112 },
                    { height: 125e3,  density: 0.00453 },
                    { height: 150e3,  density: 0.00184 },
                    { height: 200e3,  density: 0.000302 },
                    { height: 300e3,  density: 1.08e-5 },
                    { height: 400e3,  density: 3.86e-7 }
                ],
                color: 'rgba(79, 208, 227, 0.30)',
            },
            orbit: {
                semiMajorAxis: 19.19 * 149597870700,
                eccentricity: 0.047,
                inclination: 0.773 * (Math.PI / 180),
                longitudeOfAscendingNode: 74.006 * (Math.PI / 180),
                argumentOfPeriapsis: 96.998 * (Math.PI / 180),
                meanAnomalyAtEpoch: 142.238 * (Math.PI / 180),
                epochTime: 0,
            },
        },

        neptune: {
            name: 'Neptune',
            mass: 1.02409e26,
            radius: 24624,
            color: '#4169E1',
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.450 },
                    { height: 20e3,   density: 0.159 },
                    { height: 40e3,   density: 0.0560 },
                    { height: 60e3,   density: 0.0198 },
                    { height: 80e3,   density: 0.00698 },
                    { height: 100e3,  density: 0.00246 },
                    { height: 120e3,  density: 0.000867 },
                    { height: 160e3,  density: 0.000122 },
                    { height: 200e3,  density: 1.72e-5 },
                    { height: 300e3,  density: 6.62e-7 }
                ],
                color: 'rgba(65, 105, 225, 0.30)',
            },
            orbit: {
                semiMajorAxis: 30.07 * 149597870700,
                eccentricity: 0.009,
                inclination: 1.769 * (Math.PI / 180),
                longitudeOfAscendingNode: 131.784 * (Math.PI / 180),
                argumentOfPeriapsis: 265.646 * (Math.PI / 180),
                meanAnomalyAtEpoch: 256.228 * (Math.PI / 180),
                epochTime: 0,
            },
        },
    };

    // Real NASA JPL position data (2025-Sep-08)
    static initialConditions = {
        sun: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
        mercury: { position: { x: -2.833038099203199E-01 * Body.AU_TO_METERS, y: 1.901776638931361E-01 * Body.AU_TO_METERS }, velocity: null },
        venus: { position: { x: -2.710618632817853E-02 * Body.AU_TO_METERS, y: 7.135856161465192E-01 * Body.AU_TO_METERS }, velocity: null },
        earth: { position: { x: 9.704340004273962E-01 * Body.AU_TO_METERS, y: -2.618862968968059E-01 * Body.AU_TO_METERS }, velocity: null },
        mars: { position: { x: -1.178115270090020E+00 * Body.AU_TO_METERS, y: -1.049489611879400E+00 * Body.AU_TO_METERS }, velocity: null },
        jupiter: { position: { x: -8.466952031645225E-01 * Body.AU_TO_METERS, y: 5.095364448593986E+00 * Body.AU_TO_METERS }, velocity: null },
        saturn: { position: { x: 9.535171005165544E+00 * Body.AU_TO_METERS, y: -3.878464193250671E-01 * Body.AU_TO_METERS }, velocity: null },
        uranus: { position: { x: 1.026780683841551E+01 * Body.AU_TO_METERS, y: 1.658184090630679E+01 * Body.AU_TO_METERS }, velocity: null },
        neptune: { position: { x: 2.987544044485914E+01 * Body.AU_TO_METERS, y: 1.502892955356041E-01 * Body.AU_TO_METERS }, velocity: null }
    };

    constructor(planetKey = null) {
        this.name = '';
        this.mass = 0;
        this.radius = 0;
        this.color = '#FFFFFF';
        this.atmosphere = null;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        if (planetKey) {
            this.initializeFromPlanet(planetKey);
        }
    }

    initializeFromPlanet(planetKey) {
        const data = Body.planetData[planetKey];
        if (!data) {
            console.error(`Planet data not found for key: ${planetKey}`);
            return;
        }

        this.name = data.name;
        this.mass = data.mass;
        this.radius = data.radius;
        this.color = data.color;
        this.atmosphere = data.atmosphere;

        // Set initial position from NASA data
        const initialData = Body.initialConditions[planetKey];
        if (initialData) {
            this.position = { ...initialData.position };
            if (initialData.velocity) {
                this.velocity = { ...initialData.velocity };
            }
        }
    }

    static calculateCircularOrbitVelocity(position, centralMass) {
        const distance = Math.sqrt(position.x * position.x + position.y * position.y);
        const speed = Math.sqrt(Body.GRAVITATIONAL_CONSTANT * centralMass / distance);
        
        const unitX = -position.y / distance;
        const unitY = position.x / distance;
        
        return { x: speed * unitX, y: speed * unitY };
    }

    static getAtmosphereDensity(planet, altitude) {
        if (!planet.atmosphere || !planet.atmosphere.layers) {
            return 0;
        }

        const layers = planet.atmosphere.layers;
        
        if (altitude < 0) return layers[0].density;
        if (altitude >= layers[layers.length - 1].height) return 0;

        for (let i = 0; i < layers.length - 1; i++) {
            const lower = layers[i];
            const upper = layers[i + 1];
            
            if (altitude >= lower.height && altitude <= upper.height) {
                const fraction = (altitude - lower.height) / (upper.height - lower.height);
                return lower.density * Math.pow(upper.density / lower.density, fraction);
            }
        }
        
        return 0;
    }

    // Getters
    getMass() { return this.mass; }
    getPosition() { return { ...this.position }; }
    getVelocity() { return { ...this.velocity }; }

    // Setters
    setPosition(x, y) { this.position = { x, y }; }
    setVelocity(vx, vy) { this.velocity = { x: vx, y: vy }; }
    setMass(mass) { this.mass = mass; }
    setName(name) { this.name = name; }
    setColor(color) { this.color = color; }
    setRadius(radius) { this.radius = radius; }

    // Display methods
    getDisplayRadius() {
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    getAtmosphereDensity(altitude) {
        return Body.getAtmosphereDensity(this, altitude);
    }

    getAtmosphericScaleHeight() {
        if (!this.atmosphere || !this.atmosphere.layers || this.atmosphere.layers.length < 2) {
            return null;
        }

        const surface = this.atmosphere.layers[0];
        const upper = this.atmosphere.layers[1];
        
        if (surface.density <= 0 || upper.density <= 0) return null;
        
        const deltaH = upper.height - surface.height;
        const ratio = Math.log(surface.density / upper.density);
        
        return deltaH / ratio;
    }

    getApproximateSurfacePressure() {
        if (!this.atmosphere || !this.atmosphere.layers || this.atmosphere.layers.length === 0) {
            return 0;
        }

        const surfaceDensity = this.atmosphere.layers[0].density;
        const temperature = 288; // Assumed surface temperature in Kelvin
        const gasConstant = 287; // Specific gas constant for dry air (J/kg·K)
        
        return surfaceDensity * gasConstant * temperature;
    }

    getSurfaceGravity() {
        if (this.mass === 0 || this.radius === 0) return 0;
        const radiusMeters = this.radius * 1000;
        return (Body.GRAVITATIONAL_CONSTANT * this.mass) / (radiusMeters * radiusMeters);
    }

    getRadiusInMeters() {
        return this.radius * 1000;
    }

    getWorldRadius() {
        return this.getRadiusInMeters();
    }

    getMinDisplayRadius() {
        return 2;
    }

    getAtmosphericSummary() {
        if (!this.atmosphere || !this.atmosphere.layers) {
            return null;
        }

        const surfaceLayer = this.atmosphere.layers[0];
        const estimatedSurfacePressure = this.getApproximateSurfacePressure();
        const scaleHeight = this.getAtmosphericScaleHeight();

        return {
            hasAtmosphere: true,
            surfaceDensity: surfaceLayer.density,
            estimatedSurfacePressure: estimatedSurfacePressure,
            scaleHeight: scaleHeight,
            layerCount: this.atmosphere.layers.length,
            maxAltitude: this.atmosphere.layers[this.atmosphere.layers.length - 1].height,
            composition: 'Mixed gases', // Simplified
            color: this.atmosphere.color || 'rgba(135, 206, 250, 0.3)'
        };
    }

            /**
    * Maps an atmosphere density value to a canvas transparency (alpha) value.
    * @param {number} density - The atmosphere density (double).
    * @returns {number} - Transparency value between 0 (fully transparent) and 1 (fully opaque).
    */
    static densityToAlpha(density) {
        // Example mapping: normalize density to a reasonable range for alpha
        // You can adjust maxDensity based on your simulation's expected max
        const maxDensity = 1.225; // Earth's surface density (kg/m^3)
        let alpha = density / maxDensity;
        // Clamp between 0 and 1
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;
        return alpha;
    }
}

// Backward compatibility export
export const BodyData = Body.planetData;



