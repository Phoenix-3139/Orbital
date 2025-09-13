/**
 * Universal Coordinate System for Solar System Simulation
 * 
 * This class handles all coordinate transformations between:
 * - World coordinates (real space in meters)
 * - Screen coordinates (pixels on canvas)
 * 
 * It also manages different camera modes with appropriate scaling
 * for viewing the solar system at different levels of detail.
 */
export class UniversalCoordinateSystem {
    /**
     * Constructor - Initialize the coordinate system
     * @param {number} canvasWidth - Width of the canvas in pixels (default: 1024)
     * @param {number} canvasHeight - Height of the canvas in pixels (default: 1024)
     */
    constructor(canvasWidth = 1024, canvasHeight = 1024) {
        // Store canvas dimensions for coordinate calculations
        this.canvasWidth = canvasWidth;   // Canvas width in pixels
        this.canvasHeight = canvasHeight; // Canvas height in pixels
        
        // Camera properties - define where we're looking in space
        this.cameraCenter = { x: 0, y: 0 }; // Camera center position in world coordinates (meters)
        this.metersPerPixel = 1e9; // How many meters each pixel represents (scale factor)
        
        // Camera modes - different viewing perspectives
        this.cameraMode = 'SOLAR_SYSTEM'; // Current camera mode (string identifier)
        this.targetPlanet = null; // Which planet to follow (for planet mode)
        this.followObject = null; // Object being followed (legacy support)
        
        // Fixed scale levels for each mode
        // These define how "zoomed out" each mode is
        this.scales = {
            SOLAR_SYSTEM: 1.1e10,    // 11 million km per pixel - shows entire solar system
            INNER_PLANETS: 1e9,      // 1 million km per pixel - focuses on inner planets
            PLANET: 1e7              // 10,000 km per pixel - close-up view of individual planets
        };
        
        // Planet size multipliers for each mode
        // Real planets would be invisible at solar system scale, so we scale them up
        this.planetSizeMultipliers = {
            SOLAR_SYSTEM: {
                sunMultiplier: 0.1,      // Sun is scaled DOWN (it's too big at this scale)
                planetMultiplier: 50.0,   // Planets are scaled UP 50x to be visible
                minPixelSize: 3.0         // Minimum size in pixels (ensures visibility)
            },
            INNER_PLANETS: {
                sunMultiplier: 0.2,      // Sun scaled down less (more detail visible)
                planetMultiplier: 15.0,   // Planets scaled up 15x (good balance)
                minPixelSize: 2.5         // Minimum size in pixels
            },
            PLANET: {
                sunMultiplier: 0.05,     // Sun heavily scaled down (would fill screen)
                planetMultiplier: 1.0,    // Planets at TRUE scale (realistic size)
                minPixelSize: 2.0         // Minimum size in pixels
            }
        };
        
        // Set initial scale based on current camera mode
        this.metersPerPixel = this.scales[this.cameraMode];
        
        // Camera smoothing settings (for smooth following)
        this.smoothTransitions = false; // Disabled to prevent camera bouncing
        this.transitionSpeed = 0.1;     // How fast camera follows target (0.0 to 1.0)
    }

    /**
     * Convert world coordinates (meters) to screen coordinates (pixels)
     * This is the core transformation that lets us display space objects on screen
     * 
     * @param {number} worldX - X position in world space (meters)
     * @param {number} worldY - Y position in world space (meters)
     * @returns {object} Screen coordinates {x, y} in pixels
     */
    worldToScreen(worldX, worldY) {
        // Step 1: Convert world position relative to camera center
        // Step 2: Scale from meters to pixels using metersPerPixel
        // Step 3: Offset to center of canvas
        const screenX = (worldX - this.cameraCenter.x) / this.metersPerPixel + this.canvasWidth / 2;
        const screenY = (worldY - this.cameraCenter.y) / this.metersPerPixel + this.canvasHeight / 2;
        
        // Return pixel coordinates
        return { x: screenX, y: screenY };
    }

    /**
     * Convert screen coordinates (pixels) to world coordinates (meters)
     * This is the reverse transformation - useful for mouse interactions
     * 
     * @param {number} screenX - X position on screen (pixels)
     * @param {number} screenY - Y position on screen (pixels)
     * @returns {object} World coordinates {x, y} in meters
     */
    screenToWorld(screenX, screenY) {
        // Step 1: Convert screen position relative to canvas center
        // Step 2: Scale from pixels to meters using metersPerPixel
        // Step 3: Add camera center offset
        const worldX = (screenX - this.canvasWidth / 2) * this.metersPerPixel + this.cameraCenter.x;
        const worldY = (screenY - this.canvasHeight / 2) * this.metersPerPixel + this.cameraCenter.y;
        
        // Return world coordinates in meters
        return { x: worldX, y: worldY };
    }

