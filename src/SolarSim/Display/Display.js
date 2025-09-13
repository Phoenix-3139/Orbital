/**
 * Orbital Simulation Display Component
 * 
 * This is the main rendering component for the solar system simulation.
 * It handles:
 * - Canvas creation and management
 * - Real-time orbital mechanics visualization
 * - Multiple camera modes (Solar System, Inner Planets, Planet)
 * - Dynamic scaling and coordinate transformations
 * - Enhanced planet rendering with atmospheric visualization
 * - UI rendering and user feedback
 * 
 * The component uses a Universal Coordinate System to handle the vast
 * scale differences between planetary and solar system views.
 */

// Import required Wonderland Engine components and simulation classes
import {Component, Property} from '@wonderlandengine/api';
import {PlanetarySystem} from './Physics/KeplerianOrbit.js';
import {UniversalCoordinateSystem} from './Display/CoordinateSystem.js';

/**
 * Main Display Component Class
 * Extends Wonderland Engine's Component class to integrate with the engine
 */
export class Drawer extends Component {
    // Component identifier for Wonderland Engine
    static TypeName = 'orbital-simulation';
    
    /**
     * Component Properties - Exposed to Wonderland Engine Editor
     * These properties can be adjusted in the editor without code changes
     */
    static Properties = {
        // Rendering Properties
        material: Property.material(),              // Material to apply the canvas texture to
        bgColor: Property.string('#0a0a0a'),      // Background color (dark space)
        
        // Simulation Control Properties
        paused: Property.bool(false),              // Whether simulation is paused
        timeMultiplier: Property.float(2000000),   // Time acceleration factor (2M = fast orbit visualization)
        
        // Visual Display Properties
        showOrbits: Property.bool(true),           // Whether to show orbital trails
        maxTrailLength: Property.int(4000),        // Maximum number of trail points per body
        enablePerturbations: Property.bool(false), // Enable gravitational perturbations (unused)
        showOuterPlanets: Property.bool(true),     // Show planets beyond Jupiter
        useRealScale: Property.bool(true),         // Use physically accurate scaling
        
        // Enhanced Planet Rendering Properties
        showAtmospheres: Property.bool(true),      // Whether to render atmospheric halos
        atmosphereOpacity: Property.float(0.3),    // Opacity of atmospheric rendering (0.0-1.0)
        planetScaleBoost: Property.float(3.0),     // Additional scaling factor for planets in Mode 3
        
        // Camera Mode Controls (Exposed to Editor)
        cameraMode: Property.int(1),               // 1=Solar System, 2=Inner Planets, 3=Planet
        targetPlanet: Property.string('Earth'),    // Planet to focus on in planet mode
        enableCameraSmoothing: Property.bool(false), // Smooth camera following (disabled to prevent bouncing)
        manualZoom: Property.float(1.0),           // Manual zoom adjustment factor
        
        // Manual Scaling Override Properties (Advanced Users)
        overridePlanetScaling: Property.bool(false),    // Enable manual planet size control
        manualSunMultiplier: Property.float(0.1),       // Manual sun size multiplier
        manualPlanetMultiplier: Property.float(50.0),   // Manual planet size multiplier
        
        // Minimum Display Properties
        minPlanetPixels: Property.float(2.0),      // Minimum planet size in pixels for visibility
    };

    /**
     * Component Initialization Method
     * Called when the component starts - sets up canvas, textures, and coordinate system
     */
    start() {
        // Create HTML5 Canvas for rendering the simulation
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;   // Canvas width in pixels
        this.canvas.height = 1024;  // Canvas height in pixels
        this.ctx = this.canvas.getContext('2d'); // Get 2D rendering context
        
        // Initialize canvas with background color before creating texture
        // This prevents flashing white before first frame renders
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create Wonderland Engine texture from canvas
        // This texture will be applied to the material to display the simulation
        this.tex = this.engine.textures.create(this.canvas);
        
        // Initialize Universal Coordinate System with enhanced planet mode scaling
        this.coordSystem = new UniversalCoordinateSystem(
            this.canvas.width,   // Canvas width for coordinate calculations
            this.canvas.height   // Canvas height for coordinate calculations
        );
        
        // Apply texture to material if material is assigned
        if (this.material) {
            this.material.flatTexture = this.tex; // Set canvas texture as material's main texture
        } else {
            // Error handling - component won't work without material
            console.error('Material not assigned to orbital-simulation component');
            return;
        }

        // Initialize simulation state (planets, orbits, camera)
        this._initState();
        
        // Start simulation loop after one frame delay
        // This ensures texture is properly initialized before rendering begins
        setTimeout(() => {
            this._startSimulationLoop();
        }, 16); // 16ms = one frame at 60fps
    }

