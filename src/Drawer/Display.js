import {Component, Property} from '@wonderlandengine/api';

export class BouncingBallTelemetry extends Component {
  static TypeName = 'bouncing-ball-telemetry';
  static Properties = {
    material: Property.material(),
    bgColor: Property.string('#111214'),
    ballColor: Property.string('#00e5ff'),
    graphColor: Property.string('#00ff88'),
    paused: Property.bool(false),
    loopDuration: Property.float(5.0), // seconds
  };

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    this.tex = this.engine.textures.create(this.canvas);
    this.material.flatTexture = this.tex;

    // Physics constants
    this.g = 9.8;
    this.damping = 0.8;
    this.ballRadius = 20;

    this._initState();
    this._redrawStatic();
  }

  update(dt) {
    if (this.paused) return;

    this._t += dt;

    if (this._t >= this.loopDuration) {
      this._initState();
      this._redrawStatic();
      return;
    }

    // Physics step
    this.ballVY -= this.g * dt;
    this.ballY += this.ballVY * dt;

    if (this.ballY < 0) {
      this.ballY = 0;
      this.ballVY = -this.ballVY * this.damping;
    }

    // Track height (normalized)
    const hNorm = this.ballY / 1.0;
    this.hBuffer.push(hNorm);
    if (this.hBuffer.length > this.canvas.width / 2) this.hBuffer.shift();

    this._drawDynamic();
    this.tex.update();
  }

  onDeactivate() {
    if (this.tex) this.tex.destroy();
  }

  _initState() {
    this._t = 0;
    this.ballY = 0.8;
    this.ballVY = 0;
    this.hBuffer = [];
  }

  _redrawStatic() {
    const g = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    g.fillStyle = this.bgColor;
    g.fillRect(0, 0, w, h);

    g.strokeStyle = 'rgba(255,255,255,0.1)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w / 2, h);
    g.stroke();
  }

  _drawDynamic() {
    const g = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 4;

    this._redrawStatic();

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
    g.fillStyle = '#ffffff';
    g.font = '14px system-ui, sans-serif';
    g.fillText(`t: ${this._t.toFixed(1)}s`, 10, 24);
    g.fillText(`height: ${this.ballY.toFixed(3)} m`, 10, 44);
    g.fillText(`velocity: ${this.ballVY.toFixed(3)} m/s`, 10, 64);
    g.fillText(`acceleration: -${this.g.toFixed(1)} m/s²`, 10, 84);
  }
}
