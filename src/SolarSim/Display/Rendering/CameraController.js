import { UniversalCoordinateSystem } from '../CoordinateSystem.js';

/**
 * Camera Controller
 * Manages camera modes, scaling, and coordinate system interactions
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
            targetPlanetObj = bodies.find(body => 
                body.name.toLowerCase() === targetPlanet.toLowerCase()
            );
            
            if (!targetPlanetObj) {
                console.warn(`Target planet "${targetPlanet}" not found. Available planets:`, 
                    bodies.map(b => b.name).join(', '));
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
        } else if (currentMode === 'ATMOSPHERE') {
            // Mode 4: Much larger planets for atmospheric detail
            this.coordSystem.planetSizeMultipliers[currentMode] = {
                sunMultiplier: 0.001,
                planetMultiplier: 20.0 * planetScaleBoost,
                minPixelSize: Math.max(100.0, minPlanetPixels * 10)
            };
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
     * Update Camera System (from original _updateCamera method)
     */
    updateCamera(cameraMode, targetPlanet, bodies, planetScaleBoost, overridePlanetScaling, manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels) {
        if (cameraMode === 4) {
            // Ensure we're targeting the correct planet
            const targetBody = bodies.find(body => body.name === targetPlanet);
            
            if (targetBody) {
                this._focusOnPlanetSurface(targetBody);
            } else {
                console.warn(`Target planet ${targetPlanet} not found, defaulting to Earth`);
                const earth = bodies.find(body => body.name === 'Earth');
                if (earth) this._focusOnPlanetSurface(earth);
            }
        }
        
        // Check if camera mode changed in editor during runtime
        if (this.coordSystem.cameraMode !== this._getCurrentModeString(cameraMode)) {
            let targetPlanetObj = null;
            
            if ((cameraMode === 3 || cameraMode === 4) && targetPlanet) {
                targetPlanetObj = bodies.find(body => 
                    body.name.toLowerCase() === targetPlanet.toLowerCase()
                );
            }
            
            this.coordSystem.setCameraModeByNumber(cameraMode, targetPlanetObj);
            this._applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels);
            
            if (overridePlanetScaling) {
                this._applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels);
            }
        }

        // Apply real-time scaling updates (updated for mode 4)
        if (cameraMode === 3 || cameraMode === 4) {
            this._applyEnhancedPlanetScaling(cameraMode, planetScaleBoost, minPlanetPixels);
        }
        
        if (overridePlanetScaling) {
            this._applyManualScaling(manualSunMultiplier, manualPlanetMultiplier, minPlanetPixels);
        }

        // Update camera position if following a planet in planet or atmosphere mode
        if ((cameraMode === 3 || cameraMode === 4) && targetPlanet) {
            const target = bodies.find(body => 
                body.name.toLowerCase() === targetPlanet.toLowerCase()
            );
            
            if (target) {
                this.coordSystem.targetPlanet = target;
                this.coordSystem.updateCamera();
            }
        }
    }

    /**
     * Get Current Camera Mode as String (updated for mode 4)
     */
    _getCurrentModeString(cameraMode) {
        const modes = {
            1: 'SOLAR_SYSTEM',
            2: 'INNER_PLANETS',
            3: 'PLANET',
            4: 'ATMOSPHERE'
        };
        return modes[cameraMode];
    }

    _focusOnPlanetSurface(planet) {
        // Set camera to focus on the specific planet's surface
        this.coordSystem.setTarget(planet);
        this.coordSystem.setCameraMode('ATMOSPHERE', planet);
        this.coordSystem.setScale(this._getSurfaceScale(planet));
    }

    _getSurfaceScale(planet) {
        // Return appropriate scale for surface view of specific planet
        const surfaceScales = {
            'Mercury': 1000,
            'Venus': 1200,
            'Earth': 1000,
            'Mars': 800,
            'Jupiter': 2000,
            'Saturn': 1800,
            'Uranus': 1500,
            'Neptune': 1600
        };
        
        return surfaceScales[planet.name] || 1000;
    }
}

export default CameraController;