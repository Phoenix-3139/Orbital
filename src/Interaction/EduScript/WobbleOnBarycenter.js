import {Component, Property} from '@wonderlandengine/api';
import { CanvasManager } from '../../Core/Display/Rendering/CanvasManager.js';
import { SimulationController } from '../../Core/Display/Rendering/SimulationController.js';
import { CameraController } from '../../Core/Display/Rendering/CameraController.js';
import { Renderer } from '../../Core/Display/Rendering/Renderer.js';


export class WobbleOnBarycenter extends Component {
    static TypeName = 'WobbleOnBarycenter';
    /* Properties that are configurable in the editor */
    static Properties = {
        
        // Rendering Properties
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        paused: Property.bool(false),
        timeMultiplier: Property.float(15000.000),
        showOrbits: Property.bool(false),
        // maxTrailLength: Property.int(4000), // REMOVED: trail length is now dynamic
        showOuterPlanets: Property.bool(true),
        useRealScale: Property.bool(true),
        planetScaleBoost: Property.float(0.1),


        minPlanetPixels: Property.float(4.0),
    };

        cameraMode = 3;
        targetName = "Earth-Moon Barycenter";


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
                        canvasInitOk = this.canvasManager.initialize(256, 256);
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
                    this.cameraMode, this.targetName, this.simulationController.bodies,
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
                this.cameraMode, this.targetName, this.simulationController.bodies,
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
            if (this.showOrbits) 
            {
                for (let i = 0; i < visibleBodies.length; i++) {
                    this.renderer.drawTrail(visibleBodies[i], this.showOrbits);
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
                this.simulationController.simulationTime, this.targetName, 0.6
            );
            

            if(this.cameraMode === 2 && this.drawKeplerEllipse)
            {
            this.renderer.drawKeplerEllipse(this.simulationController.bodies[this.targetNameIndex]);
            }
                        
            // Update texture
            this.canvasManager.updateTexture();
            
        } catch (error) {
            console.error('Error during rendering:', error);
        }
    }

    // Cleanup on destroy
    onDestroy() {
        console.log('Cleaning up Orbital Simulation...');
        this.initialized = false;
    }
}
