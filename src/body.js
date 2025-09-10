// No longer importing from Wonderland API
// import {Component, Property} from '@wonderlandengine/api';

export class Body /* Removed "extends Component" */ {
    // Removed static Properties block

    // Static data for celestial bodies
    static sunMass = 1.9885e30; // Mass of the Sun in kg
    static earthMass = 5.972e24; // Mass of the Earth in kg
    static sunPosition = { x: 0, y: 0 }; // Sun is at the origin
    static day1PositionEarth = { x: 143862981358.4671, y: -44110844776.26625 }; // Position in meters
    static day1VelocityEarth = { x: 8074.063535110422, y: 28410.84130928249 }; // Velocity in meters per second

    constructor() {
        // super(); // Removed call to parent constructor
        this.name = ''; // Default name
        this.mass = 0; // Default mass
        this.position = { x: 0, y: 0 }; // Default position
        this.velocity = { x: 0, y: 0 }; // Default velocity
    }

    getMass() {
        return this.mass;
    }

    getPosition() {
        return this.position;
    }

    setPosition(x, y) {
        this.position = { x: x, y: y };
    }

    getVelocity() {
        return this.velocity;
    }

    setVelocity(vx, vy) {
        this.velocity = { x: vx, y: vy };
    }

    setMass(mass) {
        this.mass = mass;
    }

    setName(name) {
        this.name = name;
    }
}