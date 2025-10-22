import ColorUtils from './ColorUtils.js';

/**
 * Unified Renderer - All rendering in one place
 * Handles planets, trails, labels, UI, and grid
 * Simple and beginner-friendly
 */
export class Renderer {
    constructor(canvasManager, coordSystem) {
        this.canvas = canvasManager.canvas;
        this.ctx = canvasManager.ctx;
        this.coordSystem = coordSystem;
        this.spriteCache = {};
        
        // Disable image smoothing for crisp sprites
        this.ctx.imageSmoothingEnabled = false;
    }

    // MARK: CLEAR SCREEN

    clear(bgColor) {
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //MARK: PLANET RENDERING

    drawPlanet(body, cameraMode, useRealScale, minSize, scaleBoost) {
        if (body.isBarycenter && cameraMode !== 3) {
            return;
        }

        const screenPos = this.coordSystem.worldToScreen(body.position.x, body.position.y);
        
        if (body.isBarycenter) {
            this.drawBarycenterMarker(screenPos);
            return;
        }

        const radius = this.calculateRadius(body, cameraMode, useRealScale, minSize, scaleBoost);

        if (body.spritePath) {
            if (!(body.name === "Moon" && (cameraMode === 1||cameraMode === 2))) {
                this.drawPlanetSprite(body, screenPos, radius);
            }
        } else {
            this.drawPlanetCircle(body, screenPos, radius);
        }

        if (radius >= 2 && !(body.name === "Earth-Moon Barycenter")) {
            if (!(body.name === "Moon" && (cameraMode === 1||cameraMode === 2))) {
                this.drawPlanetLabel(body.name, screenPos.x, screenPos.y - radius - 8, radius, cameraMode);
            }
        }
    }

    drawPlanetCircle(body, screenPos, radius) {
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = body.color;
        this.ctx.fill();


        if (radius >= 2) {
            this.ctx.strokeStyle = ColorUtils.adjustColorBrightness(body.color, 0.3);
            this.ctx.lineWidth = Math.max(0.5, radius * 0.05);
            this.ctx.stroke();
        }
    }

    drawPlanetSprite(body, screenPos, radius) 
    {
        const key = body.spritePath;
        
        if (this.spriteCache[key]) {
            this.ctx.drawImage(this.spriteCache[key], screenPos.x - radius, screenPos.y - radius, radius * 2, radius * 2);

            /*if (radius >= 2) {
                this.ctx.strokeStyle = ColorUtils.adjustColorBrightness(body.color, 0.3);
                this.ctx.lineWidth = Math.max(0.5, radius * 0.05);
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }*/
            return;
        }

        const img = new Image();
        img.onload = () => {
            this.spriteCache[key] = img;
        };
        img.src = key;
    }

    drawBarycenterMarker(screenPos) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    calculateRadius(body, cameraMode, useRealScale, minSize, scaleBoost) {
        if (!useRealScale) {
            const base = Math.max(2, Math.log10(body.mass / 1e20) * 2);
            return cameraMode === 3 ? base * scaleBoost : base;
        }

        const worldRadius = body.radius * 1000;
        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        const multiplier = body.name === 'Sun' ? multipliers.sunMultiplier : multipliers.planetMultiplier;
        const screenRadius = (worldRadius / this.coordSystem.metersPerPixel) * multiplier;

        let minForMode = minSize;
        if (cameraMode === 3) {
            minForMode = Math.max(8, minSize);
        } else if (cameraMode === 2) {
            minForMode = Math.max(4, minSize);
        } else {
            minForMode = Math.max(3, minSize);
        }

        return Math.max(minForMode, screenRadius);
    }

    drawPlanetLabel(text, x, y, radius, cameraMode) {
        let fontSize = 12;
        if (cameraMode === 3) {
            fontSize = Math.min(16, Math.max(10, radius * 0.6));
        } else if (cameraMode === 2) {
            fontSize = Math.min(14, Math.max(8, radius * 0.8));
        }

        this.ctx.fillStyle = 'white';
        this.ctx.font = fontSize + 'px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }

    //MARK: TRAIL RENDERING

    drawTrail(body) {
        if (!body.trail || body.trail.length < 2) {
            return;
        }


        const points = [];
        for (let i = 0; i < body.trail.length; i++) {
            const p = body.trail[i];
            points.push(this.coordSystem.worldToScreen(p.x, p.y));
        }

        const color = body.isBarycenter ? '#0000FF' : body.color;
        const trailColor = ColorUtils.colorToRgba(color, 0.4);

        this.ctx.strokeStyle = trailColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.stroke();
    }

    //MARK: GRID RENDERING

    drawGrid() {
        const gridSpacing = 100;
        const gridColor = 'rgba(255, 255, 255, 0.1)';

        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const circles = [100, 200, 300, 400];

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < circles.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, circles[i], 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }

    
    // //MARK: UI RENDERING

    drawUI(cameraMode, timeMultiplier, simulationTime, targetPlanet, useRealScale, planetScaleBoost) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';

        let y = 20;
        const x = 10;

        const modeNames = {1: 'Solar System', 2: 'Inner Planets', 3: 'Planet Focus'};
        const modeText = modeNames[cameraMode] || 'Unknown';
        
        this.ctx.fillText('Mode: ' + modeText, x, y);
        y += 15;

        this.ctx.fillText('Scale: ' + this.coordSystem.getScaleDescription(), x, y);
        y += 15;

        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        this.ctx.fillText('Planet Scaling: Sun ' + multipliers.sunMultiplier + 'x, Planets ' + multipliers.planetMultiplier + 'x', x, y);
        y += 15;

        if (cameraMode === 3) {
            y += 5;
            this.ctx.fillText('Planet Scale Boost: ' + planetScaleBoost + 'x', x, y);
            y += 15;

            if (targetPlanet) {
                this.ctx.fillText('Following: ' + targetPlanet, x, y);
                y += 15;
            }
        }

        y += 5;
        if (useRealScale) {
            this.ctx.fillText('True Physical Scale Base', x, y);
            y += 15;
        }

        y += 5;
        this.ctx.fillText('Speed: ' + timeMultiplier.toFixed(0) + 'x', x, y);
        y += 15;

        const simDays = simulationTime / 86400;
        let timeText;
        if (simDays > 365) {
            timeText = (simDays / 365.25).toFixed(2) + ' years';
        } else {
            timeText = simDays.toFixed(1) + ' days';
        }
        this.ctx.fillText('Elapsed: ' + timeText, x, y);
        y += 15;

        if (this.coordSystem.cameraCenter) {
            const center = this.coordSystem.cameraCenter;
            this.ctx.fillText('Camera: (' + (center.x/1e9).toFixed(2) + ', ' + (center.y/1e9).toFixed(2) + ') Gm', x, y);
            y += 15;
        }

        this.drawControlHints();
    }

    drawControlHints() {
        // Bottom-right corner deprececated
    }

    // MARK: Utility to format distances

    formatDistance(distance) {
        if (distance > 1e11) {
            return (distance / 1.496e11).toFixed(2) + ' AU';
        } else if (distance > 1e9) {
            return (distance / 1e9).toFixed(1) + ' Gm';
        } else if (distance > 1e6) {
            return (distance / 1e6).toFixed(1) + ' Mm';
        } else {
            return (distance / 1e3).toFixed(0) + ' km';
        }
    }
}

export default Renderer;