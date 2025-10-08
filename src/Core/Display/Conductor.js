import { Component, Property } from '@wonderlandengine/api';
import { CanvasManager } from './Rendering/CanvasManager.js';
import { SimulationController } from './Rendering/SimulationController.js';
import { CameraController } from './Rendering/CameraController.js';
import { Renderer } from './Rendering/Renderer.js';

export class Drawer extends Component {
    static TypeName = 'orbital-simulation';
    
    static Properties = {
        // Rendering Properties
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        paused: Property.bool(false),
        timeMultiplier: Property.float(2000000),
        showOrbits: Property.bool(true),
        // maxTrailLength: Property.int(4000), // REMOVED: trail length is now dynamic
        enablePerturbations: Property.bool(false),
        showOuterPlanets: Property.bool(true),
        useRealScale: Property.bool(true),
        planetScaleBoost: Property.float(3.0),
        cameraMode: Property.int(1),
        targetPlanet: Property.string('Earth'),
        minPlanetPixels: Property.float(4.0),
    };

    start() {
        console.log('Orbital Simulation starting...');
        
        try {
            // Initialize all subsystems with error checking
            console.log('Initializing CanvasManager...');
            this.canvasManager = new CanvasManager(this.engine, this.material, this.bgColor);

            // Guard the initialize call and surface any exception once
            var canvasInitOk = false;
            try {
                if (typeof this.canvasManager.initialize === 'function') {
                    canvasInitOk = this.canvasManager.initialize();
                } else {
                    // If initialize isn't present, assume canvasManager created the canvas already
                    canvasInitOk = true;
                }
            } catch (e) {
                console.error('CanvasManager.initialize() threw:', e);
                canvasInitOk = false;
            }

            if (!canvasInitOk) {
                console.error('Failed to initialize CanvasManager');
                this.initialized = false;
                return;
            }

            console.log('Initializing SimulationController...');
            // removed undefined this.maxTrailLength argument (was causing issues)
            this.simulationController = new SimulationController(this.timeMultiplier);
            
            console.log('Initializing CameraController...');
            this.cameraController = new CameraController(this.canvasManager.canvas.width, this.canvasManager.canvas.height);
            
            console.log('Initializing Renderer...');
            this.renderer = new Renderer(this.canvasManager, this.cameraController.coordSystem);

            console.log('Initializing simulation state...');
            this.simulationController.initState();
            
            // Initialize camera with all required parameters
            console.log('Initializing camera...');
            this.cameraController.initCamera(
                this.cameraMode, this.targetPlanet, this.simulationController.bodies,
                false, this.planetScaleBoost, false, 0, 0, this.minPlanetPixels, 1.0
            );
            
            this.initialized = true;
            console.log('Orbital Simulation initialized successfully!');
            
        } catch (error) {
            console.error('Error during initialization:', error);
            this.initialized = false;
        }
    }

    update(dt) {
        // Check if properly initialized - silently return to avoid frame spam
        if (!this.initialized || this.paused) {
            return;
        }

        try {
            // Update simulation with deltaTime
            this.simulationController.updateSimulation(dt);
            this.cameraController.updateCamera(
                this.cameraMode, this.targetPlanet, this.simulationController.bodies,
                this.planetScaleBoost, false, 0, 0, this.minPlanetPixels, 1.0
            );
            
            // Render frame
            this._render();
        } catch (error) {
            console.error('Error during update:', error);
        }
    }

    _render() {
        try {
            // Clear
            this.renderer.clear(this.bgColor);
            this.renderer.drawGrid();
            
            // Get visible bodies
            const visibleBodies = this.simulationController.getVisibleBodies(
                this.cameraMode, this.showOuterPlanets, this.cameraController.coordSystem
            );
            
            // Draw trails
            if (this.showOrbits) {
                for (let i = 0; i < visibleBodies.length; i++) {
                    this.renderer.drawTrail(visibleBodies[i]);
                }
            }
            
            // Draw planets
            for (let i = 0; i < visibleBodies.length; i++) {
                this.renderer.drawPlanet(
                    visibleBodies[i], this.cameraMode, this.useRealScale,
                    this.minPlanetPixels, this.planetScaleBoost
                );
            }
            
            // Draw UI
            this.renderer.drawUI(
                this.cameraMode, this.timeMultiplier,
                this.simulationController.simulationTime, this.targetPlanet,
                this.useRealScale, this.planetScaleBoost
            );
            
            // Update texture
            this.canvasManager.updateTexture();
            
        } catch (error) {
            console.error('Error during rendering:', error);
        }
    }

    /**
     * Clean up on destroy
     */
    onDestroy() {
        console.log('Cleaning up Orbital Simulation...');
        this.initialized = false;
    }

    /**
     * Set camera mode (1, 2, 3 only)
     */
    setCameraMode(mode) {
        const previousMode = this.cameraMode;
        this.cameraMode = Math.max(1, Math.min(3, mode)); // Clamp between 1-3
        console.log(`Camera mode changed from ${previousMode} to ${this.cameraMode}`);
    }

    /**
     * Set target planet
     */
    setTargetPlanet(planetName) {
        const previousPlanet = this.targetPlanet;
        this.targetPlanet = planetName;
        console.log(`Target planet changed to: ${planetName}`);
    }
}