    /**
     * Simulation Loop Initialization
     * Sets up interval-based rendering to ensure consistent frame rate
     */
    _startSimulationLoop() {
        // Use setInterval instead of requestAnimationFrame to ensure simulation
        // continues even when browser tab is inactive
        const interval = 16; // Target 60 FPS (1000ms / 60 ≈ 16ms)
        
        this.simulationInterval = setInterval(() => {
            if (!this.paused) { // Only update if not paused
                this.update(interval / 1000); // Convert milliseconds to seconds for physics
            }
        }, interval);
    }

    /**
     * Component Cleanup Method
     * Called when component is deactivated - prevents memory leaks
     */
    onDeactivate() {
        // Clear the simulation interval to prevent continued execution
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }

    /**
     * Initialize Simulation State
     * Sets up solar system, camera mode, and initial conditions
     */
    _initState() {
        // Initialize simulation time (seconds since simulation start)
        this.simulationTime = 0;
        
        // Create solar system with all planets using Keplerian orbital mechanics
        this.bodies = PlanetarySystem.createSolarSystem();
        
        // Update all planetary positions to initial time
        this._updateKeplerianOrbits();

        // Initialize camera system based on editor properties
        let targetPlanet = null;
        
        // If in planet mode (3) and target planet is specified
        if (this.cameraMode === 3 && this.targetPlanet) {
            // Find the target planet in the bodies array
            targetPlanet = this.bodies.find(body => 
                body.name.toLowerCase() === this.targetPlanet.toLowerCase()
            );
            
            // Warn if target planet not found
            if (!targetPlanet) {
                console.warn(`Target planet "${this.targetPlanet}" not found. Available planets:`, 
                    this.bodies.map(b => b.name).join(', '));
            }
        }
        
        // Set camera mode using editor property (1, 2, or 3)
        this.coordSystem.setCameraModeByNumber(this.cameraMode, targetPlanet);
        
        // Configure camera smoothing based on editor setting
        this.coordSystem.smoothTransitions = this.enableCameraSmoothing;
        
        // Apply enhanced planet scaling for Mode 3
        this._applyEnhancedPlanetScaling();
        
        // Apply manual scaling overrides if enabled in editor
        if (this.overridePlanetScaling) {
            this._applyManualScaling();
        }
        
        // Apply manual zoom adjustment if specified
        if (this.manualZoom !== 1.0) {
            this.coordSystem.zoom(this.manualZoom);
        }

        // Log initialization status for debugging
        console.log('Camera System initialized with enhanced planet rendering');
        console.log(`Mode: ${this.cameraMode} (${this.coordSystem.cameraMode})`);
        console.log(`Scale: ${this.coordSystem.getScaleDescription()}`);
        console.log(`Planet Scale Boost: ${this.planetScaleBoost}x`);
        console.log(`Atmosphere Rendering: ${this.showAtmospheres ? 'ON' : 'OFF'}`);
    }

    /**
     * Apply Enhanced Planet Scaling for Mode 3
     * Significantly increases planet sizes in planet mode for better visibility
     */
    _applyEnhancedPlanetScaling() {
        // Get current camera mode name
        const currentMode = this.coordSystem.cameraMode;
        
        // Apply enhanced scaling specifically for planet mode
        if (currentMode === 'PLANET') {
            // Dramatically increase planet visibility in planet mode
            this.coordSystem.planetSizeMultipliers[currentMode] = {
                sunMultiplier: 0.02,                                    // Sun heavily scaled down (would dominate view)
                planetMultiplier: 5.0 * this.planetScaleBoost,         // Planets scaled up significantly with boost
                minPixelSize: Math.max(8.0, this.minPlanetPixels)      // Larger minimum size for planet mode
            };
            
            console.log(`Enhanced planet scaling applied for Mode 3:`);
            console.log(`  Planet Multiplier: ${5.0 * this.planetScaleBoost}x`);
            console.log(`  Minimum Size: ${Math.max(8.0, this.minPlanetPixels)} pixels`);
        }
    }

