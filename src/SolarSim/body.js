/**
 * Celestial Body Class for Solar System Simulation
 * 
 * This class represents celestial bodies (planets, moons, sun) in the solar system.
 * It contains:
 * - Physical properties (mass, radius, atmosphere)
 * - Orbital mechanics data
 * - Real NASA JPL position data for accurate simulation
 * - Realistic atmospheric modeling for spacecraft interactions
 * - Rendering utilities for different scales
 * 
 * The class uses real astronomical data and physical constants for
 * scientifically accurate orbital mechanics simulation.
 * 
 * ATMOSPHERIC DATA: Enhanced with realistic density profiles based on
 * actual atmospheric models from planetary science research.
 */

export class Body {
    // === UNIVERSAL CONSTANTS ===
    // These are fundamental physical constants used throughout the simulation
    
    static AU_TO_METERS = 149597870700; // 1 Astronomical Unit in meters (Earth-Sun distance)
    static GRAVITATIONAL_CONSTANT = 6.67430e-11; // Universal gravitational constant (m³ kg⁻¹ s⁻²)
    static GM_SUN = 1.32712440018e20; // Standard gravitational parameter of the Sun (m³/s²)

    // === PLANETARY DATABASE ===
    // Complete database of solar system bodies with real astronomical data
    // All data sourced from NASA JPL and IAU standards
    // Atmospheric profiles updated with realistic density models
    static planetData = {
        // === SUN ===
        // Central star of our solar system
        sun: {
            name: 'Sun',                    // Display name
            mass: 1.9884e30,               // Mass in kilograms (99.86% of solar system mass)
            radius: 695700,                // Radius in kilometers (average photosphere radius)
            color: 'yellow',               // Display color for visualization
            atmosphere: null,              // No defined atmosphere boundary (plasma corona extends indefinitely)
        },
        
        // === MERCURY ===
        // Innermost planet, closest to the Sun
        mercury: {
            name: 'Mercury',               // Display name
            mass: 3.302e23,               // Mass in kilograms (smallest planet by mass)
            radius: 2439.4,               // Mean radius in kilometers
            color: 'gray',                // Gray color (rocky, no atmosphere)
            atmosphere: null,             // Negligible exosphere - essentially no atmosphere
            
            // Orbital elements (Keplerian elements for precise orbital mechanics)
            orbit: {
                semiMajorAxis: 0.387 * 149597870700,           // Semi-major axis in meters (0.387 AU)
                eccentricity: 0.206,                           // Orbital eccentricity (most eccentric planet)
                inclination: 7.005 * (Math.PI / 180),          // Orbital inclination in radians (7.005°)
                longitudeOfAscendingNode: 48.331 * (Math.PI / 180),  // Longitude of ascending node in radians
                argumentOfPeriapsis: 29.124 * (Math.PI / 180), // Argument of periapsis in radians
                meanAnomalyAtEpoch: 174.796 * (Math.PI / 180), // Mean anomaly at epoch in radians
                epochTime: 0,                                  // Reference epoch time in seconds
            },
        },
        
        // === VENUS ===
        // Second planet from Sun, hottest planet due to greenhouse effect
        venus: {
            name: 'Venus',                 // Display name
            mass: 4.8685e24,              // Mass in kilograms (81.5% of Earth's mass)
            radius: 6051.84,              // Mean radius in kilometers (95% of Earth's radius)
            color: 'orange',              // Orange color (thick cloudy atmosphere)
            
            // Dense carbon dioxide atmosphere with sulfuric acid clouds
            // Realistic profile: surface ~92 bar, ~737 K temperature
            atmosphere: {
                layers: [
                    { height: 0,      density: 66.0 },     // Surface: 66 kg/m³ (~92 bar, ~737 K)
                    { height: 10e3,   density: 40.0 },     // 10 km: 40 kg/m³ (dense lower atmosphere)
                    { height: 20e3,   density: 25.0 },     // 20 km: 25 kg/m³ (middle atmosphere)
                    { height: 30e3,   density: 15.0 },     // 30 km: 15 kg/m³ (approaching cloud deck)
                    { height: 40e3,   density: 8.0 },      // 40 km: 8 kg/m³ (lower cloud layer)
                    { height: 50e3,   density: 1.20 },     // 50 km: 1.2 kg/m³ (~1 bar region, main cloud deck)
                    { height: 60e3,   density: 0.45 },     // 60 km: 0.45 kg/m³ (upper cloud layer)
                    { height: 70e3,   density: 0.12 },     // 70 km: 0.12 kg/m³ (above clouds)
                    { height: 80e3,   density: 0.018 },    // 80 km: 0.018 kg/m³ (upper atmosphere)
                    { height: 90e3,   density: 0.0030 },   // 90 km: 0.003 kg/m³ (thermosphere)
                    { height: 100e3,  density: 0.00030 }   // 100 km: 0.0003 kg/m³ (exosphere transition)
                ],
                color: 'rgba(255, 165, 0, 0.30)',         // Orange haze for visualization
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 0.723 * 149597870700,           // Semi-major axis: 0.723 AU
                eccentricity: 0.007,                           // Nearly circular orbit
                inclination: 3.39458 * (Math.PI / 180),        // Orbital inclination: 3.39°
                longitudeOfAscendingNode: 76.68069 * (Math.PI / 180),  // Ascending node
                argumentOfPeriapsis: 54.85229 * (Math.PI / 180),       // Argument of periapsis
                meanAnomalyAtEpoch: 50.115 * (Math.PI / 180),  // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === EARTH ===
        // Third planet from Sun, only known planet with life
        earth: {
            name: 'Earth',                 // Display name
            mass: 5.97219e24,             // Mass in kilograms (reference for other planets)
            radius: 6371.01,              // Mean radius in kilometers
            color: 'blue',                // Blue color (water and atmosphere)
            
            // Standard atmosphere model with realistic density profile
            // From troposphere through exosphere with proper scale heights
            atmosphere: {
                layers: [
                    { height: 0,      density: 1.22500 },   // Sea level: 1.225 kg/m³ (standard pressure)
                    { height: 1e3,    density: 1.11200 },   // 1 km: 1.112 kg/m³ (lower troposphere)
                    { height: 5e3,    density: 0.73600 },   // 5 km: 0.736 kg/m³ (mid troposphere)
                    { height: 11e3,   density: 0.36391 },   // 11 km: 0.364 kg/m³ (tropopause)
                    { height: 20e3,   density: 0.08891 },   // 20 km: 0.089 kg/m³ (stratosphere)
                    { height: 32e3,   density: 0.01330 },   // 32 km: 0.013 kg/m³ (mid stratosphere)
                    { height: 47e3,   density: 0.00143 },   // 47 km: 0.001 kg/m³ (stratopause)
                    { height: 51e3,   density: 0.00086 },   // 51 km: 0.0009 kg/m³ (lower mesosphere)
                    { height: 71e3,   density: 0.000064 },  // 71 km: 6.4e-5 kg/m³ (mid mesosphere)
                    { height: 86e3,   density: 0.000013 },  // 86 km: 1.3e-5 kg/m³ (mesopause)
                    { height: 100e3,  density: 5.6e-7 },    // 100 km: 5.6e-7 kg/m³ (Kármán line - space boundary)
                    { height: 120e3,  density: 9.0e-8 },    // 120 km: 9e-8 kg/m³ (thermosphere)
                    { height: 150e3,  density: 1.0e-8 },    // 150 km: 1e-8 kg/m³ (upper thermosphere)
                    { height: 200e3,  density: 2.0e-9 },    // 200 km: 2e-9 kg/m³ (satellite altitude)
                    { height: 300e3,  density: 2.0e-10 },   // 300 km: 2e-10 kg/m³ (ISS altitude region)
                    { height: 400e3,  density: 3.9e-11 },   // 400 km: 3.9e-11 kg/m³ (ISS orbit)
                    { height: 600e3,  density: 1.0e-12 }    // 600 km: 1e-12 kg/m³ (exosphere)
                ],
                color: 'rgba(135, 206, 250, 0.50)',          // Light blue atmosphere
            },
            
            // Orbital elements (reference orbit - 1 AU by definition)
            orbit: {
                semiMajorAxis: 1.000 * 149597870700,           // Semi-major axis: exactly 1 AU
                eccentricity: 0.017,                           // Low eccentricity (nearly circular)
                inclination: 0.00005 * (Math.PI / 180),        // Very small inclination (reference plane)
                longitudeOfAscendingNode: -11.26064 * (Math.PI / 180), // Ascending node
                argumentOfPeriapsis: 114.20783 * (Math.PI / 180),      // Argument of periapsis
                meanAnomalyAtEpoch: 357.51716 * (Math.PI / 180),       // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === MARS ===
        // Fourth planet from Sun, the "Red Planet"
        mars: {
            name: 'Mars',                  // Display name
            mass: 6.4171e23,              // Mass in kilograms (11% of Earth's mass)
            radius: 3389.92,              // Mean radius in kilometers (53% of Earth's radius)
            color: 'red',                 // Red color (iron oxide on surface)
            
            // Thin carbon dioxide atmosphere with realistic density profile
            // Surface pressure ~610 Pa, temperature ~210 K
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.0200 },    // Surface: 0.020 kg/m³ (~610 Pa, ~210 K, CO₂)
                    { height: 5e3,    density: 0.0110 },    // 5 km: 0.011 kg/m³ (lower atmosphere)
                    { height: 10e3,   density: 0.0070 },    // 10 km: 0.007 kg/m³ (mid atmosphere)
                    { height: 20e3,   density: 0.0025 },    // 20 km: 0.0025 kg/m³ (upper atmosphere)
                    { height: 30e3,   density: 0.0010 },    // 30 km: 0.001 kg/m³ (high altitude)
                    { height: 40e3,   density: 0.00035 },   // 40 km: 0.00035 kg/m³ (very thin)
                    { height: 50e3,   density: 0.00012 },   // 50 km: 0.00012 kg/m³ (stratosphere)
                    { height: 60e3,   density: 4.0e-5 },    // 60 km: 4e-5 kg/m³ (mesosphere)
                    { height: 80e3,   density: 7.0e-6 },    // 80 km: 7e-6 kg/m³ (thermosphere)
                    { height: 100e3,  density: 1.0e-6 }     // 100 km: 1e-6 kg/m³ (exosphere)
                ],
                color: 'rgba(255, 0, 0, 0.30)',              // Red haze for dust storms
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 1.524 * 149597870700,           // Semi-major axis: 1.524 AU
                eccentricity: 0.093,                           // Moderate eccentricity
                inclination: 1.850 * (Math.PI / 180),          // Orbital inclination: 1.85°
                longitudeOfAscendingNode: 49.57854 * (Math.PI / 180),  // Ascending node
                argumentOfPeriapsis: 286.46230 * (Math.PI / 180),      // Argument of periapsis
                meanAnomalyAtEpoch: 19.412 * (Math.PI / 180),  // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === JUPITER ===
        // Fifth planet from Sun, largest gas giant
        jupiter: {
            name: 'Jupiter',               // Display name
            mass: 1.89819e27,             // Mass in kilograms (318x Earth's mass, 2.5x all other planets)
            radius: 69911,                // Mean radius in kilometers (11x Earth's radius)
            color: '#DAA520',             // Dark golden rod color (cloud bands)
            
            // Dense hydrogen-helium atmosphere with exponential density profile
            // Scale height ~25 km, reference density at 1-bar level
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.160 },      // 1-bar level (conventional "surface"): 0.16 kg/m³
                    { height: 25e3,   density: 0.0589 },     // 25 km above 1-bar: 0.059 kg/m³ (scale height)
                    { height: 50e3,   density: 0.0217 },     // 50 km: 0.022 kg/m³ (upper atmosphere)
                    { height: 75e3,   density: 0.0080 },     // 75 km: 0.008 kg/m³ (high altitude)
                    { height: 100e3,  density: 0.00293 },    // 100 km: 0.003 kg/m³ (stratosphere)
                    { height: 125e3,  density: 0.00108 },    // 125 km: 0.001 kg/m³ (mesosphere)
                    { height: 150e3,  density: 0.000397 },   // 150 km: 0.0004 kg/m³ (thermosphere)
                    { height: 200e3,  density: 5.37e-5 },    // 200 km: 5.4e-5 kg/m³ (upper atmosphere)
                    { height: 300e3,  density: 9.83e-7 },    // 300 km: 9.8e-7 kg/m³ (ionosphere)
                    { height: 400e3,  density: 1.80e-8 }     // 400 km: 1.8e-8 kg/m³ (exosphere)
                ],
                color: 'rgba(218, 165, 32, 0.30)',           // Golden atmospheric haze
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 5.203 * 149597870700,           // Semi-major axis: 5.203 AU
                eccentricity: 0.048,                           // Low eccentricity
                inclination: 1.305 * (Math.PI / 180),          // Orbital inclination: 1.305°
                longitudeOfAscendingNode: 100.55615 * (Math.PI / 180), // Ascending node
                argumentOfPeriapsis: 273.867 * (Math.PI / 180),        // Argument of periapsis
                meanAnomalyAtEpoch: 20.020 * (Math.PI / 180),  // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === SATURN ===
        // Sixth planet from Sun, famous for its ring system
        saturn: {
            name: 'Saturn',                // Display name
            mass: 5.6834e26,              // Mass in kilograms (95x Earth's mass)
            radius: 58232,                // Mean radius in kilometers (9x Earth's radius)
            color: '#FAD5A5',             // Wheat color (less dense than water)
            
            // Hydrogen-helium atmosphere with larger scale height than Jupiter
            // Scale height ~52 km, less dense than Jupiter
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.190 },      // 1-bar level: 0.19 kg/m³ (slightly denser than Jupiter)
                    { height: 50e3,   density: 0.0726 },     // 50 km: 0.073 kg/m³ (scale height ~52 km)
                    { height: 100e3,  density: 0.0278 },     // 100 km: 0.028 kg/m³ (upper atmosphere)
                    { height: 150e3,  density: 0.0106 },     // 150 km: 0.011 kg/m³ (high altitude)
                    { height: 200e3,  density: 0.00406 },    // 200 km: 0.004 kg/m³ (stratosphere)
                    { height: 250e3,  density: 0.00156 },    // 250 km: 0.002 kg/m³ (mesosphere)
                    { height: 300e3,  density: 0.000600 },   // 300 km: 0.0006 kg/m³ (thermosphere)
                    { height: 400e3,  density: 0.000189 },   // 400 km: 0.0002 kg/m³ (upper atmosphere)
                    { height: 600e3,  density: 1.82e-5 }     // 600 km: 1.8e-5 kg/m³ (exosphere)
                ],
                color: 'rgba(250, 213, 165, 0.30)',          // Pale atmospheric haze
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 9.537 * 149597870700,           // Semi-major axis: 9.537 AU
                eccentricity: 0.054,                           // Low eccentricity
                inclination: 2.485 * (Math.PI / 180),          // Orbital inclination: 2.485°
                longitudeOfAscendingNode: 113.665 * (Math.PI / 180),   // Ascending node
                argumentOfPeriapsis: 339.392 * (Math.PI / 180),        // Argument of periapsis
                meanAnomalyAtEpoch: 317.020 * (Math.PI / 180), // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === URANUS ===
        // Seventh planet from Sun, ice giant tilted on its side
        uranus: {
            name: 'Uranus',                // Display name
            mass: 8.6813e25,              // Mass in kilograms (14.5x Earth's mass)
            radius: 25362,                // Mean radius in kilometers (4x Earth's radius)
            color: '#4FD0E3',             // Cyan color (methane in atmosphere)
            
            // Hydrogen-helium-methane atmosphere with smaller scale height
            // Scale height ~27.6 km, denser than Saturn at 1-bar level
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.420 },      // 1-bar level: 0.42 kg/m³ (ice giant density)
                    { height: 25e3,   density: 0.170 },      // 25 km: 0.17 kg/m³ (scale height ~27.6 km)
                    { height: 50e3,   density: 0.0686 },     // 50 km: 0.069 kg/m³ (upper atmosphere)
                    { height: 75e3,   density: 0.0277 },     // 75 km: 0.028 kg/m³ (high altitude)
                    { height: 100e3,  density: 0.0112 },     // 100 km: 0.011 kg/m³ (stratosphere)
                    { height: 125e3,  density: 0.00453 },    // 125 km: 0.0045 kg/m³ (mesosphere)
                    { height: 150e3,  density: 0.00184 },    // 150 km: 0.0018 kg/m³ (thermosphere)
                    { height: 200e3,  density: 0.000302 },   // 200 km: 0.0003 kg/m³ (upper atmosphere)
                    { height: 300e3,  density: 1.08e-5 },    // 300 km: 1.1e-5 kg/m³ (ionosphere)
                    { height: 400e3,  density: 3.86e-7 }     // 400 km: 3.9e-7 kg/m³ (exosphere)
                ],
                color: 'rgba(79, 208, 227, 0.30)',           // Cyan atmospheric haze
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 19.19 * 149597870700,           // Semi-major axis: 19.19 AU
                eccentricity: 0.047,                           // Low eccentricity
                inclination: 0.773 * (Math.PI / 180),          // Orbital inclination: 0.773°
                longitudeOfAscendingNode: 74.006 * (Math.PI / 180),    // Ascending node
                argumentOfPeriapsis: 96.998 * (Math.PI / 180), // Argument of periapsis
                meanAnomalyAtEpoch: 142.238 * (Math.PI / 180), // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
        
        // === NEPTUNE ===
        // Eighth and outermost planet, windiest planet in solar system
        neptune: {
            name: 'Neptune',               // Display name
            mass: 1.02409e26,             // Mass in kilograms (17x Earth's mass)
            radius: 24624,                // Mean radius in kilometers (3.9x Earth's radius)
            color: '#4169E1',             // Royal blue color (methane absorption)
            
            // Hydrogen-helium-methane atmosphere, densest of the ice giants
            // Scale height ~19.2 km, highest density at 1-bar level
            atmosphere: {
                layers: [
                    { height: 0,      density: 0.450 },      // 1-bar level: 0.45 kg/m³ (densest ice giant)
                    { height: 20e3,   density: 0.159 },      // 20 km: 0.16 kg/m³ (scale height ~19.2 km)
                    { height: 40e3,   density: 0.0560 },     // 40 km: 0.056 kg/m³ (upper atmosphere)
                    { height: 60e3,   density: 0.0198 },     // 60 km: 0.020 kg/m³ (high altitude)
                    { height: 80e3,   density: 0.00698 },    // 80 km: 0.007 kg/m³ (stratosphere)
                    { height: 100e3,  density: 0.00246 },    // 100 km: 0.0025 kg/m³ (mesosphere)
                    { height: 120e3,  density: 0.000867 },   // 120 km: 0.0009 kg/m³ (thermosphere)
                    { height: 160e3,  density: 0.000122 },   // 160 km: 0.0001 kg/m³ (upper atmosphere)
                    { height: 200e3,  density: 1.72e-5 },    // 200 km: 1.7e-5 kg/m³ (ionosphere)
                    { height: 300e3,  density: 6.62e-7 }     // 300 km: 6.6e-7 kg/m³ (exosphere)
                ],
                color: 'rgba(65, 105, 225, 0.30)',           // Blue atmospheric haze
            },
            
            // Orbital elements
            orbit: {
                semiMajorAxis: 30.07 * 149597870700,           // Semi-major axis: 30.07 AU
                eccentricity: 0.009,                           // Very low eccentricity (nearly circular)
                inclination: 1.769 * (Math.PI / 180),          // Orbital inclination: 1.769°
                longitudeOfAscendingNode: 131.784 * (Math.PI / 180),   // Ascending node
                argumentOfPeriapsis: 265.646 * (Math.PI / 180),        // Argument of periapsis
                meanAnomalyAtEpoch: 256.228 * (Math.PI / 180), // Mean anomaly at epoch
                epochTime: 0,                                  // Reference epoch
            },
        },
    };

