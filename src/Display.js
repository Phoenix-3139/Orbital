import {Component, Property} from '@wonderlandengine/api';
import {Body} from './body.js';
import {PhysicsCalculator} from './PhysicsCalculator.js';

export class Drawer extends Component {
    static TypeName = 'orbital-simulation';
    static Properties = {
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        paused: Property.bool(false),
        timeMultiplier: Property.float(500000), // Increased for better visualization
        showOrbits: Property.bool(true),
        maxTrailLength: Property.int(2000),
    };

    // Global scaling factor for positions (adjusted for full solar system)
    scalingFactor = 3e-10; // Smaller scale to fit all planets

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

        // Simulate gravity and update positions
        this._simulateGravity(scaledDt);

        // Draw dynamic elements
        this._drawDynamic();

        // Update the texture
        this.tex.update();
    }

    _initState() {
        // Initialize time and bodies
        this._t = 0;
        this.bodies = [];

        // Create all planets using the new NASA JPL Horizons data
        const planets = ['sun', 'mercury', 'venus', 'earth', 'mars'];
        
        planets.forEach(planetKey => {
            const body = new Body(planetKey);
            this.bodies.push(body);
        });

        console.log('Initialized solar system with NASA JPL Horizons data');
        console.log('Bodies:', this.bodies.map(b => `${b.name}: mass=${b.mass}, pos=(${(b.position.x/1e9).toFixed(2)}, ${(b.position.y/1e9).toFixed(2)}) Gm`));
    }

    _redrawStatic() {
        const g = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Draw background
        g.fillStyle = this.bgColor;
        g.fillRect(0, 0, w, h);

        // Draw subtle grid lines
        g.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        g.lineWidth = 1;
        g.beginPath();
        
        // Center cross
        g.moveTo(w / 2, 0);
        g.lineTo(w / 2, h);
        g.moveTo(0, h / 2);
        g.lineTo(w, h / 2);
        
        // Orbital reference circles (AU distances)
        const auInPixels = Body.AU_TO_METERS * this.scalingFactor;
        for (let au = 1; au <= 3; au++) {
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
        });

        // Draw simulation info
        g.fillStyle = 'white';
        g.font = '12px Arial';
        g.textAlign = 'left';
        g.fillText(`Time Multiplier: ${this.timeMultiplier.toFixed(0)}x`, 10, 20);
        g.fillText(`Scale: 1 px = ${(1/this.scalingFactor/1e9).toFixed(1)} Gm`, 10, 35);
        g.fillText('Dormand-Prince RK45 Adaptive Integration', 10, 50);
        if (this.lastTimeStep) {
            g.fillText(`Adaptive Step: ${(this.lastTimeStep).toFixed(6)}s`, 10, 65);
        }
        g.fillText('NASA JPL Horizons Data (2025-Sep-08)', 10, 80);
    }

    _simulateGravity(dt) {
        // Calculate gravitational forces between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            let totalAcceleration = { x: 0, y: 0 };

            // Calculate acceleration due to all other bodies
            for (let j = 0; j < this.bodies.length; j++) {
                if (i === j) continue; // Skip self

                const otherBody = this.bodies[j];
                const dx = otherBody.position.x - body.position.x;
                const dy = otherBody.position.y - body.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance === 0) continue; // Avoid division by zero

                // Calculate gravitational force
                const force = PhysicsCalculator.calculateGravForces(body.mass, otherBody.mass, distance);
                const acceleration = force / body.mass;

                // Add to total acceleration
                totalAcceleration.x += (dx / distance) * acceleration;
                totalAcceleration.y += (dy / distance) * acceleration;
            }

            // Update body's position and velocity using Verlet integration
            PhysicsCalculator.verletIntegration(body, dt, totalAcceleration);

            // Add the current position to the body's trail (except for Sun)
            if (body.trail !== null) {
                body.trail.push({ 
                    x: body.getPosition().x, 
                    y: body.getPosition().y 
                });

                // Limit the trail length to avoid memory issues
                if (body.trail.length > this.maxTrailLength) {
                    body.trail.shift();
                }
            }
        }
    }
}