    /**
     * Get planet size multipliers for current camera mode
     * These multipliers determine how big planets appear on screen
     * 
     * @returns {object} Object containing sunMultiplier, planetMultiplier, minPixelSize
     */
    getPlanetSizeMultipliers() {
        // Return the scaling factors for the current camera mode
        return this.planetSizeMultipliers[this.cameraMode];
    }

    /**
     * Calculate scaled radius for a body based on current camera mode
     * This function takes a planet's real size and scales it appropriately for visibility
     * 
     * @param {object} body - The celestial body (planet/sun)
     * @param {boolean} useRealScale - Whether to use real physical scaling (default: true)
     * @returns {number} Radius in pixels for display
     */
    getScaledRadius(body, useRealScale = true) {
        // If not using real scale, fall back to logarithmic display scaling
        if (!useRealScale) {
            return body.getDisplayRadius(); // Use the body's own display scaling method
        }

        // Get the scaling multipliers for current camera mode
        const multipliers = this.getPlanetSizeMultipliers();
        
        // Get world radius in meters from the body object
        let worldRadius;
        if (typeof body.getWorldRadius === 'function') {
            // Body has a getWorldRadius method - use it
            worldRadius = body.getWorldRadius();
        } else if (body.radius) {
            // Body has radius property (probably in km) - convert to meters
            worldRadius = body.radius * 1000; // Convert km to meters
        } else {
            // No radius information - return minimum size
            return multipliers.minPixelSize;
        }

        // Apply appropriate multiplier based on body type
        let scaledRadius;
        if (body.name === 'Sun') {
            // Sun gets special scaling (usually scaled DOWN)
            scaledRadius = worldRadius * multipliers.sunMultiplier;
        } else {
            // Planets get their own scaling (usually scaled UP)
            scaledRadius = worldRadius * multipliers.planetMultiplier;
        }

        // Convert scaled radius from meters to screen pixels
        const screenRadius = scaledRadius / this.metersPerPixel;

        // Ensure minimum visibility - never smaller than minPixelSize
        return Math.max(multipliers.minPixelSize, screenRadius);
    }

    /**
     * Set camera mode using integer (1 = SOLAR_SYSTEM, 2 = INNER_PLANETS, 3 = PLANET)
     * This is a user-friendly wrapper that converts numbers to mode names
     * 
     * @param {number} modeNumber - Mode number (1, 2, or 3)
     * @param {object} targetPlanet - Planet to focus on (for planet mode)
     */
    setCameraModeByNumber(modeNumber, targetPlanet = null) {
        // Map numbers to mode names for easier use in editor
        const modes = {
            1: 'SOLAR_SYSTEM',   // Full solar system view
            2: 'INNER_PLANETS',  // Inner planets focus
            3: 'PLANET'          // Individual planet view
        };
        
        // Get the mode name from the number
        const mode = modes[modeNumber];
        if (mode) {
            // Valid mode number - set the camera mode
            this.setCameraMode(mode, targetPlanet);
        } else {
            // Invalid mode number - show warning
            console.warn(`Invalid camera mode number: ${modeNumber}. Use 1 for Solar System, 2 for Inner Planets, 3 for Planet.`);
        }
    }

    /**
     * Set camera mode with fixed scale and position
     * This is the main method that configures the camera for different viewing modes
     * 
     * @param {string} mode - Camera mode name ('SOLAR_SYSTEM', 'INNER_PLANETS', 'PLANET')
     * @param {object} targetPlanet - Planet to focus on (for planet mode)
     */
    setCameraMode(mode, targetPlanet = null) {
        // Store the new camera mode
        this.cameraMode = mode;
        this.targetPlanet = targetPlanet;
        
        // Set fixed scale for this mode (how zoomed in/out we are)
        this.metersPerPixel = this.scales[mode];
        
        // Set camera position based on mode
        switch (mode) {
            case 'SOLAR_SYSTEM':
                // Solar system mode: center on Sun (origin of coordinate system)
                this.cameraCenter.x = 0;
                this.cameraCenter.y = 0;
                break;
                
            case 'INNER_PLANETS':
                // Inner planets mode: also center on Sun but at different scale
                this.cameraCenter.x = 0;
                this.cameraCenter.y = 0;
                break;
                
            case 'PLANET':
                // Planet mode: center on target planet if provided
                if (targetPlanet && targetPlanet.position) {
                    // Target planet exists and has position - center on it
                    this.cameraCenter.x = targetPlanet.position.x;
                    this.cameraCenter.y = targetPlanet.position.y;
                } else {
                    // No target planet - default to Earth's orbital distance (1 AU)
                    this.cameraCenter.x = 1.496e11; // 1 AU in meters
                    this.cameraCenter.y = 0;
                }
                break;
        }
        
        // Log camera mode change for debugging
        console.log(`Camera mode set to: ${mode}`);
        console.log(`Scale: ${this.getScaleDescription()}`);
        console.log(`Planet scaling: Sun ${this.planetSizeMultipliers[mode].sunMultiplier}x, Planets ${this.planetSizeMultipliers[mode].planetMultiplier}x`);
        console.log(`Center: (${(this.cameraCenter.x/1e9).toFixed(2)}, ${(this.cameraCenter.y/1e9).toFixed(2)}) Gm`);
    }

