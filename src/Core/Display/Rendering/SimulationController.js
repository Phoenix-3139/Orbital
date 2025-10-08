import { SolarSystem } from '../../Physics/KeplerianOrbit.js';
import { Body } from '../../Data/body.js';

/**
 * SimulationController
 * - Creates bodies from SolarSystem factory
 * - Keeps simulation time
 * - Updates positions and trails each tick
 */
export class SimulationController {
    constructor(timeMultiplier = 2000000, maxTrailPoints = 2000) {
        this.timeMultiplier = timeMultiplier;
        this.simulationTime = 0; // seconds
        this.bodies = [];
        this.maxTrailPoints = maxTrailPoints;
    }

    // Create bodies and set initial positions
    initState() {
        this.bodies = SolarSystem.createAllBodies();
        // Ensure each body has a trail array and initial position
        this.bodies.forEach(b => {
            if (!b.trail) b.trail = [];
        });
        this.updateKeplerianOrbits(); // set positions at t=0
    }

    // Update orbital positions and trails
    updateKeplerianOrbits() {
        // 1) Update primary bodies (no orbit or orbit around Sun)
        for (const body of this.bodies) {
            if (!body.orbit || !body.orbit.centralBody || body.orbit.centralBody === 'sun') {
                body.updatePosition(this.simulationTime);
            }
        }

        // 2) Update secondary bodies (orbit around another body)
        for (const body of this.bodies) {
            if (body.orbit && body.orbit.centralBody && body.orbit.centralBody !== 'sun') {
                const centralKey = body.orbit.centralBody;
                const centralData = Body.planetData[centralKey];
                const parent = centralData ? this.bodies.find(b => b.name === centralData.name) : null;

                // Update relative position then convert to absolute if parent exists
                body.updatePosition(this.simulationTime);

                if (parent) {
                    body.position.x += parent.position.x;
                    body.position.y += parent.position.y;
                }
            }
        }

        // 3) Add current position to each body's trail (bounded)
        for (const body of this.bodies) {
            // Ensure trail exists
            if (!Array.isArray(body.trail)) body.trail = [];

            // Use body's own addToTrail if present, else fallback
            if (typeof body.addToTrail === 'function') {
                body.addToTrail(this.maxTrailPoints);
            } else {
                body.trail.push({ x: body.position.x, y: body.position.y });
                if (body.trail.length > this.maxTrailPoints) {
                    body.trail.shift();
                }
            }
        }
    }

    // Advance simulation by deltaTime (seconds)
    updateSimulation(deltaTime = 0.016) {
        // Convert real seconds to simulation seconds using multiplier
        this.simulationTime += deltaTime * this.timeMultiplier;
        this.updateKeplerianOrbits();
    }

    // Utility getters
    getBodies() {
        return this.bodies;
    }

    getSimulationTime() {
        return this.simulationTime;
    }

    setTimeMultiplier(mult) {
        this.timeMultiplier = Math.max(1, mult);
    }

    // Ensure this method exists so Conductor can call it.
    // Simple, safe implementation: return all bodies. Customize filtering later.
    getVisibleBodies(cameraMode, showOuterPlanets, coordSystem) {
        if (!Array.isArray(this.bodies)) {
            return [];
        }

        // Camera mode 3 (planet focus) - prefer using this.targetPlanet if present
        if (Number(cameraMode) === 3 && this.targetPlanet) {
            var targetName = this.targetPlanet;
            var result = [];
            for (var i = 0; i < this.bodies.length; i++) {
                var b = this.bodies[i];
                if (b.name === targetName || b.key === targetName) {
                    result.push(b);
                }
            }
            // include children orbiting the target (if orbit.centralBody uses keys)
            for (var j = 0; j < this.bodies.length; j++) {
                var c = this.bodies[j];
                if (c.orbit && (c.orbit.centralBody === targetName || c.orbit.centralBody === (result[0] && result[0].key))) {
                    result.push(c);
                }
            }
            if (result.length > 0) {
                return result;
            }
            // fall through to return all if target not found
        }

        // If showOuterPlanets explicitly false, try a best-effort filter:
        if (showOuterPlanets === false) {
            var filtered = [];
            for (var k = 0; k < this.bodies.length; k++) {
                var p = this.bodies[k];
                // avoid removing anything if no orbit data; keep safe default
                if (!p.orbit || !p.orbit.semiMajorAxis) {
                    filtered.push(p);
                    continue;
                }
                // keep inner planets within 6 AU (safe heuristic)
                if (p.orbit.semiMajorAxis < (6 * 149597870700)) {
                    filtered.push(p);
                }
            }
            return filtered;
        }

        // Default: return all bodies
        return this.bodies;
    }
}

export default SimulationController;