    // === REAL NASA JPL POSITION DATA ===
    // Actual positions and velocities from NASA JPL Horizons system
    // Date: 2025-Sep-08 00:00:00.0000 TDB (Barycentric Dynamical Time)
    // This ensures the simulation starts with real planetary positions
    static initialConditions = {
        // Sun position (at solar system barycenter for this epoch)
        sun: {
            position: { x: 0, y: 0 },                         // Sun at origin of coordinate system
            velocity: { x: 0, y: 0 }                          // Sun considered stationary for this simulation
        },
        
        // Mercury position (in AU, converted to meters)
        mercury: {
            position: {
                x: -2.833038099203199E-01 * Body.AU_TO_METERS, // X position: -0.283 AU
                y: 1.901776638931361E-01 * Body.AU_TO_METERS   // Y position: +0.190 AU
            },
            velocity: null // Will be calculated for circular orbit approximation
        },
        
        // Venus position
        venus: {
            position: {
                x: -2.710618632817853E-02 * Body.AU_TO_METERS, // X position: -0.027 AU
                y: 7.135856161465192E-01 * Body.AU_TO_METERS   // Y position: +0.714 AU
            },
            velocity: null // Will be calculated
        },
        
        // Earth position
        earth: {
            position: {
                x: 9.704340004273962E-01 * Body.AU_TO_METERS,  // X position: +0.970 AU
                y: -2.618862968968059E-01 * Body.AU_TO_METERS  // Y position: -0.262 AU
            },
            velocity: null // Will be calculated
        },
        
        // Mars position
        mars: {
            position: {
                x: -1.178115270090020E+00 * Body.AU_TO_METERS, // X position: -1.178 AU
                y: -1.049489611879400E+00 * Body.AU_TO_METERS  // Y position: -1.049 AU
            },
            velocity: null // Will be calculated
        },
        
        // Jupiter position
        jupiter: {
            position: {
                x: -8.466952031645225E-01 * Body.AU_TO_METERS, // X position: -0.847 AU
                y: 5.095364448593986E+00 * Body.AU_TO_METERS   // Y position: +5.095 AU
            },
            velocity: null // Will be calculated
        },
        
        // Saturn position
        saturn: {
            position: {
                x: 9.535171005165544E+00 * Body.AU_TO_METERS,  // X position: +9.535 AU
                y: -3.878464193250671E-01 * Body.AU_TO_METERS  // Y position: -0.388 AU
            },
            velocity: null // Will be calculated
        },
        
        // Uranus position
        uranus: {
            position: {
                x: 1.026780683841551E+01 * Body.AU_TO_METERS,  // X position: +10.268 AU
                y: 1.658184090630679E+01 * Body.AU_TO_METERS   // Y position: +16.582 AU
            },
            velocity: null // Will be calculated
        },
        
        // Neptune position
        neptune: {
            position: {
                x: 2.987544044485914E+01 * Body.AU_TO_METERS,  // X position: +29.875 AU
                y: 1.502892955356041E-01 * Body.AU_TO_METERS   // Y position: +0.150 AU
            },
            velocity: null // Will be calculated
        }
    };

