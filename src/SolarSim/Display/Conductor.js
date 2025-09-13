import {Component, Property} from '@wonderlandengine/api';
import { CanvasManager } from './Rendering/CanvasManager.js';
import { SimulationController } from './Rendering/SimulationController.js';
import { CameraController } from './Rendering/CameraController.js';
import { PlanetRenderer } from './Rendering/Planetary Render/PlanetRenderer.js';
import { AtmosphereRenderer } from './Rendering/Planetary Render/AtmosphereRenderer.js';
import { GridRenderer } from './Rendering/GridRenderer.js';
import { UIRenderer } from './Rendering/UIRenderer.js';

export class Drawer extends Component {
    static TypeName = 'orbital-simulation';
    
    static Properties = {
        // Rendering Properties
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        
        // Simulation Control Properties
        paused: Property.bool(false),
        timeMultiplier: Property.float(2000000),
        
        // Visual Display Properties
        showOrbits: Property.bool(true),
        maxTrailLength: Property.int(4000),
        enablePerturbations: Property.bool(false),
        showOuterPlanets: Property.bool(true),
        useRealScale: Property.bool(true),
        
        // Enhanced Planet Rendering Properties
        showAtmospheres: Property.bool(true),
        atmosphereOpacity: Property.float(0.3),
        planetScaleBoost: Property.float(3.0),
        
        // Camera Mode Controls (updated for mode 4)
        cameraMode: Property.int(1), // 1=Solar, 2=Inner, 3=Planet, 4=Atmosphere
        targetPlanet: Property.string('Earth'),
        enableCameraSmoothing: Property.bool(false),
        manualZoom: Property.float(1.0),
        
        // Atmospheric Layer Properties (new)
        showAtmosphericLayers: Property.bool(true),
        layerDetail: Property.int(5), // Number of atmospheric layers to render
        
        // Manual Scaling Override Properties
        overridePlanetScaling: Property.bool(false),
        manualSunMultiplier: Property.float(0.1),
        manualPlanetMultiplier: Property.float(50.0),
        
        // Minimum Display Properties
        minPlanetPixels: Property.float(2.0),
    };

    start() {
        console.log('Orbital Simulation starting...');
        
        try {
            // Initialize all subsystems with error checking
            console.log('Initializing CanvasManager...');
            this.canvasManager = new CanvasManager(this.engine, this.material, this.bgColor);
            if (!this.canvasManager.initialize()) {
                console.error('Failed to initialize CanvasManager');
                this.initialized = false;
                return;
            }

            console.log('Initializing SimulationController...');
            this.simulationController = new SimulationController(this.timeMultiplier, this.maxTrailLength);
            
            console.log('Initializing CameraController...');
            this.cameraController = new CameraController(this.canvasManager.canvas.width, this.canvasManager.canvas.height);
            
            console.log('Initializing AtmosphereRenderer...');
            this.atmosphereRenderer = new AtmosphereRenderer(this.canvasManager, this.cameraController.coordSystem);
            
            console.log('Initializing PlanetRenderer...');
            this.planetRenderer = new PlanetRenderer(this.canvasManager, this.cameraController.coordSystem, this.atmosphereRenderer);
            
            console.log('Initializing GridRenderer...');
            this.gridRenderer = new GridRenderer(this.canvasManager, this.cameraController.coordSystem);
            
            console.log('Initializing UIRenderer...');
            this.uiRenderer = new UIRenderer(this.canvasManager, this.cameraController.coordSystem, this.gridRenderer);

            console.log('Initializing simulation state...');
            this.simulationController.initState();
            
            // Initialize camera with all required parameters
            console.log('Initializing camera...');
            this.cameraController.initCamera(
                this.cameraMode, this.targetPlanet, this.simulationController.bodies,
                this.enableCameraSmoothing, this.planetScaleBoost, this.overridePlanetScaling,
                this.manualSunMultiplier, this.manualPlanetMultiplier, this.minPlanetPixels, this.manualZoom
            );
            
            this.initialized = true;
            this._startSimulationLoop();
            console.log('Orbital Simulation initialized successfully!');
            
        } catch (error) {
            console.error('Error during initialization:', error);
            this.initialized = false;
        }
    }

    update(dt) {
        // Check if properly initialized
        if (!this.initialized || !this.simulationController || !this.cameraController || !this.canvasManager) {
            console.warn('Orbital simulation not properly initialized, skipping update');
            return;
        }

        if (this.paused) return;

        try {
            // Update simulation with deltaTime
            this.simulationController.updateSimulation(dt);
            
            // Update camera
            this.cameraController.updateCamera(
                this.cameraMode, this.targetPlanet, this.simulationController.bodies,
                this.planetScaleBoost, this.overridePlanetScaling, this.manualSunMultiplier,
                this.manualPlanetMultiplier, this.minPlanetPixels
            );
            
            // Render frame
            this._render();
            
        } catch (error) {
            console.error('Error during update:', error);
        }
    }

    _render() {
        try {
            this.canvasManager.clearCanvas();
            
            // Draw grid for all modes
            this.gridRenderer.drawReferenceGrid();
            
            // Get visible bodies with all required parameters
            const visibleBodies = this.simulationController.getVisibleBodies(
                this.cameraMode, this.showOuterPlanets, this.cameraController.coordSystem
            );
            
            visibleBodies.forEach(body => {
                // Render bodies for modes 1, 2, 3
                if (this.cameraMode >= 1 && this.cameraMode <= 3) {
                    this.planetRenderer.drawBodyWithAtmosphere(
                        body, this.showAtmospheres, this.atmosphereOpacity, this.useRealScale,
                        this.minPlanetPixels, this.cameraMode, this.planetScaleBoost,
                        this.showAtmosphericLayers, this.layerDetail
                    );
                    
                    // Show orbits
                    if (this.showOrbits) {
                        this.gridRenderer.drawTrail(body, this.showOrbits);
                    }
                }
            });
            
            // Draw UI
            this.uiRenderer.drawUI(
                this.cameraMode, this.useRealScale, this.showAtmospheres, this.atmosphereOpacity,
                this.planetScaleBoost, this.timeMultiplier, this.simulationController.simulationTime,
                this.targetPlanet, this.overridePlanetScaling, this.simulationController.bodies
            );
            
            this.canvasManager.updateTexture();
            
        } catch (error) {
            console.error('Error during rendering:', error);
        }
    }

    _startSimulationLoop() {
        console.log('Solar System Simulation Started');
        console.log(`Camera Mode: ${this.cameraMode}`);
        console.log(`Time Multiplier: ${this.timeMultiplier}x`);
        console.log(`Planet Scale Boost: ${this.planetScaleBoost}x`);
    }

    /**
     * Get Current Camera Mode as String (updated)
     */
    _getCurrentModeString() {
        const modes = {
            1: 'SOLAR_SYSTEM',
            2: 'INNER_PLANETS',
            3: 'PLANET',
            4: 'ATMOSPHERE'
        };
        return modes[this.cameraMode];
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
     * Set target planet and clear surface cache if changing planets in surface mode
     */
    setTargetPlanet(planetName) {
        const previousPlanet = this.targetPlanet;
        this.targetPlanet = planetName;
        
        // Clear surface cache when changing planets in surface mode
        if (this.cameraMode === 4 && previousPlanet !== planetName && this.planetRenderer?.surfaceRenderer) {
            this.planetRenderer.surfaceRenderer.clearCache();
            console.log(`Cleared surface cache for planet change: ${previousPlanet} -> ${planetName}`);
        }
        
        console.log(`Target planet changed to: ${planetName}`);
    }
}