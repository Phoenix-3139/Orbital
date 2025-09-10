import {Component, Property} from '@wonderlandengine/api';
import {Body} from './body.js';
import {PhysicsCalculator} from './PhysicsCalculator.js';

export class Drawer extends Component {
  static TypeName = 'orbital-simulation';
  static Properties = {
    material: Property.material(),
    bgColor: Property.string('#111214'),
    paused: Property.bool(false),
    timeMultiplier: Property.float(100000), // Expose timeMultiplier in the editor
  };

  // Global scaling factor for positions
  scalingFactor = 1e-9;

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

    // Initialize the Sun
    const sun = new Body();
    sun.setName('Sun');
    sun.setMass(Body.sunMass);
    sun.setPosition(Body.sunPosition.x, Body.sunPosition.y);
    sun.setVelocity(0, 0);
    this.bodies.push(sun);

    // Initialize the Earth
    const earth = new Body();
    earth.setName('Earth');
    earth.setMass(Body.earthMass);
    earth.setPosition(Body.day1PositionEarth.x, Body.day1PositionEarth.y);
    earth.setVelocity(Body.day1VelocityEarth.x, Body.day1VelocityEarth.y);
    this.bodies.push(earth);
  }

  _redrawStatic() {
    const g = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw background
    g.fillStyle = this.bgColor;
    g.fillRect(0, 0, w, h);

    // Draw grid lines (optional)
    g.strokeStyle = 'rgba(255, 255, 255, 0.96)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w / 2, h);
    g.moveTo(0, h / 2);
    g.lineTo(w, h / 2);
    g.stroke();
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
      const radius = Math.log10(body.mass) * 0.5; // Scale radius down further

      g.beginPath();
      g.arc(
        position.x * this.scalingFactor + w / 2, // Scale position and center on canvas
        position.y * this.scalingFactor + h / 2,
        radius,
        0,
        2 * Math.PI
      );

      // Set color based on the body name
      if (body.name === 'Sun') {
        g.fillStyle = 'yellow';
      } else if (body.name === 'Earth') {
        g.fillStyle = 'blue';
      } else {
        g.fillStyle = 'white';
      }

      g.fill();
    });
  }

  _simulateGravity(dt) {
    // Get the Sun and Earth
    const sun = this.bodies.find((body) => body.name === 'Sun');
    const earth = this.bodies.find((body) => body.name === 'Earth');

    if (!sun || !earth) {
      console.error('Sun or Earth is missing from the simulation.');
      return;
    }

    // Calculate the distance between the Sun and Earth
    const dx = earth.getPosition().x - sun.getPosition().x;
    const dy = earth.getPosition().y - sun.getPosition().y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the gravitational force
    const force = PhysicsCalculator.calculateGravForces(sun.mass, earth.mass, distance);

    // Calculate the acceleration on Earth
    const acceleration = PhysicsCalculator.calculateGravAcceleration(force, earth.mass);
    const ax = (-dx / distance) * acceleration;
    const ay = (-dy / distance) * acceleration;

    // Update Earth's velocity
    const velocity = earth.getVelocity();
    earth.setVelocity(velocity.x + ax * dt, velocity.y + ay * dt);

    // Update Earth's position
    const position = earth.getPosition();
    earth.setPosition(
      position.x + velocity.x * dt,
      position.y + velocity.y * dt
    );
  }
}