    /**
     * Constructor - Create a new celestial body
     * 
     * @param {string} planetKey - Key from planetData to initialize (optional)
     *                           If provided, initializes with real planetary data
     *                           If null, creates empty body for manual configuration
     */
    constructor(planetKey = null) {
        // Initialize basic properties with default values
        this.name = '';                                    // Display name of the body
        this.mass = 0;                                     // Mass in kilograms
        this.radius = 0;                                   // Radius in kilometers
        this.color = 'white';                             // Color for visualization
        this.position = { x: 0, y: 0 };                   // Position in meters (world coordinates)
        this.velocity = { x: 0, y: 0 };                   // Velocity in meters/second
        this.previousAcceleration = { x: 0, y: 0 };       // Previous acceleration for Verlet integration
        this.trail = null;                                // Array of previous positions for orbital trails
        this.atmosphere = null;                           // Atmospheric properties (if any)

        // If a planet key is provided, initialize with that planet's real data
        if (planetKey && Body.planetData[planetKey]) {
            this.initializeFromPlanet(planetKey);
        }
    }

    /**
     * Initialize Body from Planetary Database
     * Sets up the body with real astronomical data
     * 
     * @param {string} planetKey - Key from planetData (e.g., 'earth', 'mars')
     */
    initializeFromPlanet(planetKey) {
        // Get planetary data and initial conditions from static databases
        const planetData = Body.planetData[planetKey];
        const initialData = Body.initialConditions[planetKey];
        
        // Validate that data exists for this planet
        if (!planetData || !initialData) {
            console.error(`Planet data not found for: ${planetKey}`);
            return;
        }

        // Set basic properties from planetary database
        this.name = planetData.name;                       // Official planet name
        this.mass = planetData.mass;                       // Mass in kilograms
        this.radius = planetData.radius;                   // Radius in kilometers
        this.color = planetData.color;                     // Display color
        this.position = { ...initialData.position };       // Copy real NASA position data
        this.atmosphere = planetData.atmosphere;           // Atmospheric properties (realistic models)
        
        // Calculate initial velocity based on body type
        if (planetKey === 'sun') {
            // Sun is stationary in our coordinate system
            this.velocity = { ...initialData.velocity };   // Zero velocity for Sun
        } else {
            // Planets: calculate circular orbit velocity around the Sun
            const sunMass = Body.planetData.sun.mass;      // Get Sun's mass for gravity calculation
            this.velocity = Body.calculateCircularOrbitVelocity(this.position, sunMass);
        }

        // Initialize orbital trail for visualization (planets only, not Sun)
        this.trail = planetKey === 'sun' ? null : [];      // Empty array for planets, null for Sun
    }

