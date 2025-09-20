import {PlanetarySystem} from '../../Physics/KeplerianOrbit.js';

/**
 * Simulation Controller
 * Manages the physics simulation, time progression, and body states
 */
export class SimulationController {
    constructor(timeMultiplier = 2000000, maxTrailLength = 4000) {
        this.timeMultiplier = timeMultiplier;
        this.maxTrailLength = maxTrailLength;
        
        this.simulationTime = 0;
        this.bodies = null;
        this.simulationInterval = null;
    }

    /**
     * Initialize simulation state (from original _initState method)
     */
    initState() {
        this.simulationTime = 0;
        
        // Create solar system with all planets using Keplerian orbital mechanics
        this.bodies = PlanetarySystem.createSolarSystem();
        
        // Update all planetary positions to initial time
        this.updateKeplerianOrbits();

        console.log('Simulation state initialized');
    }

    /**
     * Update Keplerian Orbital Positions (from original _updateKeplerianOrbits)
     */
    updateKeplerianOrbits() {
        this.bodies.forEach(body => {
            body.updatePosition(this.simulationTime);
            body.addToTrail(this.maxTrailLength);
        });
    }

    /**
     * Update simulation (from original update method)
     */
    updateSimulation(dt = 0.016) {
        // Scale delta time by time multiplier for faster/slower simulation
        const scaledDt = dt * this.timeMultiplier;
        
        // Advance simulation time
        this.simulationTime += scaledDt;

        // Update all planetary positions based on new time
        this.updateKeplerianOrbits();
    }

    /**
     * Start simulation loop (from original _startSimulationLoop)
     */
    startSimulationLoop(updateCallback) {
        const interval = 16;
        
        this.simulationInterval = setInterval(() => {
            updateCallback(interval / 1000);
        }, interval);
    }

    /**
     * Stop simulation loop
     */
    stopSimulationLoop() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    /**
     * Get visible bodies based on camera mode and settings
     */
    getVisibleBodies(cameraMode, showOuterPlanets, coordSystem) {
        let visibleBodies;
        if (cameraMode === 2) {
            visibleBodies = coordSystem.getVisiblePlanets(this.bodies);
        } else {
            visibleBodies = showOuterPlanets ? this.bodies : this.bodies.slice(0, 5);
        }
        return visibleBodies;
    }
}

export default SimulationController;