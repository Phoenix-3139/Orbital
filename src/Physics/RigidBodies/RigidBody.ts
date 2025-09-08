import { Vector2d, Coordinate2d, RigidBodyConstructorOptions } from "../../../Typings/Types";

export default class RigidBody {
	public mass: number;
	public velocity: Vector2d;
	public position: Coordinate2d;
	constructor(options: RigidBodyConstructorOptions) {
		this.mass = options.mass;
		this.velocity = options.velocity;
		this.position = options.position;
	}
}