    /**
     * Calculate Circular Orbit Velocity
     * Computes the velocity needed for a stable circular orbit around a central mass
     * 
     * @param {object} position - Current position {x, y} in meters
     * @param {number} centralMass - Mass of central body in kilograms
     * @returns {object} Velocity vector {x, y} in meters/second
     */
    static calculateCircularOrbitVelocity(position, centralMass) {
        // Calculate distance from central body (orbital radius)
        const r = Math.sqrt(position.x * position.x + position.y * position.y);
        
        // Calculate orbital velocity magnitude using vis-viva equation for circular orbits
        // v = sqrt(GM/r) where G is gravitational constant, M is central mass, r is radius
        const v = Math.sqrt(Body.GRAVITATIONAL_CONSTANT * centralMass / r);
        
        // Velocity direction is perpendicular to position vector (tangent to orbit)
        // This creates a circular orbit in the direction of positive angular momentum
        return {
            x: -v * position.y / r,                       // X component of velocity
            y: v * position.x / r                         // Y component of velocity
        };
    }

    /**
     * Get Atmospheric Density at Altitude (Static Method)
     * Calculates atmospheric density at a given altitude above the surface
     * Used for atmospheric drag calculations on spacecraft
     * Enhanced with realistic atmospheric models for all planets
     * 
     * @param {object} planet - Planet object with atmosphere data
     * @param {number} altitude - Altitude above surface in meters
     * @returns {number} Atmospheric density in kg/m³
     */
    static getAtmosphereDensity(planet, altitude) {
        // Check if planet has atmospheric data
        if (!planet.atmosphere || !planet.atmosphere.layers) {
            return 0; // No atmosphere - return zero density (Mercury, for example)
        }

        const layers = planet.atmosphere.layers;
        
        // Find appropriate atmospheric layer for this altitude
        for (let i = 0; i < layers.length - 1; i++) {
            const currentLayer = layers[i];
            const nextLayer = layers[i + 1];
            
            // Check if altitude is within this layer
            if (altitude >= currentLayer.height && altitude < nextLayer.height) {
                // Linear interpolation between layer densities
                // This provides smooth density transitions between atmospheric layers
                const t = (altitude - currentLayer.height) / (nextLayer.height - currentLayer.height);
                return currentLayer.density * (1 - t) + nextLayer.density * t;
            }
        }
        
        // Above highest atmospheric layer - return final layer density (usually very low or 0)
        return layers[layers.length - 1].density;
    }

