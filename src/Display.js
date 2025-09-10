import {Component, Property} from '@wonderlandengine/api';
import {PlanetarySystem, KeplerianBody} from './KeplerianOrbit.js';

export class Drawer extends Component {
    static TypeName = 'orbital-simulation';
    static Properties = {
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        paused: Property.bool(false),
        timeMultiplier: Property.float(1000000), // Much higher multiplier for Keplerian orbits
        showOrbits: Property.bool(true),
        maxTrailLength: Property.int(3000),
        enablePerturbations: Property.bool(false), // Optional planet-planet interactions
    };

    // Global scaling factor for positions
    scalingFactor = 4e-10; // Adjusted for Keplerian orbits

    start() {
        // Initialize canvas and material
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.ctx = this.canvas.getContext('2d');
        this.tex = this.engine.textures.create(this.canvas);
        this.material.flatTexture = this.tex;

        this._initState();
        this._redrawStatic();

        // Start the simulation loop
        this._startSimulationLoop();
    }

    _startSimulationLoop() {
        // Use setInterval to ensure the simulation continues even when the tab is inactive
        const interval = 16; // ~60 FPS (1000ms / 60)
        this.simulationInterval = setInterval(() => {
            if (!this.paused) {
                this.update(interval / 1000); // Convert interval to seconds
            }
        }, interval);
    }

    onDeactivate() {
        // Clear the simulation interval when the component is deactivated
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }

    update(dt) {
        if (this.paused) return;

        // Multiply the delta time by the time multiplier
        const scaledDt = dt * this.timeMultiplier;

        // Update simulation time
        this.simulationTime += scaledDt;

        // Update planetary positions using Keplerian orbits
        this._updateKeplerianOrbits();

        // Optionally calculate perturbations
        if (this.enablePerturbations) {
            this._calculatePerturbations();
        }

        // Draw dynamic elements
        this._drawDynamic();

        // Update the texture
        this.tex.update();
    }

    _initState() {
        // Initialize time and bodies using Keplerian orbital system
        this.simulationTime = 0;
        this.bodies = PlanetarySystem.createSolarSystem();
        
        // Initialize positions at time 0
        this._updateKeplerianOrbits();

        console.log('Initialized Keplerian Solar System');
        this.bodies.forEach(body => {
            if (body.orbit) {
                const period = body.orbit.getOrbitalPeriod();
                const periodDays = period / 86400;
                console.log(`${body.name}: Period = ${periodDays.toFixed(1)} days, ` +
                           `Semi-major axis = ${(body.orbit.a / 1.496e11).toFixed(3)} AU, ` +
                           `Eccentricity = ${body.orbit.e.toFixed(3)}`);
            }
        });
    }

    _updateKeplerianOrbits() {
        // Update each planet's position based on current simulation time
        this.bodies.forEach(body => {
            body.updatePosition(this.simulationTime);
            body.addToTrail(this.maxTrailLength);
        });
    }

    _calculatePerturbations() {
        // Calculate gravitational perturbations between planets
        // This is called much less frequently than position updates
        if (this.simulationTime % 86400 < this.timeMultiplier / 60) { // Once per simulated day
            PlanetarySystem.calculatePerturbations(this.bodies, this.simulationTime);
        }
    }

    _redrawStatic() {
        const g = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Draw background
        g.fillStyle = this.bgColor;
        g.fillRect(0, 0, w, h);

        // Draw subtle grid lines and orbital reference circles
        g.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        g.lineWidth = 1;
        g.beginPath();
        
        // Center cross
        g.moveTo(w / 2, 0);
        g.lineTo(w / 2, h);
        g.moveTo(0, h / 2);
        g.lineTo(w, h / 2);
        
        // Orbital reference circles (AU distances)
        const auInPixels = 1.496e11 * this.scalingFactor; // 1 AU in pixels
        for (let au = 0.5; au <= 2; au += 0.5) {
            g.beginPath();
            g.arc(w / 2, h / 2, au * auInPixels, 0, 2 * Math.PI);
            g.stroke();
        }
    }

    _drawDynamic() {
        const g = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear the canvas
        this._redrawStatic();

        // Draw each body
        this.bodies.forEach((body) => {
            const position = body.getPosition();
            
            // Draw the trail (if it exists and showOrbits is enabled)
            if (body.trail && this.showOrbits && body.trail.length > 1) {
                g.beginPath();
                body.trail.forEach((trailPoint, index) => {
                    const x = trailPoint.x * this.scalingFactor + w / 2;
                    const y = trailPoint.y * this.scalingFactor + h / 2;
                    if (index === 0) {
                        g.moveTo(x, y);
                    } else {
                        g.lineTo(x, y);
                    }
                });
                
                // Set trail color with transparency
                g.strokeStyle = body.color === 'yellow' ? 'rgba(255, 255, 0, 0.3)' : 
                               body.color === 'blue' ? 'rgba(0, 100, 255, 0.5)' :
                               body.color === 'red' ? 'rgba(255, 100, 100, 0.5)' :
                               body.color === 'orange' ? 'rgba(255, 165, 0, 0.5)' :
                               'rgba(200, 200, 200, 0.3)';
                g.lineWidth = body.name === 'Sun' ? 2 : 1;
                g.stroke();
            }

            // Calculate display position
            const displayX = position.x * this.scalingFactor + w / 2;
            const displayY = position.y * this.scalingFactor + h / 2;
            
            // Calculate display radius
            const radius = body.getDisplayRadius();

            // Draw the body
            g.beginPath();
            g.arc(displayX, displayY, radius, 0, 2 * Math.PI);
            g.fillStyle = body.color;
            g.fill();
            
            // Add a subtle glow for the Sun
            if (body.name === 'Sun') {
                g.beginPath();
                g.arc(displayX, displayY, radius * 2, 0, 2 * Math.PI);
                g.fillStyle = 'rgba(255, 255, 0, 0.2)';
                g.fill();
            }

            // Draw planet labels
            g.fillStyle = 'white';
            g.font = '10px Arial';
            g.textAlign = 'center';
            g.fillText(body.name, displayX, displayY - radius - 5);
            
            // Draw orbital information for planets
            if (body.orbit && body.trueAnomaly !== undefined) {
                g.font = '8px Arial';
                g.fillText(`${(body.distance / 1.496e11).toFixed(2)} AU`, displayX, displayY + radius + 10);
            }
        });

        // Draw simulation info
        g.fillStyle = 'white';
        g.font = '12px Arial';
        g.textAlign = 'left';
        g.fillText(`Time Multiplier: ${this.timeMultiplier.toFixed(0)}x`, 10, 20);
        g.fillText(`Scale: 1 px = ${(1/this.scalingFactor/1e9).toFixed(1)} Gm`, 10, 35);
        g.fillText('Keplerian Orbital Mechanics', 10, 50);
        g.fillText('Perfect Energy Conservation', 10, 65);
        
        // Display simulation time
        const simDays = this.simulationTime / 86400;
        const simYears = simDays / 365.25;
        if (simYears > 1) {
            g.fillText(`Simulation Time: ${simYears.toFixed(2)} years`, 10, 80);
        } else {
            g.fillText(`Simulation Time: ${simDays.toFixed(1)} days`, 10, 80);
        }
        
        if (this.enablePerturbations) {
            g.fillText('Perturbations: ON', 10, 95);
        }
    }
}