    /**
     * Apply Manual Scaling Overrides
     * Allows advanced users to override automatic planet scaling
     */
    _applyManualScaling() {
        // Get current camera mode name
        const currentMode = this.coordSystem.cameraMode;
        
        // Override the automatic scaling with manual values
        this.coordSystem.planetSizeMultipliers[currentMode] = {
            sunMultiplier: this.manualSunMultiplier,        // Use editor sun multiplier
            planetMultiplier: this.manualPlanetMultiplier,  // Use editor planet multiplier
            minPixelSize: this.minPlanetPixels              // Use editor minimum size
        };
        
        // Log manual scaling application
        console.log(`Manual scaling applied - Sun: ${this.manualSunMultiplier}x, Planets: ${this.manualPlanetMultiplier}x`);
    }

    /**
     * Main Update Loop
     * Called every frame to advance simulation and render
     * 
     * @param {number} dt - Delta time in seconds since last frame
     */
    update(dt) {
        // Skip update if simulation is paused
        if (this.paused) return;

        // Scale delta time by time multiplier for faster/slower simulation
        const scaledDt = dt * this.timeMultiplier;
        
        // Advance simulation time
        this.simulationTime += scaledDt;

        // Update all planetary positions based on new time
        this._updateKeplerianOrbits();
        
        // Update camera position and mode
        this._updateCamera();
        
        // Render everything to canvas
        this._drawDynamic();
        
        // Update Wonderland Engine texture with new canvas content
        this.tex.update();
    }

    /**
     * Update Keplerian Orbital Positions
     * Calculates new positions for all celestial bodies based on current simulation time
     */
    _updateKeplerianOrbits() {
        // Update each celestial body in the simulation
        this.bodies.forEach(body => {
            // Calculate new position based on orbital mechanics and current time
            body.updatePosition(this.simulationTime);
            
            // Add current position to orbital trail for visualization
            body.addToTrail(this.maxTrailLength);
        });
    }

    /**
     * Update Camera System
     * Handles camera mode changes and position updates
     */
    _updateCamera() {
        // Check if camera mode changed in editor during runtime
        if (this.coordSystem.cameraMode !== this._getCurrentModeString()) {
            let targetPlanet = null;
            
            // If switching to planet mode, find target planet
            if (this.cameraMode === 3 && this.targetPlanet) {
                targetPlanet = this.bodies.find(body => 
                    body.name.toLowerCase() === this.targetPlanet.toLowerCase()
                );
            }
            
            // Apply new camera mode
            this.coordSystem.setCameraModeByNumber(this.cameraMode, targetPlanet);
            
            // Reapply enhanced scaling for new mode
            this._applyEnhancedPlanetScaling();
            
            // Reapply manual scaling if it was enabled
            if (this.overridePlanetScaling) {
                this._applyManualScaling();
            }
        }

        // Apply real-time scaling updates
        if (this.cameraMode === 3) {
            // Update enhanced planet scaling in real-time for Mode 3
            this._applyEnhancedPlanetScaling();
        }
        
        // Apply manual scaling updates in real-time if enabled
        if (this.overridePlanetScaling) {
            this._applyManualScaling();
        }

        // Update camera position if following a planet in planet mode
        if (this.cameraMode === 3 && this.targetPlanet) {
            // Find the target planet object
            const target = this.bodies.find(body => 
                body.name.toLowerCase() === this.targetPlanet.toLowerCase()
            );
            
            if (target) {
                // Set target and update camera to follow it
                this.coordSystem.targetPlanet = target;
                this.coordSystem.updateCamera();
            }
        }
    }

    /**
     * Get Current Camera Mode as String
     * Converts numeric camera mode to string for comparison
     * 
     * @returns {string} Camera mode name ('SOLAR_SYSTEM', 'INNER_PLANETS', 'PLANET')
     */
    _getCurrentModeString() {
        // Map numbers to mode strings
        const modes = {
            1: 'SOLAR_SYSTEM',   // Full solar system view
            2: 'INNER_PLANETS',  // Inner planets focus
            3: 'PLANET'          // Individual planet view
        };
        return modes[this.cameraMode];
    }