    // === GETTER METHODS ===
    // These methods provide access to body properties in a controlled way

    /**
     * Get Mass
     * @returns {number} Mass in kilograms
     */
    getMass() {
        return this.mass;
    }

    /**
     * Get Position
     * @returns {object} Position vector {x, y} in meters
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get Velocity
     * @returns {object} Velocity vector {x, y} in meters/second
     */
    getVelocity() {
        return this.velocity;
    }

    // === SETTER METHODS ===
    // These methods allow controlled modification of body properties

    /**
     * Set Position
     * @param {number} x - X coordinate in meters
     * @param {number} y - Y coordinate in meters
     */
    setPosition(x, y) {
        this.position = { x: x, y: y };
    }

    /**
     * Set Velocity
     * @param {number} vx - X velocity component in meters/second
     * @param {number} vy - Y velocity component in meters/second
     */
    setVelocity(vx, vy) {
        this.velocity = { x: vx, y: vy };
    }

    /**
     * Set Mass
     * @param {number} mass - Mass in kilograms
     */
    setMass(mass) {
        this.mass = mass;
    }

    /**
     * Set Name
     * @param {string} name - Display name for the body
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Set Color
     * @param {string} color - Color for visualization (CSS color format)
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Set Radius
     * @param {number} radius - Radius in kilometers
     */
    setRadius(radius) {
        this.radius = radius;
    }

