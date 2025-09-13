/**
 * Universal Coordinate System for Solar System Simulation
 * Handles coordinate transformations and camera modes for different viewing perspectives
 */
export class UniversalCoordinateSystem {
    constructor(canvasWidth = 1024, canvasHeight = 1024) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.cameraCenter = { x: 0, y: 0 };
        this.metersPerPixel = 1e9;
        this.cameraMode = 'SOLAR_SYSTEM';
        this.targetPlanet = null;
        
        // Fixed scale levels for each mode (updated)
        this.scales = {
            SOLAR_SYSTEM: 1.1e10,    // 11 million km per pixel
            INNER_PLANETS: 1e9,      // 1 million km per pixel  
            PLANET: 1e7,             // 10,000 km per pixel
            ATMOSPHERE: 1e4          // 10 km per pixel (for atmospheric layers)
        };
        
        // Planet size multipliers for visibility (updated)
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
            },
            ATMOSPHERE: {
                sunMultiplier: 0.01,
                planetMultiplier: 10.0,
                minPixelSize: 50.0
            }
        };
        
        this.metersPerPixel = this.scales[this.cameraMode];
        this.smoothTransitions = false;
        this.transitionSpeed = 0.1;
    }

    /**
     * Convert world coordinates (meters) to screen coordinates (pixels)
     */
    worldToScreen(worldX, worldY) {
        const screenX = (worldX - this.cameraCenter.x) / this.metersPerPixel + this.canvasWidth / 2;
        const screenY = (worldY - this.cameraCenter.y) / this.metersPerPixel + this.canvasHeight / 2;
        return { x: screenX, y: screenY };
    }

    /**
     * Convert screen coordinates (pixels) to world coordinates (meters)
     */
    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.canvasWidth / 2) * this.metersPerPixel + this.cameraCenter.x;
        const worldY = (screenY - this.canvasHeight / 2) * this.metersPerPixel + this.cameraCenter.y;
        return { x: worldX, y: worldY };
    }

    /**
     * Get planet size multipliers for current camera mode
     */
    getPlanetSizeMultipliers() {
        return this.planetSizeMultipliers[this.cameraMode];
    }

    /**
     * Calculate scaled radius for display
     */
    getScaledRadius(body, useRealScale = true) {
        if (!useRealScale) {
            return body.getDisplayRadius();
        }

        const multipliers = this.getPlanetSizeMultipliers();
        
        let worldRadius;
        if (typeof body.getWorldRadius === 'function') {
            worldRadius = body.getWorldRadius();
        } else if (body.radius) {
            worldRadius = body.radius * 1000;
        } else {
            return multipliers.minPixelSize;
        }

        let scaledRadius = worldRadius * (body.name === 'Sun' ? multipliers.sunMultiplier : multipliers.planetMultiplier);
        const screenRadius = scaledRadius / this.metersPerPixel;
        
        return Math.max(multipliers.minPixelSize, screenRadius);
    }

    /**
     * Set camera mode using number (updated for mode 4)
     */
    setCameraModeByNumber(modeNumber, targetPlanet = null) {
        const modes = {
            1: 'SOLAR_SYSTEM',
            2: 'INNER_PLANETS',
            3: 'PLANET',
            4: 'ATMOSPHERE'
        };
        
        const mode = modes[modeNumber];
        if (mode) {
            this.setCameraMode(mode, targetPlanet);
        } else {
            console.warn(`Invalid camera mode number: ${modeNumber}. Use 1 for Solar System, 2 for Inner Planets, 3 for Planet, 4 for Atmosphere.`);
        }
    }

    /**
     * Set target planet for camera tracking
     */
    setTarget(planet) {
        this.targetPlanet = planet;
        if (planet && planet.position) {
            this.cameraCenter.x = planet.position.x;
            this.cameraCenter.y = planet.position.y;
        }
    }

    /**
     * Get current camera mode
     */
    getCameraMode() {
        return this.cameraMode;
    }

    /**
     * Set camera mode directly
     */
    setCameraMode(mode, targetPlanet = null) {
        this.cameraMode = mode;
        this.targetPlanet = targetPlanet;
        this.metersPerPixel = this.scales[mode];
        
        switch (mode) {
            case 'SOLAR_SYSTEM':
            case 'INNER_PLANETS':
                this.cameraCenter.x = 0;
                this.cameraCenter.y = 0;
                break;
                
            case 'PLANET':
            case 'ATMOSPHERE':
                if (targetPlanet && targetPlanet.position) {
                    this.cameraCenter.x = targetPlanet.position.x;
                    this.cameraCenter.y = targetPlanet.position.y;
                } else {
                    this.cameraCenter.x = 1.496e11; // 1 AU
                    this.cameraCenter.y = 0;
                }
                break;
        }
        
        console.log(`Camera mode set to: ${mode}`);
        console.log(`Scale: ${this.getScaleDescription()}`);
    }

    /**
     * Update camera position (updated for mode 4)
     */
    updateCamera() {
        if ((this.cameraMode === 'PLANET' || this.cameraMode === 'ATMOSPHERE') && 
            this.targetPlanet && this.targetPlanet.position) {
            if (this.smoothTransitions) {
                const dx = this.targetPlanet.position.x - this.cameraCenter.x;
                const dy = this.targetPlanet.position.y - this.cameraCenter.y;
                this.cameraCenter.x += dx * this.transitionSpeed;
                this.cameraCenter.y += dy * this.transitionSpeed;
            } else {
                this.cameraCenter.x = this.targetPlanet.position.x;
                this.cameraCenter.y = this.targetPlanet.position.y;
            }
        }
    }

    /**
     * Manually set camera position
     */
    setCameraPosition(x, y) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
    }

    /**
     * Set scale with mode-appropriate limits (updated)
     */
    setScale(scale) {
        const limits = {
            SOLAR_SYSTEM: { min: 1e9, max: 1e11 },
            INNER_PLANETS: { min: 5e8, max: 5e9 },
            PLANET: { min: 1e5, max: 1e8 },
            ATMOSPHERE: { min: 1e3, max: 1e6 }
        };
        
        const limit = limits[this.cameraMode];
        this.metersPerPixel = Math.max(limit.min, Math.min(limit.max, scale));
    }

    /**
     * Zoom by factor
     */
    zoom(factor) {
        this.setScale(this.metersPerPixel / factor);
    }

    /**
     * Get current mode information
     */
    getModeInfo() {
        return {
            mode: this.cameraMode,
            scale: this.metersPerPixel,
            center: { ...this.cameraCenter },
            targetPlanet: this.targetPlanet ? this.targetPlanet.name : null,
            planetScaling: this.planetSizeMultipliers[this.cameraMode]
        };
    }

    /**
     * Get human-readable scale description
     */
    getScaleDescription() {
        const scale = this.metersPerPixel;
        
        if (scale < 1000) {
            return `${scale.toFixed(0)} m/px`;
        } else if (scale < 1000000) {
            return `${(scale / 1000).toFixed(1)} km/px`;
        } else if (scale < 1000000000) {
            return `${(scale / 1000000).toFixed(1)} Mm/px`;
        } else {
            return `${(scale / 1000000000).toFixed(1)} Gm/px`;
        }
    }

    /**
     * Get visible planets for current mode (updated)
     */
    getVisiblePlanets(allBodies) {
        switch (this.cameraMode) {
            case 'SOLAR_SYSTEM':
            case 'PLANET':
            case 'ATMOSPHERE':
                return allBodies;
            case 'INNER_PLANETS':
                const innerPlanets = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars'];
                return allBodies.filter(body => innerPlanets.includes(body.name));
            default:
                return allBodies;
        }
    }

    /**
     * Check if object is visible on screen
     */
    isVisible(worldX, worldY, margin = 100) {
        const screenPos = this.worldToScreen(worldX, worldY);
        return screenPos.x >= -margin && screenPos.x <= this.canvasWidth + margin &&
               screenPos.y >= -margin && screenPos.y <= this.canvasHeight + margin;
    }
}