    /**
     * Calculate optimal scale (legacy method for backward compatibility)
     * This method is no longer used since we use fixed scales per mode
     * 
     * @param {Array} objects - Array of objects to fit on screen
     * @param {number} padding - Padding factor (unused)
     */
    calculateOptimalScale(objects, padding = 0.8) {
        // This method is now a no-op since we use fixed scales
        // But we keep it for compatibility with older code
        console.log('calculateOptimalScale called - using fixed scale modes instead');
    }

    /**
     * Update camera position (only if following a planet in planet mode)
     * This method handles camera movement when following a moving target
     */
    updateCamera() {
        // Only update camera position in planet mode when following a target
        if (this.cameraMode === 'PLANET' && this.targetPlanet && this.targetPlanet.position) {
            // Follow the target planet smoothly or directly
            if (this.smoothTransitions) {
                // Smooth following: gradually move camera toward target
                const dx = this.targetPlanet.position.x - this.cameraCenter.x; // X distance to target
                const dy = this.targetPlanet.position.y - this.cameraCenter.y; // Y distance to target
                
                // Move camera a fraction of the way toward target each frame
                this.cameraCenter.x += dx * this.transitionSpeed;
                this.cameraCenter.y += dy * this.transitionSpeed;
            } else {
                // Direct following: instantly center on target (no smoothing to prevent bouncing)
                this.cameraCenter.x = this.targetPlanet.position.x;
                this.cameraCenter.y = this.targetPlanet.position.y;
            }
        }
        // SOLAR_SYSTEM and INNER_PLANETS modes keep camera fixed at origin (no following)
    }

    /**
     * Manually set camera position (override automatic positioning)
     * Useful for custom camera control or debugging
     * 
     * @param {number} x - Camera center X position in world coordinates (meters)
     * @param {number} y - Camera center Y position in world coordinates (meters)
     */
    setCameraPosition(x, y) {
        // Directly set camera center position
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
    }

    /**
     * Manually adjust scale within mode limits
     * Allows fine-tuning of zoom level while staying within reasonable bounds
     * 
     * @param {number} scale - Desired scale (meters per pixel)
     */
    setScale(scale) {
        // Clamp scale to reasonable ranges for each mode
        // This prevents zooming too far in or out
        const limits = {
            SOLAR_SYSTEM: { min: 1e9, max: 1e11 },    // 1M km to 100M km per pixel
            INNER_PLANETS: { min: 5e8, max: 5e9 },    // 500k km to 5M km per pixel
            PLANET: { min: 1e5, max: 1e8 }           // 100 km to 100,000 km per pixel
        };
        
        // Get limits for current mode
        const limit = limits[this.cameraMode];
        // Clamp the scale between min and max for this mode
        this.metersPerPixel = Math.max(limit.min, Math.min(limit.max, scale));
    }

    /**
     * Zoom in/out by factor (relative to current scale)
     * Provides a user-friendly way to zoom
     * 
     * @param {number} factor - Zoom factor (>1 = zoom in, <1 = zoom out)
     */
    zoom(factor) {
        // Calculate new scale by dividing current scale by zoom factor
        // factor > 1 = zoom in (smaller metersPerPixel = more detail)
        // factor < 1 = zoom out (larger metersPerPixel = less detail)
        this.setScale(this.metersPerPixel / factor);
    }

    /**
     * Get list of available camera modes
     * Returns array of mode names for UI or validation
     * 
     * @returns {Array} Array of mode name strings
     */
    getAvailableModes() {
        // Return all available mode names from the scales object
        return Object.keys(this.scales);
    }