    // === DISPLAY AND RENDERING METHODS ===
    // These methods support visualization at different scales

    /**
     * Get Display Radius (Legacy Logarithmic Scaling)
     * Provides logarithmic scaling for bodies when not using real scale
     * This makes all bodies visible regardless of their actual size
     * 
     * @returns {number} Display radius in pixels
     */
    getDisplayRadius() {
        // Logarithmic scaling based on mass for better visualization
        // Ensures even small bodies are visible while keeping relative sizes reasonable
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    /**
     * Get Atmospheric Density at Altitude (Instance Method)
     * Instance version of the static atmospheric density method
     * Enhanced with realistic atmospheric models
     * 
     * @param {number} altitude - Altitude above surface in meters
     * @returns {number} Atmospheric density in kg/m³
     */
    getAtmosphereDensity(altitude) {
        // Return 0 if no atmospheric data
        if (!this.atmosphere || !this.atmosphere.layers) return 0;

        // Find the appropriate atmospheric layer based on altitude
        for (let i = 0; i < this.atmosphere.layers.length - 1; i++) {
            const layer = this.atmosphere.layers[i];
            const nextLayer = this.atmosphere.layers[i + 1];
            
            // Check if altitude falls within this layer
            if (altitude >= layer.height && altitude < nextLayer.height) {
                // Linear interpolation between layer densities for smooth transitions
                const t = (altitude - layer.height) / (nextLayer.height - layer.height);
                return layer.density * (1 - t) + nextLayer.density * t;
            }
        }

        // If above the highest layer, return 0 or the last layer's density
        const lastLayer = this.atmosphere.layers[this.atmosphere.layers.length - 1];
        return altitude >= lastLayer.height ? 0 : lastLayer.density;
    }

    /**
     * Get Scale Height for Exponential Atmosphere
     * Calculates the atmospheric scale height for exponential density models
     * Useful for understanding atmospheric structure
     * 
     * @returns {number|null} Scale height in meters, or null if no atmosphere
     */
    getAtmosphericScaleHeight() {
        if (!this.atmosphere || !this.atmosphere.layers || this.atmosphere.layers.length < 2) {
            return null; // No atmosphere data available
        }

        // Calculate approximate scale height from first two layers
        const layer1 = this.atmosphere.layers[0];
        const layer2 = this.atmosphere.layers[1];
        
        if (layer1.density <= 0 || layer2.density <= 0) {
            return null; // Invalid density data
        }

        // Scale height H = Δh / ln(ρ₁/ρ₂)
        const deltaH = layer2.height - layer1.height;
        const densityRatio = layer1.density / layer2.density;
        
        if (densityRatio <= 1) {
            return null; // Density should decrease with altitude
        }

        return deltaH / Math.log(densityRatio);
    }

    /**
     * Get Surface Pressure (Approximate)
     * Estimates surface pressure based on atmospheric density
     * Uses ideal gas law approximation
     * 
     * @returns {number} Estimated surface pressure in Pascals
     */
    getApproximateSurfacePressure() {
        if (!this.atmosphere || !this.atmosphere.layers || this.atmosphere.layers.length === 0) {
            return 0; // No atmosphere
        }

        const surfaceLayer = this.atmosphere.layers[0];
        
        // Approximate pressure using ideal gas law and typical planetary values
        // P ≈ ρgh where ρ is density, g is surface gravity, h is scale height
        const surfaceGravity = this.getSurfaceGravity();
        const scaleHeight = this.getAtmosphericScaleHeight() || 10000; // Default 10 km if unknown
        
        return surfaceLayer.density * surfaceGravity * scaleHeight;
    }

    /**
     * Get Surface Gravity
     * Calculates surface gravity for the celestial body
     * 
     * @returns {number} Surface gravity in m/s²
     */
    getSurfaceGravity() {
        const radiusMeters = this.radius * 1000; // Convert km to meters
        return (Body.GRAVITATIONAL_CONSTANT * this.mass) / (radiusMeters * radiusMeters);
    }

    /**
     * Get Radius in Meters
     * Converts radius from kilometers to meters for calculations
     * 
     * @returns {number} Radius in meters
     */
    getRadiusInMeters() {
        return this.radius * 1000; // Convert kilometers to meters
    }

    /**
     * Get World-Space Radius for Rendering
     * Returns the actual physical radius in meters for scale-accurate rendering
     * Used by the coordinate system for true-scale visualization
     * 
     * @returns {number} Radius in meters (world space)
     */
    getWorldRadius() {
        return this.getRadiusInMeters(); // Same as getRadiusInMeters for consistency
    }

    /**
     * Get Minimum Display Radius
     * Returns minimum size in pixels to ensure body visibility
     * Used as fallback when calculated size would be too small to see
     * 
     * @returns {number} Minimum radius in pixels
     */
    getMinDisplayRadius() {
        return 2; // Minimum 2 pixels for visibility on any display
    }

    /**
     * Get Atmospheric Information Summary
     * Returns a comprehensive summary of atmospheric properties
     * Useful for UI display and debugging
     * 
     * @returns {object|null} Atmospheric summary object or null if no atmosphere
     */
    getAtmosphericSummary() {
        if (!this.atmosphere) {
            return null;
        }

        const scaleHeight = this.getAtmosphericScaleHeight();
        const surfacePressure = this.getApproximateSurfacePressure();
        const surfaceGravity = this.getSurfaceGravity();

        return {
            hasAtmosphere: true,
            layerCount: this.atmosphere.layers.length,
            surfaceDensity: this.atmosphere.layers[0].density,
            scaleHeight: scaleHeight,
            estimatedSurfacePressure: surfacePressure,
            surfaceGravity: surfaceGravity,
            atmosphericColor: this.atmosphere.color,
            maxAltitude: this.atmosphere.layers[this.atmosphere.layers.length - 1].height
        };
    }
}

// === BACKWARD COMPATIBILITY EXPORT ===
// Export the planetary data for legacy code that expects BodyData
export const BodyData = Body.planetData;



