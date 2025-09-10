import {Component, Material, Property} from '@wonderlandengine/api';

export class PhysicsCalculator extends Component {
    static Properties = {
        mass1: Property.float(1.0),
        mass2: Property.float(1.0),
        distance: Property.float(1.0),
        gravitationalConstant: Property.float(6.67430e-11),
        result: Property.float(0.0, {readOnly: true}),
    };
    
    calculateGravForces(mass1,mass2,distance)
{
    return (this.gravitationalConstant * mass1 * mass2) / (distance * distance);
}

    calculateGravAcceleration(force,mass)
{
    return force / mass;    
}



}
