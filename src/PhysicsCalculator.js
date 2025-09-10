// Removed Wonderland API imports
// import {Component, Material, Property} from '@wonderlandengine/api';

export class PhysicsCalculator /* Removed "extends Component" */ {
    // Gravitational constant as a static property
    static GRAVITATIONAL_CONSTANT = 6.67430e-11;

    /**
     * Calculate gravitational force between two masses.
     * @param {number} mass1 - Mass of the first object (kg).
     * @param {number} mass2 - Mass of the second object (kg).
     * @param {number} distance - Distance between the two objects (m).
     * @returns {number} Gravitational force (N).
     */
    static calculateGravForces(mass1, mass2, distance) {
        if (distance === 0) {
            throw new Error("Distance between objects cannot be zero.");
        }
        return (this.GRAVITATIONAL_CONSTANT * mass1 * mass2) / (distance * distance);
    }

    /**
     * Calculate gravitational acceleration.
     * @param {number} force - Gravitational force (N).
     * @param {number} mass - Mass of the object (kg).
     * @returns {number} Gravitational acceleration (m/s^2).
     */
    static calculateGravAcceleration(force, mass) {
        if (mass === 0) {
            throw new Error("Mass cannot be zero.");
        }
        return force / mass;
    }
}
