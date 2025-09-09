import { Component, Property, Texture } from "@wonderlandengine/api";
import { property } from "@wonderlandengine/api/decorators.js";

export default class BouncingBallTelemetry extends Component {
	// Canvas
	public canvas: HTMLCanvasElement = document.createElement("canvas");
	public ctx: CanvasRenderingContext2D = this.canvas.getContext("2d")!;
	public tex: Texture = this.engine.textures.create(this.canvas);

	public ballVY!: number;
	public ballY!: number;
	public hBuffer!: any[];

	// Physics Constants
	public accelerationDueToGravity: number = 9.8;
	public damping: number = 0.8;
	public ballRadius: number = 20;

	public static override TypeName = "bouncing-ball-telemetry";

	@property.material()
	public material!: any;

	@property.bool()
	public paused!: boolean;

	@property.float(5.0)
	public loopDuration!: number;

	@property.string("#111214")
	public bgColor!: string;

	@property.string("#00e5ff")
	public ballColor!: string;

	@property.string("#00ff88")
	public graphColor!: string;

	private __t: number = 0;

	public override start() {
		this.canvas.width = 512;
		this.canvas.height = 512;
		this.material.flatTexture = this.tex;

		this.__initState();
		this.__redrawStatic();
	}

	public override update(dt: number) {
		if (this.paused) return;

		this.__t += dt;

		if (this.__t >= this.loopDuration) {
			this.__initState();
			this.__redrawStatic();
			return;
		}

		// Physics step
		this.ballVY -= this.accelerationDueToGravity * dt;
		this.ballY += this.ballVY * dt;

		if (this.ballY < 0) {
			this.ballY = 0;
			this.ballVY = -this.ballVY * this.damping;
		}

		// Track height (normalized)
		const hNorm = this.ballY / 1.0;
		this.hBuffer.push(hNorm);
		if (this.hBuffer.length > this.canvas.width / 2) this.hBuffer.shift();

		this.__drawDynamic();
		this.tex.update();
	}

	public override onDeactivate() {
		if (this.tex) this.tex.destroy();
	}

	private __initState() {
		this.__t = 0;
		this.ballY = 0.8;
		this.ballVY = 0;
		this.hBuffer = [];
	}

	private __redrawStatic() {
		const g = this.ctx;
		const w = this.canvas.width;
		const h = this.canvas.height;

		g.fillStyle = this.bgColor;
		g.fillRect(0, 0, w, h);

		g.strokeStyle = "rgba(255,255,255,0.1)";
		g.lineWidth = 1;
		g.beginPath();
		g.moveTo(w / 2, 0);
		g.lineTo(w / 2, h);
		g.stroke();
	}

	private __drawDynamic() {
		const g = this.ctx;
		const w = this.canvas.width;
		const h = this.canvas.height;
		const cx = w / 4;

		this.__redrawStatic();

		// Ball (left side)
		const yCanvas = h - this.ballY * (h * 0.9) - this.ballRadius;
		g.fillStyle = this.ballColor;
		g.beginPath();
		g.arc(cx, yCanvas, this.ballRadius, 0, Math.PI * 2);
		g.fill();

		// Graph (right side)
		const graphXStart = w / 2;
		g.beginPath();
		g.moveTo(graphXStart, h * (1 - this.hBuffer[0]));
		for (let i = 1; i < this.hBuffer.length; i++) {
			const x = graphXStart + i;
			const y = h * (1 - this.hBuffer[i]);
			g.lineTo(x, y);
		}
		g.strokeStyle = this.graphColor;
		g.lineWidth = 2;
		g.stroke();

		// Labels
		g.fillStyle = "#ffffff";
		g.font = "14px system-ui, sans-serif";
		g.fillText(`t: ${this.__t.toFixed(1)}s`, 10, 24);
		g.fillText(`height: ${this.ballY.toFixed(3)} m`, 10, 44);
		g.fillText(`velocity: ${this.ballVY.toFixed(3)} m/s`, 10, 64);
		g.fillText(`acceleration: -${this.accelerationDueToGravity.toFixed(1)} m/s²`, 10, 84);
	}
}
