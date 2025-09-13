/**
 * Orbital Simulation Display Component
 * 
 * This is the main rendering component for the solar system simulation.
 * It handles:
 * - Canvas creation and management
 * - Real-time orbital mechanics visualization
 * - Multiple camera modes (Solar System, Inner Planets, Planet)
 * - Dynamic scaling and coordinate transformations
 * - UI rendering and user feedback
 * 
 * The component uses a Universal Coordinate System to handle the vast
 * scale differences between planetary and solar system views.
 */

// Import required Wonderland Engine components and simulation classes
import {Component, Property} from '@wonderlandengine/api';
import {PlanetarySystem, KeplerianBody} from './KeplerianOrbit.js';
import {UniversalCoordinateSystem} from './CoordinateSystem.js';

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
        
        // Initialize Universal Coordinate System
        // This handles all coordinate transformations between world space and screen space
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
        
        // Apply manual scaling overrides if enabled in editor
        if (this.overridePlanetScaling) {
            this._applyManualScaling();
        }
        
        // Apply manual zoom adjustment if specified
        if (this.manualZoom !== 1.0) {
            this.coordSystem.zoom(this.manualZoom);
        }

        // Log initialization status for debugging
        console.log('Camera System initialized');
        console.log(`Mode: ${this.cameraMode} (${this.coordSystem.cameraMode})`);
        console.log(`Scale: ${this.coordSystem.getScaleDescription()}`);
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
            
            // Reapply manual scaling if it was enabled
            if (this.overridePlanetScaling) {
                this._applyManualScaling();
            }
        }

        // Apply manual scaling updates in real-time if enabled
        // This allows live adjustment of scaling in editor
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
     * 
     * @param {object} body - Celestial body object (planet or sun)
     * @returns {number} Radius in pixels for rendering
     */
    _calculateDisplayRadius(body) {
        // If not using real scale, fall back to logarithmic scaling
        if (!this.useRealScale) {
            return body.getDisplayRadius(); // Use body's built-in display scaling
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
            return this.minPlanetPixels;
        }

        // Convert world radius to screen pixels using current scale
        const screenRadius = worldRadius / this.coordSystem.metersPerPixel;

        // Ensure minimum visibility - never smaller than minimum pixel size
        return Math.max(this.minPlanetPixels, screenRadius);
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

        // Render each visible celestial body
        visibleBodies.forEach((body) => {
            this._drawBody(body);           // Draw the planet/sun itself
            if (this.showOrbits) {          // Draw orbital trail if enabled
                this._drawTrail(body);
            }
        });

        // Draw user interface information overlay
        this._drawUI();
    }

    /**
     * Draw Individual Celestial Body
     * Renders a single planet or sun with proper scaling and labeling
     * 
     * @param {object} body - Celestial body to draw
     */
    _drawBody(body) {
        const g = this.ctx; // Get rendering context
        
        // Convert world position to screen coordinates
        const screenPos = this.coordSystem.worldToScreen(body.position.x, body.position.y);
        
        // Skip rendering if body is off-screen (performance optimization)
        const margin = 50; // Extra margin around screen edges
        if (screenPos.x < -margin || screenPos.x > this.canvas.width + margin ||
            screenPos.y < -margin || screenPos.y > this.canvas.height + margin) {
            return; // Body is not visible, skip rendering
        }

        // Calculate display radius based on camera mode and scaling
        const radius = this._calculateDisplayRadius(body);

        // Draw the celestial body as a filled circle
        g.beginPath();
        g.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI); // Draw circle
        g.fillStyle = body.color; // Use body's color
        g.fill(); // Fill the circle

        // Add outline for small objects to improve visibility
        if (radius < 5) {
            g.strokeStyle = body.color; // Use same color as fill
            g.lineWidth = 1;            // Thin outline
            g.stroke();                 // Draw the outline
        }

        // Draw label and size information if body is large enough
        if (radius > 1) {
            // Draw body name above the object
            g.fillStyle = 'white';      // White text for visibility
            g.font = `${Math.min(12, Math.max(8, radius * 0.8))}px Arial`; // Scale font with object size
            g.textAlign = 'center';     // Center text horizontally
            g.fillText(body.name, screenPos.x, screenPos.y - radius - 5); // Position above object
            
            // Show real-world size information if enabled and object is large enough
            if (this.useRealScale && radius > 3) {
                // Format size text based on scale (show km or thousands of km)
                const sizeText = body.radius > 1000 ? 
                    `${(body.radius/1000).toFixed(0)}k km` :  // Show as thousands for large bodies
                    `${body.radius.toFixed(0)} km`;           // Show in km for smaller bodies
                
                g.font = '8px Arial';       // Smaller font for size info
                g.fillText(sizeText, screenPos.x, screenPos.y + radius + 12); // Position below object
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
        g.lineWidth = 1;    // Thin line for trail
        g.stroke();         // Draw the trail path
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
            3: 'Planet'          // Mode 3 display name
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
        g.fillText('Editor: cameraMode 1=Solar, 2=Inner, 3=Planet', 10, y);
        y += 12;
        g.fillText(`targetPlanet: ${this.targetPlanet} (for planet mode)`, 10, y);
        y += 12;
        g.fillText('overridePlanetScaling: enable manual scaling', 10, y);
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



