import {Component, Property} from '@wonderlandengine/api';
import {PlanetarySystem, KeplerianBody} from './KeplerianOrbit.js';

export class Drawer extends Component {
    static TypeName = 'orbital-simulation';
    static Properties = {
        material: Property.material(),
        bgColor: Property.string('#0a0a0a'),
        paused: Property.bool(false),
        timeMultiplier: Property.float(2000000), // Higher multiplier for outer planets
        showOrbits: Property.bool(true),
        maxTrailLength: Property.int(4000),
        enablePerturbations: Property.bool(false),
        showOuterPlanets: Property.bool(true), // Toggle for outer planets visibility
        autoScale: Property.bool(true), // Automatically adjust scale based on visible planets
        planetSizeScale: Property.float(1.0), // Exposed property to control planet size
        sunSizeScale: Property.float(1.0), // Exposed property to control sun size
    };

    // Global scaling factor for positions (will be dynamic)
    scalingFactor = 2e-11; // Much smaller for full solar system

    start() {
        // Initialize canvas and material
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.ctx = this.canvas.getContext('2d');
        this.tex = this.engine.textures.create(this.canvas);
        
        // Check if material is properly assigned
        if (this.material) {
            this.material.flatTexture = this.tex;
        } else {
            console.error('Material not assigned to orbital-simulation component');
            return;
        }

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

        // Auto-adjust scale if enabled
        if (this.autoScale) {
            this._adjustScale();
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

        console.log('Initialized Complete Solar System with NASA JPL Horizons data');
        this.bodies.forEach(body => {
            if (body.orbit) {
                const period = body.orbit.getOrbitalPeriod();
                const periodDays = period / 86400;
                const periodYears = periodDays / 365.25;
                console.log(`${body.name}: Period = ${periodYears.toFixed(2)} years (${periodDays.toFixed(0)} days), ` +
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
        if (this.simulationTime % 86400 < this.timeMultiplier / 60) { // Once per simulated day
            PlanetarySystem.calculatePerturbations(this.bodies, this.simulationTime);
        }
    }

    _adjustScale() {
        // Automatically adjust scale to show relevant planets
        const visibleBodies = this.showOuterPlanets ? this.bodies : this.bodies.slice(0, 5);
        let maxDistance = 0;
        
        visibleBodies.forEach(body => {
            if (body.orbit) {
                const distance = Math.sqrt(body.position.x**2 + body.position.y**2);
                maxDistance = Math.max(maxDistance, distance);
            }
        });
        
        if (maxDistance > 0) {
            // Scale to fit 80% of canvas
            const targetPixels = Math.min(this.canvas.width, this.canvas.height) * 0.4;
            this.scalingFactor = targetPixels / maxDistance;
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
        const auInPixels = 1.496e11 * this.scalingFactor;
        const maxAU = this.showOuterPlanets ? 35 : 5;
        
        for (let au = 1; au <= maxAU; au += this.showOuterPlanets ? 5 : 1) {
            const radius = au * auInPixels;
            if (radius < w/2 && radius < h/2) {
                g.beginPath();
                g.arc(w / 2, h / 2, radius, 0, 2 * Math.PI);
                g.stroke();
                
                // Label the AU circles
                g.fillStyle = 'rgba(255, 255, 255, 0.3)';
                g.font = '10px Arial';
                g.fillText(`${au} AU`, w/2 + radius + 5, h/2);
            }
        }
    }

    /**
     * Converts a color string (hex or named) to an rgba string.
     * @param {string} color The input color string.
     * @param {number} alpha The alpha transparency value (0-1).
     * @returns {string} The resulting rgba color string.
     */
    _colorToRgba(color, alpha) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // Basic handling for named colors
        const colorMap = {
            'yellow': '255, 255, 0',
            'blue': '0, 100, 255',
            'red': '255, 100, 100',
            'orange': '255, 165, 0'
        };
        const rgb = colorMap[color] || '200, 200, 200';
        return `rgba(${rgb}, ${alpha})`;
    }


    _drawDynamic() {
        const g = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear the canvas
        this._redrawStatic();

        // Filter bodies based on showOuterPlanets setting
        const visibleBodies = this.showOuterPlanets ? this.bodies : this.bodies.slice(0, 5);

        // Draw each visible body
        visibleBodies.forEach((body) => {
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
                
                // Set trail color with uniform transparency and line width
                g.strokeStyle = this._colorToRgba(body.color, 0.4);
                g.lineWidth = 1; // Uniform line width, no "glow" for the sun
                g.stroke();
            }

            // Calculate display position
            const displayX = position.x * this.scalingFactor + w / 2;
            const displayY = position.y * this.scalingFactor + h / 2;
            
            // Calculate display radius using the exposed size scale properties
            let radius;
            if (body.name === 'Sun') {
                radius = body.getDisplayRadius() * this.sunSizeScale;
            } else {
                radius = body.getDisplayRadius() * this.planetSizeScale;
                // Make outer planets more visible for clarity
                if (body.name === 'Jupiter' || body.name === 'Saturn') radius *= 1.5;
                if (body.name === 'Uranus' || body.name === 'Neptune') radius *= 2;
            }


            // Draw the body
            g.beginPath();
            g.arc(displayX, displayY, radius, 0, 2 * Math.PI);
            g.fillStyle = body.color;
            g.fill();

            // Draw planet labels (only if they're reasonably sized)
            if (radius > 1) {
                g.fillStyle = 'white';
                g.font = '10px Arial';
                g.textAlign = 'center';
                g.fillText(body.name, displayX, displayY - radius - 5);
                
                // Draw orbital information for planets
                if (body.orbit && body.trueAnomaly !== undefined) {
                    g.font = '8px Arial';
                    g.fillText(`${(body.distance / 1.496e11).toFixed(2)} AU`, displayX, displayY + radius + 10);
                }
            }
        });

        // Draw simulation info
        g.fillStyle = 'white';
        g.font = '12px Arial';
        g.textAlign = 'left';
        g.fillText(`Time Multiplier: ${this.timeMultiplier.toFixed(0)}x`, 10, 20);
        g.fillText(`Scale: 1 px = ${(1/this.scalingFactor/1e9).toFixed(2)} Gm`, 10, 35);
        g.fillText('Keplerian Orbital Mechanics', 10, 50);
        g.fillText('Complete Solar System (NASA Data)', 10, 65);
        
        // Display simulation time
        const simDays = this.simulationTime / 86400;
        const simYears = simDays / 365.25;
        if (simYears > 1) {
            g.fillText(`Simulation Time: ${simYears.toFixed(2)} years`, 10, 80);
        } else {
            g.fillText(`Simulation Time: ${simDays.toFixed(1)} days`, 10, 80);
        }
        
        // Display current view mode
        g.fillText(`View: ${this.showOuterPlanets ? 'Full Solar System' : 'Inner Planets'}`, 10, 95);
        
        if (this.enablePerturbations) {
            g.fillText('Perturbations: ON', 10, 110);
        }
        
        if (this.autoScale) {
            g.fillText('Auto-Scale: ON', 10, 125);
        }
    }
}

