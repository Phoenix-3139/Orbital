import { UniversalCoordinateSystem } from '../CoordinateSystem.js';

/**
 * Camera Controller
 * Manages camera modes, scaling, and coordinate system interactions
 * Supports modes 1-3: Solar System, Inner Planets, Planet Focus
 */
export class CameraController {
    constructor(canvasWidth, canvasHeight) {
        this.coordSystem = new UniversalCoordinateSystem(canvasWidth, canvasHeight);
    }

    /**
     * Initialize camera system (from original _initState method)
     */
    initCamera(cameraMode, targetPlanet, bodies, enableCameraSmoothing, planetScaleBoost, 
               overridePlanetScaling, manualSunMultiplier, manualPlanetMultiplier, 
               minPlanetPixels, manualZoom) {
        
        let targetPlanetObj = null;
        
        // If in planet mode (3) and target planet is specified
        if (cameraMode === 3 && targetPlanet) {
            // replaced find() + arrow function with simple loop for readability
            const tpLower = String(targetPlanet).toLowerCase();
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                if (!b || !b.name) { continue; }
                if (b.name.toLowerCase() === tpLower) {
                    targetPlanetObj = b;
                    break;
                }
            }
            
            if (!targetPlanetObj) {
                console.warn(`Target planet "${targetPlanet}" not found in bodies list.`);
            }
        }
        
        // Set camera mode using editor property (1, 2, or 3)
        this.coordSystem.setCameraModeByNumber(cameraMode, targetPlanetObj);
        
        // Configure camera smoothing based on editor setting
        this.coordSystem.smoothTransitions = enableCameraSmoothing;
        
        // Apply enhanced planet scaling for Mode 3
        this._applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels);
        
        // Apply manual scaling overrides if enabled in editor
        if (overridePlanetScaling) {
            this._applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels);
        }
        
        // Apply manual zoom adjustment if specified
        if (manualZoom !== 1.0) {
            this.coordSystem.zoom(manualZoom);
        }

        console.log('Camera System initialized with enhanced planet rendering');
        console.log(`Mode: ${cameraMode} (${this.coordSystem.cameraMode})`);
        console.log(`Scale: ${this.coordSystem.getScaleDescription()}`);
        console.log(`Planet Scale Boost: ${planetScaleBoost}x`);
    }

    /**
     * Apply Enhanced Planet Scaling for Mode 3 (from original method)
     */
    _applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels) {
        const currentMode = this.coordSystem.cameraMode;
        
        if (currentMode === 'PLANET') {
            this.coordSystem.planetSizeMultipliers[currentMode] = {
                sunMultiplier: 0.02,
                planetMultiplier: 5.0 * planetScaleBoost,
                minPixelSize: Math.max(8.0, minPlanetPixels)
            };
            
            console.log(`Enhanced planet scaling applied for Mode 3:`);
            console.log(`  Planet Multiplier: ${5.0 * planetScaleBoost}x`);
            console.log(`  Minimum Size: ${Math.max(8.0, minPlanetPixels)} pixels`);
        }
        
        console.log(`Enhanced planet scaling applied for Mode ${cameraMode}:`);
        console.log(`  Current Mode: ${currentMode}`);
        console.log(`  Planet Multiplier: ${this.coordSystem.planetSizeMultipliers[currentMode].planetMultiplier}x`);
    }

    /**
     * Apply Manual Scaling Overrides (from original method)
     */
    _applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels) {
        const currentMode = this.coordSystem.cameraMode;
        
        this.coordSystem.planetSizeMultipliers[currentMode] = {
            sunMultiplier: manualSunMultiplier,
            planetMultiplier: manualPlanetMultiplier,
            minPixelSize: minPlanetPixels
        };
        
        console.log(`Manual scaling applied - Sun: ${manualSunMultiplier}x, Planets: ${manualPlanetMultiplier}x`);
    }

    /**
     * Update Camera System
     */
    updateCamera(cameraMode, targetPlanet, bodies, planetScaleBoost, overridePlanetScaling, manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels, manualZoom) {
        // Check if camera mode changed in editor during runtime
        if (this.coordSystem.cameraMode !== this._getCurrentModeString(cameraMode)) {
            let targetPlanetObj = null;
            
            if (cameraMode === 3 && targetPlanet) {
                // replaced find() + arrow function with simple loop
                const tpLower = String(targetPlanet).toLowerCase();
                for (let i = 0; i < bodies.length; i++) {
                    const b = bodies[i];
                    if (!b || !b.name) { continue; }
                    if (b.name.toLowerCase() === tpLower) {
                        targetPlanetObj = b;
                        break;
                    }
                }
            }
            
            this.coordSystem.setCameraModeByNumber(cameraMode, targetPlanetObj);
            this._applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels);
            
            if (overridePlanetScaling) {
                this._applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels);
            }
        }

        // Apply real-time scaling updates
        if (cameraMode === 3) {
            this._applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels);
        }
        
        if (overridePlanetScaling) {
            this._applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels);
        }

        // Update camera position if following a planet in planet mode
        if (cameraMode === 3 && targetPlanet) {
            
            let target = null;
            const tpLower = String(targetPlanet).toLowerCase();
            for (let i = 0; i < bodies.length; i++) {
                const b = bodies[i];
                if (!b || !b.name) { continue; }
                if (b.name.toLowerCase() === tpLower) {
                    target = b;
                    break;
                }
            }
            
            if (target) {
                this.coordSystem.targetPlanet = target;
                this.coordSystem.updateCamera();
            }
        }

        // Adaptive scaling for mode 3
        if (cameraMode === 3 && targetPlanet) {
            this._configurePlanetFocusView(targetPlanet, bodies, planetScaleBoost, manualZoom);
        }
    }

    /**
     * Get Current Camera Mode as String
     */
    _getCurrentModeString(cameraMode) {
        const modes = {
            1: 'SOLAR_SYSTEM',
            2: 'INNER_PLANETS',
            3: 'PLANET',
        };
        return modes[cameraMode];
    }

    /**
     * Adaptive planet focus for mode 3.
     */
    _configurePlanetFocusView(targetPlanetName, bodies, planetScaleBoost, manualZoom) {
        
        let planet = null;
        const tpLower = String(targetPlanetName).toLowerCase();
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            if (!b || !b.name) { continue; }
            if (b.name.toLowerCase() === tpLower) {
                planet = b;
                break;
            }
        }
        if (!planet) {
            console.warn(`Planet ${targetPlanetName} not found for focus mode`);
            return;
        }

        // Use custom scale if available, else fallback to default
        const scale = planetScales[planet.name.toLowerCase()] || 5e5;
        const metersPerPixel = scale / (planetScaleBoost * manualZoom);

        // Center camera on planet
        this.coordSystem.setCameraPosition(planet.position.x, planet.position.y);
        this.coordSystem.setScale(metersPerPixel);
        this.coordSystem.cameraMode = 'PLANET';
    }
}

const planetScales = {
    mercury: 1e7,
    venus: 1e7,
    earth: 1e7,
    mars: 1e7,
    jupiter: 1e7,   
    saturn: 1e7,    
    uranus: 1e7,    
    neptune: 1e7,   
    
};
