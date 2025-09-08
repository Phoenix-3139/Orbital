export type Vector2d = [number, number];
export type Coordinate2d = [number, number];

export type RigidBodyConstructorOptions = {
	mass: number;
	velocity: Vector2d;
	position: Coordinate2d;
};