    /**
     * Calculate Display Radius for Celestial Body
     * Determines how large to draw a planet/sun on screen based on camera mode and scaling
     * Enhanced for Mode 3 with larger planet visualization
     * 
     * @param {object} body - Celestial body object (planet or sun)
     * @returns {number} Radius in pixels for rendering
     */
    _calculateDisplayRadius(body) {
        // If not using real scale, fall back to logarithmic scaling
        if (!this.useRealScale) {
            let baseRadius = body.getDisplayRadius(); // Use body's built-in display scaling
            
            // Apply additional scaling boost in planet mode
            if (this.cameraMode === 3) {
                baseRadius *= this.planetScaleBoost;
            }
            
            return Math.max(this.minPlanetPixels, baseRadius);
        }

        // Get world radius in meters
        let worldRadius;
        if (typeof body.getWorldRadius === 'function') {
            // Body has getWorldRadius method - use it (preferred)
            worldRadius = body.getWorldRadius(); // Already in meters
        } else if (body.radius) {
            // Body has radius property - assume it's in kilometers and convert
            worldRadius = body.radius * 1000; // Convert km to meters
        } else {
            // No radius information available - use minimum size
            console.warn(`Body ${body.name} has no radius information, using default`);
            return this.minPlanetPixels * (this.cameraMode === 3 ? this.planetScaleBoost : 1);
        }

        // Convert world radius to screen pixels using current scale
        let screenRadius = worldRadius / this.coordSystem.metersPerPixel;
        
        // Apply scaling multipliers from coordinate system
        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        if (body.name === 'Sun') {
            screenRadius *= multipliers.sunMultiplier;
        } else {
            screenRadius *= multipliers.planetMultiplier;
        }

        // Ensure minimum visibility - never smaller than minimum pixel size
        const minSize = this.cameraMode === 3 ? 
            Math.max(8.0, this.minPlanetPixels) : // Larger minimum in planet mode
            this.minPlanetPixels;
            
        return Math.max(minSize, screenRadius);
    }

    /**
     * Calculate Atmospheric Radius for Rendering
     * Determines the size of the atmospheric halo around planets
     * 
     * @param {object} body - Celestial body object
     * @param {number} planetRadius - Planet's display radius in pixels
     * @returns {number} Atmospheric radius in pixels
     */
    _calculateAtmosphericRadius(body, planetRadius) {
        // Get atmospheric data from Body class
        const bodyData = Object.values(this.bodies).find(b => b.name === body.name);
        if (!bodyData || !this.showAtmospheres) {
            return 0; // No atmosphere or atmospheric rendering disabled
        }
        
        // Get atmospheric density at altitude for this body
        const atmosphericSummary = body.getAtmosphericSummary?.() || 
                                  bodyData.getAtmosphericSummary?.();
        
        if (!atmosphericSummary) {
            return 0; // No atmospheric data available
        }
        
        // Calculate atmospheric extension based on scale height and planet size
        let atmosphericExtension;
        
        if (this.cameraMode === 3 && this.useRealScale) {
            // In planet mode with real scale, use actual atmospheric scale height
            const scaleHeight = atmosphericSummary.scaleHeight || 10000; // Default 10km scale height
            const worldAtmosphereRadius = scaleHeight * 3; // Extend 3 scale heights
            
            // Convert to screen pixels
            atmosphericExtension = worldAtmosphereRadius / this.coordSystem.metersPerPixel;
        } else {
            // For other modes, use proportional atmospheric extension
            atmosphericExtension = planetRadius * 0.5; // 50% larger than planet
        }
        
        // Ensure atmospheric halo is visible but not overwhelming
        atmosphericExtension = Math.max(2, Math.min(planetRadius * 2, atmosphericExtension));
        
        return planetRadius + atmosphericExtension;
    }

    /**
     * Main Rendering Method
     * Draws the entire simulation frame including planets, orbits, grid, and UI
     */
    _drawDynamic() {
        // Get canvas context and dimensions for rendering
        const g = this.ctx;           // 2D rendering context
        const w = this.canvas.width;  // Canvas width
        const h = this.canvas.height; // Canvas height

        // Clear canvas with background color
        g.fillStyle = this.bgColor;
        g.fillRect(0, 0, w, h);

        // Draw reference grid for spatial orientation
        this._drawReferenceGrid();

        // Determine which bodies to render based on camera mode and settings
        let visibleBodies;
        if (this.cameraMode === 2) {
            // Inner planets mode - use coordinate system's planet filter
            visibleBodies = this.coordSystem.getVisiblePlanets(this.bodies);
        } else {
            // Solar system or planet mode - use showOuterPlanets editor setting
            visibleBodies = this.showOuterPlanets ? this.bodies : this.bodies.slice(0, 5);
        }

        // Render each visible celestial body with enhanced atmospheric rendering
        visibleBodies.forEach((body) => {
            this._drawBodyWithAtmosphere(body); // Enhanced rendering with atmosphere
            if (this.showOrbits) {              // Draw orbital trail if enabled
                this._drawTrail(body);
            }
        });

        // Draw user interface information overlay
        this._drawUI();
    }

