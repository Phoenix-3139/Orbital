/*
Universal Coordinate System for Solar System Simulation
Handles coordinate transformations and camera modes for different viewing perspectives
 */
export class UniversalCoordinateSystem {
    constructor(canvasWidth = 1024, canvasHeight = 1024) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.cameraCenter = { x: 0, y: 0 };
        this.metersPerPixel = 1e9;
        this.cameraMode = 'SOLAR_SYSTEM';
        this.targetPlanet = null;
        
        // Fixed scale levels for each mode
        this.scales = {
            SOLAR_SYSTEM: 1.1e10,    // 11 million km per pixel
            INNER_PLANETS: 1e9,      // 1 million km per pixel  
            PLANET: 5e5              // 10,000 km per pixel
        };
        
        // Planet size multipliers for visibility
        this.planetSizeMultipliers = {
            SOLAR_SYSTEM: {
                sunMultiplier: 0.1,
                planetMultiplier: 50.0,
                minPixelSize: 3.0
            },
            INNER_PLANETS: {
                sunMultiplier: 0.2,
                planetMultiplier: 15.0,
                minPixelSize: 2.5
            },
            PLANET: {
                sunMultiplier: 0.05,
                planetMultiplier: 1.0,
                minPixelSize: 2.0
            }
        };
        
        this.metersPerPixel = this.scales[this.cameraMode];
    }

    // Convert world coordinates (meters) to screen coordinates (pixels)
    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.cameraCenter.x) / this.metersPerPixel + this.canvasWidth / 2;
        const screenY = (worldY - this.cameraCenter.y) / this.metersPerPixel + this.canvasHeight / 2;
        return { x: screenX, y: screenY };
    }

    // Convert screen coordinates (pixels) to world coordinates (meters)
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.canvasWidth / 2) * this.metersPerPixel + this.cameraCenter.x;
        const worldY = (screenY - this.canvasHeight / 2) * this.metersPerPixel + this.cameraCenter.y;
        return { x: worldX, y: worldY };
    }

    // Get planet size multipliers for current camera mode
    getPlanetSizeMultipliers() {
        return this.planetSizeMultipliers[this.cameraMode];
    }

    // Set camera mode by number (1: Solar System, 2: Inner Planets, 3: Planet)
    setCameraModeByNumber(modeNumber, targetPlanet = null) {
        const modes = {
            1: 'SOLAR_SYSTEM',
            2: 'INNER_PLANETS',
            3: 'PLANET'
        };
        
        const mode = modes[modeNumber];
        if (mode) {
            this.setCameraMode(mode, targetPlanet);
        } else {
            console.warn(`Invalid camera mode number: ${modeNumber}. Use 1 for Solar System, 2 for Inner Planets, 3 for Planet.`);
        }
    }

    /*
    Set camera mode directly
    mode: 'SOLAR_SYSTEM' | 'INNER_PLANETS' | 'PLANET'
    targetPlanet: optional object with .position {x,y} (can be null)
    */
    setCameraMode(mode, targetPlanet = null) {
        // validate mode
        if (!this.scales.hasOwnProperty(mode)) {
            console.warn(`setCameraMode: unknown mode "${mode}", defaulting to SOLAR_SYSTEM`);
            mode = 'SOLAR_SYSTEM';
        }

        this.cameraMode = mode;
        this.targetPlanet = targetPlanet;

        // update scale for this mode
        this.metersPerPixel = this.scales[mode];

        // choose camera center based on mode
        switch (mode) {
            case 'SOLAR_SYSTEM':
            case 'INNER_PLANETS':
                // center on system origin (Sun / barycenter)
                this.cameraCenter.x = 0;
                this.cameraCenter.y = 0;
                break;

            case 'PLANET':
                // prefer explicit planet position when provided
                if (targetPlanet && targetPlanet.position) {
                    this.cameraCenter.x = targetPlanet.position.x;
                    this.cameraCenter.y = targetPlanet.position.y;
                } else {
                    // fallback to 1 AU on x-axis so view is not undefined
                    this.cameraCenter.x = 1.496e11;
                    this.cameraCenter.y = 0;
                }
                break;
        }

        //Update camera position
        this.updateCamera();

        console.log(`Camera mode set to: ${mode}`);
    }
    
    // Update camera position based on current mode and target planet
    updateCamera() {
        if (this.cameraMode === 'PLANET' && 
            this.targetPlanet && this.targetPlanet.position) {
                this.cameraCenter.x = this.targetPlanet.position.x;
                this.cameraCenter.y = this.targetPlanet.position.y;
            
        }
    }

    // Directly set camera position in world coordinates
    setCameraPosition(x, y) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
    }

    // Set scale (meters per pixel) with limits based on camera mode
    setScale(scale) {
        const limits = {
            SOLAR_SYSTEM: { min: 1e9, max: 1e11 },
            INNER_PLANETS: { min: 5e8, max: 5e9 },
            PLANET: { min: 1e5, max: 1e8 }
        };
        
        const limit = limits[this.cameraMode];
        this.metersPerPixel = Math.max(limit.min, Math.min(limit.max, scale));
    }

    // Zoom in/out by a factor
    zoom(factor) {
        this.setScale(this.metersPerPixel / factor);
    }
}