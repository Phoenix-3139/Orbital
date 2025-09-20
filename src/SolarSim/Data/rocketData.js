export const RocketData = {
  // SpaceX Rockets
  falconHeavy: {
    name: 'Falcon Heavy',
    mass: 153354, // Dry mass without fuel (kg)
    fuelMass: 395700, // Total fuel mass (kg)
    thrust: 22800000, // Total thrust (N)
    specificImpulse: 282, // Sea level Isp (s)
    burnRate: 2500, // kg/s
    dragCoefficient: 0.25,
    crossSectionalArea: 11.4, // m²
    height: 70, // meters
    diameter: 3.66, // meters
    stages: [
      {
        name: 'Side Boosters + Center Core (Stage 1)',
        fuelMass: 433100, // Propellant mass for all three cores
        thrust: 22800000, // Combined thrust
        burnRate: 2500,
        specificImpulse: 282,
        burnTime: 154, // seconds
      },
      {
        name: 'Center Core Continued',
        fuelMass: 107000, // Remaining propellant in center core
        thrust: 7600000, // Single core thrust
        burnRate: 850,
        specificImpulse: 282,
        burnTime: 126,
      },
      {
        name: 'Second Stage',
        fuelMass: 107500, // Propellant mass
        thrust: 934000, // Merlin Vacuum
        burnRate: 300,
        specificImpulse: 348,
        burnTime: 358,
      }
    ]
  },

  falcon9: {
    name: 'Falcon 9 Block 5',
    mass: 25600, // Dry mass
    fuelMass: 433100, // Fuel mass
    thrust: 7607000, // 9 Merlin engines
    specificImpulse: 282,
    burnRate: 850,
    dragCoefficient: 0.3,
    crossSectionalArea: 10.5,
    height: 70,
    diameter: 3.7,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 395700,
        thrust: 7607000,
        burnRate: 850,
        specificImpulse: 282,
        burnTime: 162,
      },
      {
        name: 'Second Stage',
        fuelMass: 107500,
        thrust: 934000,
        burnRate: 300,
        specificImpulse: 348,
        burnTime: 358,
      }
    ]
  },

  starship: {
    name: 'Starship + Super Heavy',
    mass: 200000, // Dry mass
    fuelMass: 4800000, // Fuel mass
    thrust: 72000000, // 33 Raptors on Super Heavy
    specificImpulse: 350,
    burnRate: 6000,
    dragCoefficient: 0.3,
    crossSectionalArea: 78.5,
    height: 120,
    diameter: 9,
    stages: [
      {
        name: 'Super Heavy Booster',
        fuelMass: 3400000,
        thrust: 72000000,
        burnRate: 6000,
        specificImpulse: 350,
        burnTime: 150,
      },
      {
        name: 'Starship',
        fuelMass: 1400000,
        thrust: 13000000, // 6 Raptors
        burnRate: 1100,
        specificImpulse: 380,
        burnTime: 350,
      }
    ]
  },

  // Rocket Lab
  electron: {
    name: 'Electron',
    mass: 950, // Dry mass
    fuelMass: 9200,
    thrust: 227000,
    specificImpulse: 320,
    burnRate: 20,
    dragCoefficient: 0.4,
    crossSectionalArea: 1.2,
    height: 18,
    diameter: 1.2,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 8500,
        thrust: 227000,
        burnRate: 20,
        specificImpulse: 320,
        burnTime: 150,
      },
      {
        name: 'Second Stage',
        fuelMass: 700,
        thrust: 22000,
        burnRate: 2,
        specificImpulse: 343,
        burnTime: 300,
      }
    ]
  },

  neutron: {
    name: 'Neutron',
    mass: 35000, // Dry mass
    fuelMass: 445000,
    thrust: 6000000,
    specificImpulse: 320,
    burnRate: 550,
    dragCoefficient: 0.3,
    crossSectionalArea: 28.3,
    height: 43,
    diameter: 6,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 400000,
        thrust: 6000000,
        burnRate: 550,
        specificImpulse: 320,
        burnTime: 180,
      },
      {
        name: 'Second Stage',
        fuelMass: 45000,
        thrust: 980000,
        burnRate: 90,
        specificImpulse: 350,
        burnTime: 400,
      }
    ]
  },

  // NASA
  sls: {
    name: 'Space Launch System Block 1',
    mass: 85000, // Dry mass
    fuelMass: 2566000,
    thrust: 39100000, // 4 RS-25 + 2 SRBs
    specificImpulse: 269,
    burnRate: 4500,
    dragCoefficient: 0.35,
    crossSectionalArea: 33.2,
    height: 98,
    diameter: 8.4,
    stages: [
      {
        name: 'Solid Rocket Boosters',
        fuelMass: 1400000,
        thrust: 24000000,
        burnRate: 11000,
        specificImpulse: 269,
        burnTime: 126,
      },
      {
        name: 'Core Stage',
        fuelMass: 979000,
        thrust: 8800000,
        burnRate: 2100,
        specificImpulse: 452,
        burnTime: 500,
      },
      {
        name: 'Interim Cryogenic Propulsion Stage',
        fuelMass: 187000,
        thrust: 110000,
        burnRate: 25,
        specificImpulse: 462,
        burnTime: 1125,
      }
    ]
  },

  // Blue Origin
  newGlenn: {
    name: 'New Glenn',
    mass: 90000, // Dry mass
    fuelMass: 2410000,
    thrust: 17000000, // 7 BE-4 engines
    specificImpulse: 334,
    burnRate: 1400,
    dragCoefficient: 0.3,
    crossSectionalArea: 50.3,
    height: 95,
    diameter: 8,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 2200000,
        thrust: 17000000,
        burnRate: 1400,
        specificImpulse: 334,
        burnTime: 150,
      },
      {
        name: 'Second Stage',
        fuelMass: 210000,
        thrust: 1330000,
        burnRate: 350,
        specificImpulse: 445,
        burnTime: 420,
      }
    ]
  },

  newShepard: {
    name: 'New Shepard',
    mass: 5000, // Dry mass
    fuelMass: 70000,
    thrust: 490000,
    specificImpulse: 322,
    burnRate: 42,
    dragCoefficient: 0.35,
    crossSectionalArea: 7.1,
    height: 18,
    diameter: 3.8,
    stages: [
      {
        name: 'Single Stage',
        fuelMass: 70000,
        thrust: 490000,
        burnRate: 42,
        specificImpulse: 322,
        burnTime: 110,
      }
    ]
  },

  // ULA
  atlasV: {
    name: 'Atlas V 541',
    mass: 22000, // Dry mass
    fuelMass: 568000,
    thrust: 8280000, // RD-180 + 4 SRBs
    specificImpulse: 311,
    burnRate: 1100,
    dragCoefficient: 0.3,
    crossSectionalArea: 19.6,
    height: 58.3,
    diameter: 3.8,
    stages: [
      {
        name: 'Solid Rocket Boosters',
        fuelMass: 175000,
        thrust: 6800000,
        burnRate: 1500,
        specificImpulse: 275,
        burnTime: 94,
      },
      {
        name: 'Common Core Booster',
        fuelMass: 284000,
        thrust: 3827000,
        burnRate: 1050,
        specificImpulse: 311,
        burnTime: 236,
      },
      {
        name: 'Centaur Upper Stage',
        fuelMass: 109000,
        thrust: 99200,
        burnRate: 23,
        specificImpulse: 451,
        burnTime: 842,
      }
    ]
  },

  deltaIVHeavy: {
    name: 'Delta IV Heavy',
    mass: 28000, // Dry mass
    fuelMass: 705000,
    thrust: 9420000, // 3 RS-68A engines
    specificImpulse: 365,
    burnRate: 2200,
    dragCoefficient: 0.3,
    crossSectionalArea: 15.7,
    height: 72,
    diameter: 5,
    stages: [
      {
        name: 'Common Booster Cores',
        fuelMass: 630000,
        thrust: 9420000,
        burnRate: 2200,
        specificImpulse: 365,
        burnTime: 242,
      },
      {
        name: 'Delta Cryogenic Second Stage',
        fuelMass: 75000,
        thrust: 110000,
        burnRate: 25,
        specificImpulse: 462,
        burnTime: 1125,
      }
    ]
  },

  // Arianespace
  ariane5: {
    name: 'Ariane 5 ECA',
    mass: 12000, // Dry mass
    fuelMass: 765000,
    thrust: 13500000, // Vulcain 2 + 2 EAP boosters
    specificImpulse: 278,
    burnRate: 2900,
    dragCoefficient: 0.3,
    crossSectionalArea: 28.3,
    height: 46,
    diameter: 5.4,
    stages: [
      {
        name: 'Solid Rocket Boosters',
        fuelMass: 540000,
        thrust: 12000000,
        burnRate: 4200,
        specificImpulse: 275,
        burnTime: 130,
      },
      {
        name: 'Core Stage',
        fuelMass: 175000,
        thrust: 1350000,
        burnRate: 310,
        specificImpulse: 432,
        burnTime: 540,
      },
      {
        name: 'Upper Stage',
        fuelMass: 50000,
        thrust: 67000,
        burnRate: 15,
        specificImpulse: 446,
        burnTime: 945,
      }
    ]
  },

  // Historical/Retired
  saturnV: {
    name: 'Saturn V',
    mass: 40000, // Dry mass
    fuelMass: 2930000,
    thrust: 35100000, // 5 F-1 engines
    specificImpulse: 263,
    burnRate: 4500,
    dragCoefficient: 0.3,
    crossSectionalArea: 63.6,
    height: 110.6,
    diameter: 10.1,
    stages: [
      {
        name: 'S-IC First Stage',
        fuelMass: 2180000,
        thrust: 35100000,
        burnRate: 4500,
        specificImpulse: 263,
        burnTime: 168,
      },
      {
        name: 'S-II Second Stage',
        fuelMass: 490000,
        thrust: 5115000,
        burnRate: 1200,
        specificImpulse: 421,
        burnTime: 384,
      },
      {
        name: 'S-IVB Third Stage',
        fuelMass: 260000,
        thrust: 1000000,
        burnRate: 225,
        specificImpulse: 424,
        burnTime: 500,
      }
    ]
  },

  // Additional Modern Rockets
  vulcanCentaur: {
    name: 'Vulcan Centaur',
    mass: 28000, // Dry mass
    fuelMass: 565000,
    thrust: 7800000, // 2 BE-4 engines + optional SRBs
    specificImpulse: 334,
    burnRate: 650,
    dragCoefficient: 0.3,
    crossSectionalArea: 19.6,
    height: 61.6,
    diameter: 5.4,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 456000,
        thrust: 7800000,
        burnRate: 650,
        specificImpulse: 334,
        burnTime: 240,
      },
      {
        name: 'Centaur V Upper Stage',
        fuelMass: 109000,
        thrust: 99200,
        burnRate: 23,
        specificImpulse: 451,
        burnTime: 842,
      }
    ]
  },

  // Long March Family
  longMarch5B: {
    name: 'Long March 5B',
    mass: 25000, // Dry mass
    fuelMass: 837000,
    thrust: 10565000, // 4 YF-77 + 8 YF-100 engines
    specificImpulse: 310,
    burnRate: 2800,
    dragCoefficient: 0.3,
    crossSectionalArea: 28.3,
    height: 53.7,
    diameter: 5,
    stages: [
      {
        name: 'Core Stage + Boosters',
        fuelMass: 837000,
        thrust: 10565000,
        burnRate: 2800,
        specificImpulse: 310,
        burnTime: 170,
      }
    ]
  },

  // Indian ISRO
  gslvMkIII: {
    name: 'GSLV Mk III',
    mass: 28000, // Dry mass
    fuelMass: 615000,
    thrust: 13000000, // 2 S200 SRBs + L110 core
    specificImpulse: 269,
    burnRate: 2100,
    dragCoefficient: 0.35,
    crossSectionalArea: 28.3,
    height: 43.43,
    diameter: 4,
    stages: [
      {
        name: 'Solid Rocket Boosters',
        fuelMass: 474000,
        thrust: 11000000,
        burnRate: 3200,
        specificImpulse: 269,
        burnTime: 130,
      },
      {
        name: 'Core Stage L110',
        fuelMass: 110000,
        thrust: 1600000,
        burnRate: 400,
        specificImpulse: 295,
        burnTime: 240,
      },
      {
        name: 'Cryogenic Upper Stage',
        fuelMass: 31000,
        thrust: 200000,
        burnRate: 55,
        specificImpulse: 443,
        burnTime: 640,
      }
    ]
  },

  // Japanese H3
  h3: {
    name: 'H3-22L',
    mass: 16000, // Dry mass
    fuelMass: 450000,
    thrust: 8700000, // 2 LE-9 + 2 SRB-3
    specificImpulse: 365,
    burnRate: 1200,
    dragCoefficient: 0.3,
    crossSectionalArea: 19.6,
    height: 63,
    diameter: 5.2,
    stages: [
      {
        name: 'Solid Rocket Boosters',
        fuelMass: 130000,
        thrust: 5600000,
        burnRate: 1600,
        specificImpulse: 280,
        burnTime: 100,
      },
      {
        name: 'First Stage',
        fuelMass: 270000,
        thrust: 3000000,
        burnRate: 600,
        specificImpulse: 365,
        burnTime: 360,
      },
      {
        name: 'Second Stage',
        fuelMass: 50000,
        thrust: 137000,
        burnRate: 30,
        specificImpulse: 448,
        burnTime: 750,
      }
    ]
  },

  // Small/Micro Launchers
  astra: {
    name: 'Astra Rocket 3',
    mass: 1000, // Dry mass
    fuelMass: 11500,
    thrust: 340000,
    specificImpulse: 295,
    burnRate: 38,
    dragCoefficient: 0.4,
    crossSectionalArea: 2.3,
    height: 13.7,
    diameter: 1.3,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 10200,
        thrust: 340000,
        burnRate: 38,
        specificImpulse: 295,
        burnTime: 180,
      },
      {
        name: 'Second Stage',
        fuelMass: 1300,
        thrust: 10000,
        burnRate: 3,
        specificImpulse: 320,
        burnTime: 300,
      }
    ]
  },

  relativity: {
    name: 'Terran 1',
    mass: 7500, // Dry mass
    fuelMass: 52500,
    thrust: 910000,
    specificImpulse: 312,
    burnRate: 95,
    dragCoefficient: 0.35,
    crossSectionalArea: 8.0,
    height: 33.5,
    diameter: 2.2,
    stages: [
      {
        name: 'First Stage',
        fuelMass: 45000,
        thrust: 910000,
        burnRate: 95,
        specificImpulse: 312,
        burnTime: 180,
      },
      {
        name: 'Second Stage',
        fuelMass: 7500,
        thrust: 100000,
        burnRate: 12,
        specificImpulse: 343,
        burnTime: 375,
      }
    ]
  },

  // Helper method to get rocket data
  getRocketData(rocketName) {
    return this[rocketName] || null;
  },

  // Get all available rocket names
  getAvailableRockets() {
    return Object.keys(this).filter(key => typeof this[key] === 'object' && this[key].name);
  }
};