    /**
     * Draw Individual Celestial Body with Atmospheric Rendering
     * Enhanced version that renders both the planet and its atmosphere
     * 
     * @param {object} body - Celestial body to draw
     */
    _drawBodyWithAtmosphere(body) {
        const g = this.ctx; // Get rendering context
        
        // Convert world position to screen coordinates
        const screenPos = this.coordSystem.worldToScreen(body.position.x, body.position.y);
        
        // Skip rendering if body is off-screen (performance optimization)
        const margin = 100; // Extra margin around screen edges for large atmospheric halos
        if (screenPos.x < -margin || screenPos.x > this.canvas.width + margin ||
            screenPos.y < -margin || screenPos.y > this.canvas.height + margin) {
            return; // Body is not visible, skip rendering
        }

        // Calculate display radius based on camera mode and scaling
        const planetRadius = this._calculateDisplayRadius(body);
        
        // Calculate atmospheric radius if atmospheres are enabled
        const atmosphericRadius = this._calculateAtmosphericRadius(body, planetRadius);

        // === ATMOSPHERIC RENDERING ===
        // Draw atmospheric halo first (behind the planet)
        if (atmosphericRadius > planetRadius && this.showAtmospheres) {
            this._drawAtmosphere(body, screenPos, planetRadius, atmosphericRadius);
        }

        // === PLANET RENDERING ===
        // Draw the main celestial body
        g.beginPath();
        g.arc(screenPos.x, screenPos.y, planetRadius, 0, 2 * Math.PI); // Draw circle
        g.fillStyle = body.color; // Use body's color
        g.fill(); // Fill the circle

        // Add outline for better definition, especially useful for larger planets
        if (planetRadius >= 3 || this.cameraMode === 3) {
            g.strokeStyle = this._adjustColorBrightness(body.color, 0.3); // Slightly brighter outline
            g.lineWidth = Math.max(1, planetRadius * 0.05); // Scale line width with planet size
            g.stroke(); // Draw the outline
        }

        // === LABELING AND SIZE INFO ===
        // Draw enhanced labels and information for larger planets
        if (planetRadius > 2) {
            this._drawBodyLabels(body, screenPos, planetRadius, atmosphericRadius);
        }
    }

    /**
     * Draw Atmospheric Halo Around Planet
     * Simplified version that renders a translucent circle for the atmosphere.
     * This approach ensures visibility in Mode 3.
     * 
     * @param {object} body - Celestial body
     * @param {object} screenPos - Screen position {x, y}
     * @param {number} planetRadius - Planet radius in pixels
     * @param {number} atmosphericRadius - Atmospheric radius in pixels
     */
    _drawAtmosphere(body, screenPos, planetRadius, atmosphericRadius) {
        const g = this.ctx;

        // Ensure this is only drawn in Mode 3
        if (this.cameraMode !== 3) return;

        // Set atmospheric color (default to light blue if not specified)
        let atmosphericColor = 'rgba(135, 206, 250, 0.3)'; // Default blue atmosphere
        const bodyData = Object.values(this.bodies).find(b => b.name === body.name);
        if (bodyData?.atmosphere?.color) {
            atmosphericColor = bodyData.atmosphere.color;
        }

        // Draw the translucent circle for the atmosphere
        g.beginPath();
        g.arc(screenPos.x, screenPos.y, atmosphericRadius, 0, 2 * Math.PI);
        g.fillStyle = atmosphericColor;
        g.fill();
    }

    /**
     * Parse Atmospheric Color String to RGB Components
     * Extracts RGB values from various color formats
     * 
     * @param {string} colorString - Color in CSS format
     * @param {object} body - Celestial body for fallback colors
     * @returns {object} RGB color object {r, g, b}
     */
    _parseAtmosphericColor(colorString, body) {
        // Default atmospheric colors based on planet type
        const defaultColors = {
            'Earth': { r: 135, g: 206, b: 250 }, // Light blue
            'Mars': { r: 255, g: 100, b: 100 },  // Red-orange
            'Venus': { r: 255, g: 165, b: 0 },   // Orange
            'Jupiter': { r: 218, g: 165, b: 32 }, // Golden
            'Saturn': { r: 250, g: 213, b: 165 }, // Pale gold
            'Uranus': { r: 79, g: 208, b: 227 },  // Cyan
            'Neptune': { r: 65, g: 105, b: 225 }, // Blue
        };
        
        // Try to parse rgba() format
        const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaMatch) {
            return {
                r: parseInt(rgbaMatch[1]),
                g: parseInt(rgbaMatch[2]),
                b: parseInt(rgbaMatch[3])
            };
        }
        
