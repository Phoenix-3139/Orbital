/**
 * Celestial Body Class for Solar System Simulation
 * Contains physical properties, orbital mechanics data
 */

export class Body {
   
    static AU = 149597870700;
    static G = 6.67430e-11;
    static GM_SUN = 1.32712440018e20; // m^3/s^2
    static GM_EARTH_MOON = 4.03503235502e14; // Combined Earth+Moon GM in m³/s²

    // Planetary Database with orbital properties
    static planetData = {
        sun: {
            name: 'Sun',
            mass: 1.9884e30,
            radius: 695700,
            color: 'yellow',
            SOI: 1e13,
            priority: 3,
            spritePath: 'Sun.png',
            position: { x: 0, y: 0 }
        },

        mercury: {
            name: 'Mercury',
            mass: 3.302e23, // in kg
            radius: 2439.4, // in km
            color: 'gray', 
            SOI: 1.1e7, // in meters
            priority: 1, // High priority for rendering
            spritePath: 'Mercury.png', // Path to sprite image
            orbit: {
                semiMajorAxis: 0.387 * Body.AU, // in meters
                eccentricity: 0.206, // unitless
                inclination: 7.005 * (Math.PI / 180), // in radians
                longitudeOfAscendingNode: 48.331 * (Math.PI / 180), // in radians
                argumentOfPeriapsis: 29.124 * (Math.PI / 180), // in radians
                meanAnomalyAtEpoch: 174.796 * (Math.PI / 180), // in radians
                centralBody: 'sun' // central body name
            },
            position: { x: 0, y: 0 }
        },

        venus: {
            name: 'Venus',
            mass: 4.8685e24,
            radius: 6051.84,
            color: 'orange',
            SOI: 6.2e7,
            priority: 1,
            spritePath: 'Venus.png',
            orbit: {
                semiMajorAxis: 0.723 * Body.AU,
                eccentricity: 0.007,
                inclination: 3.39458 * (Math.PI / 180),
                longitudeOfAscendingNode: 76.68069 * (Math.PI / 180),
                argumentOfPeriapsis: 54.85229 * (Math.PI / 180),
                meanAnomalyAtEpoch: 50.115 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        },

        earthMoonBarycenter: {
            name: 'Earth-Moon Barycenter',
            mass: 5.97219e24 + 7.349e22,
            radius: 0,
            color: 'transparent',
            SOI: 9.25e8,
            priority: 2,
            spritePath: 'Earth.png',
            orbit: {
                semiMajorAxis: 1.000 * Body.AU,
                eccentricity: 0.017,
                inclination: 0.00005 * (Math.PI / 180),
                longitudeOfAscendingNode: -11.26064 * (Math.PI / 180),
                argumentOfPeriapsis: 114.20783 * (Math.PI / 180),
                meanAnomalyAtEpoch: 357.51716 * (Math.PI / 180),
                epochTime: 0, // This means that at time 0, the position corresponds to the above elements
                centralBody: 'sun'
            },
            isBarycenter: true,
            position: { x: 0, y: 0 }
        },
        //the reason we have earth-moon barycenter is to have moon orbit around it instead of earth directly
        earth: {
            name: 'Earth',
            mass: 5.97219e24,
            radius: 6371.01,
            color: 'blue',
            SOI: 9.25e8,
            priority: 1,
            spritePath: 'Earth.png',
            orbit: {
                semiMajorAxis: 4671e3,
                eccentricity: 0.0549,
                inclination: 5.145 * (Math.PI / 180),
                longitudeOfAscendingNode: 125.08 * (Math.PI / 180),
                argumentOfPeriapsis: 318.15 * (Math.PI / 180),
                meanAnomalyAtEpoch: 135.27 * (Math.PI / 180),
                epochTime: 0,
                period: 27.321582 * 24 * 3600,
                centralBody: 'earthMoonBarycenter',
                gravitationalParameter: Body.GM_EARTH_MOON
            },
            position: { x: 0, y: 0 }
        },

        moon: {
            name: 'Moon',
            mass: 7.349e22,
            radius: 1737.53,
            color: 'gray',
            SOI: 6.61e7,
            priority: 1,
            satellite: 'true',
            spritePath: 'Moon.png',
            orbit: {
                semiMajorAxis: 384400e3,
                eccentricity: 0.05490,
                inclination: 5.145 * (Math.PI / 180),
                longitudeOfAscendingNode: 125.08 * (Math.PI / 180),
                argumentOfPeriapsis: 318.15 * (Math.PI / 180),
                meanAnomalyAtEpoch: 315.27 * (Math.PI / 180),
                epochTime: 0,
                period: 27.321582 * 24 * 3600,
                centralBody: 'earthMoonBarycenter',
                gravitationalParameter: Body.GM_EARTH_MOON
            },
            position: { x: 0, y: 0 }
        },

        mars: {
            name: 'Mars',
            mass: 6.4171e23,
            radius: 3389.92,
            color: 'red',
            SOI: 5.77e8,
            priority: 1,
            spritePath: 'Mars.png',
            orbit: {
                semiMajorAxis: 1.524 * Body.AU,
                eccentricity: 0.093,
                inclination: 1.850 * (Math.PI / 180),
                longitudeOfAscendingNode: 49.57854 * (Math.PI / 180),
                argumentOfPeriapsis: 286.46230 * (Math.PI / 180),
                meanAnomalyAtEpoch: 19.412 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        },

        jupiter: {
            name: 'Jupiter',
            mass: 1.89819e27,
            radius: 69911,
            color: '#DAA520',
            SOI: 4.82e9,
            priority: 1,
            spritePath: 'Jupiter.png',
            orbit: {
                semiMajorAxis: 5.203 * Body.AU,
                eccentricity: 0.048,
                inclination: 1.305 * (Math.PI / 180),
                longitudeOfAscendingNode: 100.55615 * (Math.PI / 180),
                argumentOfPeriapsis: 273.867 * (Math.PI / 180),
                meanAnomalyAtEpoch: 20.020 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        },

        saturn: {
            name: 'Saturn',
            mass: 5.6834e26,
            radius: 58232,
            color: '#FAD5A5',
            SOI: 8.5e8,
            priority: 1,
            spritePath: 'Saturn.png',
            orbit: {
                semiMajorAxis: 9.537 * Body.AU,
                eccentricity: 0.054,
                inclination: 2.485 * (Math.PI / 180),
                longitudeOfAscendingNode: 113.665 * (Math.PI / 180),
                argumentOfPeriapsis: 339.392 * (Math.PI / 180),
                meanAnomalyAtEpoch: 317.020 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        },

        uranus: {
            name: 'Uranus',
            mass: 8.6813e25,
            radius: 25362,
            color: '#4FD0E3',
            SOI: 3.9e8,
            priority: 1,
            spritePath: 'Uranus.png',
            orbit: {
                semiMajorAxis: 19.19 * Body.AU,
                eccentricity: 0.047,
                inclination: 0.773 * (Math.PI / 180),
                longitudeOfAscendingNode: 74.006 * (Math.PI / 180),
                argumentOfPeriapsis: 96.998 * (Math.PI / 180),
                meanAnomalyAtEpoch: 142.238 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        },

        neptune: {
            name: 'Neptune',
            mass: 1.02409e26,
            radius: 24624,
            color: '#4169E1',
            SOI: 2.27e8,
            priority: 1,
            spritePath: 'Neptune.png',
            orbit: {
                semiMajorAxis: 30.07 * Body.AU,
                eccentricity: 0.009,
                inclination: 1.769 * (Math.PI / 180),
                longitudeOfAscendingNode: 131.784 * (Math.PI / 180),
                argumentOfPeriapsis: 265.646 * (Math.PI / 180),
                meanAnomalyAtEpoch: 256.228 * (Math.PI / 180),
                epochTime: 0,
                centralBody: 'sun'
            },
            position: { x: 0, y: 0 }
        }
    };

    static isBarycenter(bodyKey) {
        return Body.planetData[bodyKey]?.isBarycenter === true;
    } 

    static getGravitationalParameter(bodyKey) {
        const bodyData = Body.planetData[bodyKey];
        if (bodyData?.orbit?.gravitationalParameter) {
            return bodyData.orbit.gravitationalParameter;
        }

        const centralBody = bodyData?.orbit?.centralBody;
        if (centralBody === 'sun') {
            return Body.GM_SUN;
        } else if (centralBody === 'earthMoonBarycenter') {
            return Body.GM_EARTH_MOON;
        }

        return Body.GM_SUN;
    }

    getDisplayRadius() {
        return Math.max(2, Math.log10(this.mass / 1e20) * 2);
    }

    getWorldRadius() {
        return this.radius * 1000;
    }
    
}