    /**
     * Get current mode info
     * Returns complete information about current camera state
     * 
     * @returns {object} Object containing mode, scale, center, targetPlanet, planetScaling
     */
    getModeInfo() {
        // Return comprehensive camera state information
        return {
            mode: this.cameraMode,                                           // Current mode name
            scale: this.metersPerPixel,                                     // Current scale
            center: { ...this.cameraCenter },                               // Camera center position (copy)
            targetPlanet: this.targetPlanet ? this.targetPlanet.name : null, // Target planet name or null
            planetScaling: this.planetSizeMultipliers[this.cameraMode]      // Current scaling multipliers
        };
    }

    /**
     * Get human-readable scale description
     * Converts raw scale number to understandable units
     * 
     * @returns {string} Scale description (e.g., "1.5 Gm/px")
     */
    getScaleDescription() {
        // Get current scale in meters per pixel
        const scale = this.metersPerPixel;
        
        // Convert to appropriate units based on scale size
        if (scale < 1000) {
            // Less than 1 km per pixel - show in meters
            return `${scale.toFixed(0)} m/px`;
        } else if (scale < 1000000) {
            // Less than 1000 km per pixel - show in kilometers
            return `${(scale / 1000).toFixed(1)} km/px`;
        } else if (scale < 1000000000) {
            // Less than 1 million km per pixel - show in megameters (Mm)
            return `${(scale / 1000000).toFixed(1)} Mm/px`;
        } else {
            // 1 million km or more per pixel - show in gigameters (Gm)
            return `${(scale / 1000000000).toFixed(1)} Gm/px`;
        }
    }

    /**
     * Get mode-appropriate reference distances for grid
     * Returns array of distances for drawing reference circles/grid
     * 
     * @returns {Array} Array of distances in meters
     */
    getReferenceDistances() {
        // Return different reference distances based on current camera mode
        switch (this.cameraMode) {
            case 'SOLAR_SYSTEM':
                // Solar system mode: show major orbital distances
                return [
                    1.496e11,     // 1 AU (Earth's orbit)
                    2.99e11,      // 2 AU
                    7.48e11,      // 5 AU (Jupiter's orbit)
                    1.496e12,     // 10 AU
                    2.99e12       // 20 AU (Uranus region)
                ];
            case 'INNER_PLANETS':
                // Inner planets mode: show inner planet orbital distances
                return [
                    5.79e10,      // Mercury orbit (0.39 AU)
                    1.08e11,      // Venus orbit (0.72 AU)
                    1.496e11,     // Earth orbit (1 AU)
                    2.28e11,      // Mars orbit (1.52 AU)
                    4.14e11       // Asteroid belt (2.77 AU)
                ];
            case 'PLANET':
                // Planet mode: show distances relevant to individual planets
                return [
                    1e7,          // 10,000 km
                    5e7,          // 50,000 km
                    1e8,          // 100,000 km
                    5e8,          // 500,000 km
                    1e9           // 1,000,000 km
                ];
            default:
                // Fallback distances if mode not recognized
                return [1e9, 5e9, 1e10];
        }
    }

    /**
     * Get appropriate planet filter for current mode
     * Determines which planets should be visible in each mode
     * 
     * @param {Array} allBodies - Array of all celestial bodies
     * @returns {Array} Filtered array of bodies to display
     */
    getVisiblePlanets(allBodies) {
        // Filter planets based on current camera mode
        switch (this.cameraMode) {
            case 'SOLAR_SYSTEM':
                // Solar system mode: show all planets
                return allBodies;
            case 'INNER_PLANETS':
                // Inner planets mode: show only inner planets plus Sun
                return allBodies.filter(body => {
                    // List of bodies to show in inner planets mode
                    const innerPlanets = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars'];
                    return innerPlanets.includes(body.name);
                });
            case 'PLANET':
                // Planet mode: show all for context, but focused on target
                return allBodies;
            default:
                // Fallback: show all bodies
                return allBodies;
        }
    }

    /**
     * Check if object is visible on screen (with margin)
     * Useful for culling objects that are off-screen to improve performance
     * 
     * @param {number} worldX - Object X position in world coordinates
     * @param {number} worldY - Object Y position in world coordinates
     * @param {number} margin - Extra margin around screen edges (pixels)
     * @returns {boolean} True if object is visible (including margin)
     */
    isVisible(worldX, worldY, margin = 100) {
        // Convert world position to screen position
        const screenPos = this.worldToScreen(worldX, worldY);
        
        // Check if position is within screen bounds (including margin)
        return screenPos.x >= -margin &&                    // Not too far left
               screenPos.x <= this.canvasWidth + margin &&  // Not too far right
               screenPos.y >= -margin &&                    // Not too far up
               screenPos.y <= this.canvasHeight + margin;   // Not too far down
    }
}