        // Fall back to planet-specific default or generic blue
        return defaultColors[body.name] || { r: 135, g: 206, b: 250 };
    }

    /**
     * Draw Enhanced Body Labels and Information
     * Renders planet names, sizes, and atmospheric data
     * 
     * @param {object} body - Celestial body
     * @param {object} screenPos - Screen position {x, y}
     * @param {number} planetRadius - Planet radius in pixels
     * @param {number} atmosphericRadius - Atmospheric radius in pixels
     */
    _drawBodyLabels(body, screenPos, planetRadius, atmosphericRadius) {
        const g = this.ctx;
        
        // Calculate label positioning
        const labelY = screenPos.y - Math.max(planetRadius, atmosphericRadius) - 8;
        const infoY = screenPos.y + Math.max(planetRadius, atmosphericRadius) + 15;
        
        // === PLANET NAME ===
        g.fillStyle = 'white';
        g.font = `${Math.min(16, Math.max(10, planetRadius * 0.6))}px Arial Bold`;
        g.textAlign = 'center';
        g.fillText(body.name, screenPos.x, labelY);
        
        // === SIZE INFORMATION ===
        if (this.useRealScale && planetRadius > 5) {
            g.font = '10px Arial';
            
            // Show planet size
            const sizeText = body.radius > 10000 ? 
                `${(body.radius/1000).toFixed(0)}k km` :  // Show as thousands for large bodies
                `${body.radius.toFixed(0)} km`;           // Show in km for smaller bodies
            
            g.fillText(sizeText, screenPos.x, infoY);
            
            // === ATMOSPHERIC INFORMATION ===
            if (atmosphericRadius > planetRadius && this.cameraMode === 3) {
                const atmosphericSummary = body.getAtmosphericSummary?.();
                if (atmosphericSummary) {
                    g.font = '8px Arial';
                    g.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    
                    // Show surface pressure if available
                    if (atmosphericSummary.estimatedSurfacePressure > 0) {
                        const pressure = atmosphericSummary.estimatedSurfacePressure;
                        let pressureText;
                        if (pressure > 100000) {
                            pressureText = `${(pressure / 100000).toFixed(1)} bar`;
                        } else if (pressure > 1000) {
                            pressureText = `${(pressure / 1000).toFixed(1)} kPa`;
                        } else {
                            pressureText = `${pressure.toFixed(0)} Pa`;
                        }
                        g.fillText(`Pressure: ${pressureText}`, screenPos.x, infoY + 12);
                    }
                    
                    // Show surface density
                    if (atmosphericSummary.surfaceDensity > 0) {
                        const density = atmosphericSummary.surfaceDensity;
                        const densityText = density > 1 ? 
                            `${density.toFixed(1)} kg/m³` : 
                            `${(density * 1000).toFixed(0)} g/m³`;
                        g.fillText(`Density: ${densityText}`, screenPos.x, infoY + 24);
                    }
                }
            }
        }
        
        // === DISTANCE INFORMATION IN PLANET MODE ===
        if (this.cameraMode === 3 && this.targetPlanet && body.name !== this.targetPlanet) {
            const targetBody = this.bodies.find(b => b.name === this.targetPlanet);
            if (targetBody) {
                const distance = body.getDistanceFrom(targetBody);
                g.font = '8px Arial';
                g.fillStyle = 'rgba(255, 255, 0, 0.8)'; // Yellow for distance info
                
                let distanceText;
                if (distance > 1e11) {
                    distanceText = `${(distance / 1.496e11).toFixed(2)} AU`;
                } else if (distance > 1e9) {
                    distanceText = `${(distance / 1e9).toFixed(1)} Gm`;
                } else if (distance > 1e6) {
                    distanceText = `${(distance / 1e6).toFixed(1)} Mm`;
                } else {
                    distanceText = `${(distance / 1e3).toFixed(0)} km`;
                }
                
                g.fillText(`${distanceText} from ${this.targetPlanet}`, screenPos.x, infoY + 36);
            }
        }
    }

    /**
     * Draw Orbital Trail
     * Renders the path a celestial body has taken over time
     * 
     * @param {object} body - Celestial body whose trail to draw
     */
    _drawTrail(body) {
        // Skip if no trail data or insufficient points
        if (!body.trail || body.trail.length < 2) return;

        const g = this.ctx; // Get rendering context
        g.beginPath();      // Start new path for trail
        
        let firstPoint = true; // Track first point for path drawing
        
        // Draw line connecting all trail points
        for (const point of body.trail) {
            // Convert each trail point from world to screen coordinates
            const screenPos = this.coordSystem.worldToScreen(point.x, point.y);
            
            if (firstPoint) {
                // First point: move to position without drawing
                g.moveTo(screenPos.x, screenPos.y);
                firstPoint = false;
            } else {
                // Subsequent points: draw line from previous point
                g.lineTo(screenPos.x, screenPos.y);
            }
        }
        
        // Style and draw the trail
        g.strokeStyle = this._colorToRgba(body.color, 0.4); // Semi-transparent body color
        g.lineWidth = this.cameraMode === 3 ? 2 : 1; // Thicker trails in planet mode
        g.stroke(); // Draw the trail path
    }

    /**
     * Draw Reference Grid
     * Renders spatial reference lines and circles for scale awareness
     */
    _drawReferenceGrid() {
        const g = this.ctx;           // Get rendering context
        const w = this.canvas.width;  // Canvas width
        const h = this.canvas.height; // Canvas height

        // Set grid line style
        g.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Very faint white lines
        g.lineWidth = 1; // Thin lines

        // Draw center cross (vertical and horizontal axes)
        g.beginPath();
        g.moveTo(w / 2, 0);     // Vertical line top
        g.lineTo(w / 2, h);     // Vertical line bottom
        g.moveTo(0, h / 2);     // Horizontal line left
        g.lineTo(w, h / 2);     // Horizontal line right
        g.stroke();             // Draw the cross

        // Draw mode-appropriate reference circles
        const distances = this.coordSystem.getReferenceDistances();
        
        distances.forEach((distance, index) => {
            // Convert distance to screen radius
            const screenRadius = distance / this.coordSystem.metersPerPixel;
            
            // Only draw if circle fits on screen and is large enough to see
            if (screenRadius < w / 2 && screenRadius > 10) {
                // Draw reference circle
                g.beginPath();
                g.arc(w / 2, h / 2, screenRadius, 0, 2 * Math.PI); // Circle centered on screen
                g.stroke();
                
                // Label the circle with distance
                g.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Semi-transparent white
                g.font = '10px Arial';                     // Small font for labels
                const label = this._formatDistance(distance); // Format distance for display
                g.fillText(label, w / 2 + screenRadius + 5, h / 2); // Position label next to circle
            }
        });
    }

    /**
     * Format Distance for Display
     * Converts raw distance in meters to human-readable format
     * 
     * @param {number} meters - Distance in meters
     * @returns {string} Formatted distance string
     */
    _formatDistance(meters) {
        if (meters < 1000) {
            // Less than 1 km - show in meters
            return `${meters.toFixed(0)} m`;
        } else if (meters < 1000000) {
            // Less than 1000 km - show in kilometers
            return `${(meters / 1000).toFixed(1)} km`;
        } else if (meters < 1.496e11) {
            // Less than 1 AU - show in megameters
            return `${(meters / 1000000).toFixed(1)} Mm`;
        } else {
            // 1 AU or more - show in Astronomical Units
            return `${(meters / 1.496e11).toFixed(2)} AU`;
        }
    }

    /**
     * Draw User Interface
     * Renders information overlay showing simulation status and controls
     */
    _drawUI() {
        const g = this.ctx; // Get rendering context
        
        // Set UI text style
        g.fillStyle = 'white';     // White text for visibility
        g.font = '12px Arial';     // Standard font size
        g.textAlign = 'left';      // Left-aligned text
        
        let y = 20;                // Starting Y position for text
        const lineHeight = 15;     // Space between lines

        // Display camera mode information
        const modeNames = {
            1: 'Solar System',   // Mode 1 display name
            2: 'Inner Planets',  // Mode 2 display name
            3: 'Planet (Enhanced)' // Mode 3 display name with enhancement indicator
        };
        const modeText = modeNames[this.cameraMode];
        g.fillText(`Camera Mode: ${this.cameraMode} (${modeText})`, 10, y);
        y += lineHeight;
        
        // Display current scale information
        g.fillText(`Scale: ${this.coordSystem.getScaleDescription()}`, 10, y);
        y += lineHeight;
        
        // Display current planet scaling multipliers
        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        g.fillText(`Planet Scaling: Sun ${multipliers.sunMultiplier}x, Planets ${multipliers.planetMultiplier}x`, 10, y);
        y += lineHeight;
        
        // Show enhanced planet mode features
        if (this.cameraMode === 3) {
            g.fillText(`Planet Scale Boost: ${this.planetScaleBoost}x`, 10, y);
            y += lineHeight;
            
            g.fillText(`Atmosphere Rendering: ${this.showAtmospheres ? 'ON' : 'OFF'}`, 10, y);
            y += lineHeight;
            
            if (this.showAtmospheres) {
                g.fillText(`Atmosphere Opacity: ${(this.atmosphereOpacity * 100).toFixed(0)}%`, 10, y);
                y += lineHeight;
            }
        }
        
        // Show manual scaling status if enabled
        if (this.overridePlanetScaling) {
            g.fillText('Manual Scaling: ON', 10, y);
            y += lineHeight;
        }
        
        // Show target planet if in planet mode
        if (this.cameraMode === 3 && this.targetPlanet) {
            g.fillText(`Following: ${this.targetPlanet}`, 10, y);
            y += lineHeight;
        }
        
        // Show physical scale status
        if (this.useRealScale) {
            g.fillText('True Physical Scale Base', 10, y);
            y += lineHeight;
        }
        
        // Display time acceleration
        g.fillText(`Time: ${this.timeMultiplier.toFixed(0)}x`, 10, y);
        y += lineHeight;
        
        // Display simulation time in appropriate units
        const simDays = this.simulationTime / 86400; // Convert seconds to days
        if (simDays > 365) {
            // More than a year - show in years
            g.fillText(`${(simDays / 365.25).toFixed(2)} years`, 10, y);
        } else {
            // Less than a year - show in days
            g.fillText(`${simDays.toFixed(1)} days`, 10, y);
        }
        y += lineHeight;

        // Display current camera position
        const center = this.coordSystem.cameraCenter;
        g.fillText(`Camera: (${(center.x/1e9).toFixed(2)}, ${(center.y/1e9).toFixed(2)}) Gm`, 10, y);
        y += lineHeight;
        
        // Display control hints in smaller font
        g.font = '10px Arial'; // Smaller font for hints
        g.fillText('Editor Properties:', 10, y);
        y += 12;
        g.fillText('• planetScaleBoost: Planet size multiplier for Mode 3', 10, y);
        y += 12;
        g.fillText('• showAtmospheres: Enable atmospheric rendering', 10, y);
        y += 12;
        g.fillText('• atmosphereOpacity: Atmosphere transparency (0-1)', 10, y);
        y += 12;
        g.fillText(`• targetPlanet: ${this.targetPlanet} (for planet mode)`, 10, y);
    }

    /**
     * Adjust Color Brightness
     * Utility function to lighten or darken colors
     * 
     * @param {string} color - Original color
     * @param {number} factor - Brightness factor (-1 to 1)
     * @returns {string} Adjusted color
     */
    _adjustColorBrightness(color, factor) {
        // Simple brightness adjustment for hex colors
        if (color.startsWith('#')) {
            const r = Math.min(255, Math.max(0, parseInt(color.slice(1, 3), 16) + factor * 255));
            const g = Math.min(255, Math.max(0, parseInt(color.slice(3, 5), 16) + factor * 255));
            const b = Math.min(255, Math.max(0, parseInt(color.slice(5, 7), 16) + factor * 255));
            return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        }
        return color; // Return original if not hex
    }

    /**
     * Convert Color to RGBA with Alpha
     * Utility function to add transparency to hex colors
     * 
     * @param {string} color - Color in hex format (#RRGGBB)
     * @param {number} alpha - Alpha value (0.0 to 1.0)
     * @returns {string} RGBA color string
     */
    _colorToRgba(color, alpha) {
        if (color.startsWith('#')) {
            // Parse hex color and add alpha
            const r = parseInt(color.slice(1, 3), 16); // Red component
            const g = parseInt(color.slice(3, 5), 16); // Green component
            const b = parseInt(color.slice(5, 7), 16); // Blue component
            return `rgba(${r}, ${g}, ${b}, ${alpha})`; // Return RGBA string
        }
        // If not hex color, return as-is
        return color;
    }
}



