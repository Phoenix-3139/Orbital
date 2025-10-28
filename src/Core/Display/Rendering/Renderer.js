/**
 * Unified Renderer - All rendering in one place
 * Handles planets, trails, labels, UI, and grid

 */
export class Renderer {
    constructor(canvasManager, coordSystem) {
        this.canvas = canvasManager.canvas;
        this.ctx = canvasManager.ctx;
        this.coordSystem = coordSystem;
        this.spriteCache = {};

        //Set image smoothing false for better quality
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
        }

        if (radius >= 2 && !(body.name === "Earth-Moon Barycenter")) {
            if (!(body.name === "Moon" && (cameraMode === 1||cameraMode === 2))) {
                this.drawPlanetLabel(body.name, screenPos.x, screenPos.y - radius - 8, radius, cameraMode);
            }
        }
    }

    drawPlanetSprite(body, screenPos, radius) 
    {
        const key = body.spritePath;
        
        if (this.spriteCache[key]) {
            this.ctx.drawImage(this.spriteCache[key], screenPos.x - radius, screenPos.y - radius, radius * 2, radius * 2);
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
        // Do not render trails for the Moon / satellites
        if (!body || body.name === 'Moon' || String(body.satellite) === 'true') return;

        if (!body.trail || body.trail.length < 2) {
            return;
        }

        const points = [];
        for (let i = 0; i < body.trail.length; i++) {
            const p = body.trail[i];
            points.push(this.coordSystem.worldToScreen(p.x, p.y));
        }

        const color = body.isBarycenter ? '#0000FF' : body.color;
        const trailColor = colorToRgba(color, 0.4);

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
        // Draw a dotted grid (no background image)
        const spacing = 100;
        const gridColor = 'rgba(255,255,255,0.08)';

        this.ctx.save();
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 6]); // dotted pattern

        // vertical lines
        for (let x = 0; x <= this.canvas.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.canvas.height);
            this.ctx.stroke();
        }

        // horizontal lines
        for (let y = 0; y <= this.canvas.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + 0.5);
            this.ctx.lineTo(this.canvas.width, y + 0.5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    
    // //MARK: UI RENDERING

    drawUI(cameraMode, timeMultiplier, simulationTime, targetPlanet, useRealScale, planetScaleBoost) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'left';

        const x = 10;
        let y = 20;

        // Short time display
        const days = Math.round(simulationTime / 86400);
        const years = days / 365.25;
        const timeText = years >= 1 ? `${years.toFixed(2)} years` : `${days} days`;
        this.ctx.fillText(`Speed: ${Math.round(timeMultiplier)}x`, x, y); y += 18;
        this.ctx.fillText(`Elapsed: ${timeText}`, x, y); y += 22;

        if (targetPlanet) {
            // Kid-friendly one-line facts
            const facts = {
                'Sun': {line: 'A huge, hot star that lights our solar system.', size: 'Huge'},
                'Mercury': {line: 'Tiny and speedy, very close to the Sun.', size: 'Tiny'},
                'Venus': {line: 'Cloudy and bright with a very hot surface.', size: 'Small'},
                'Earth': {line: 'Our home — the only planet known with life.', size: 'Medium'},
                'Moon': {line: 'Earth’s companion that lights the night.', size: 'Tiny'},
                'Mars': {line: 'The red planet with big volcanoes and valleys.', size: 'Small'},
                'Jupiter': {line: 'A giant gas planet with a huge storm.', size: 'Huge'},
                'Saturn': {line: 'Famous for its beautiful rings.', size: 'Huge'},
                'Uranus': {line: 'A tilted, icy world that looks blue-green.', size: 'Large'},
                'Neptune': {line: 'A windy, distant blue planet.', size: 'Large'}
            };
            const info = facts[targetPlanet] || {line: 'A mysterious world to discover!', size: 'Unknown'};

            // Title
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.fillText(targetPlanet, x, y); y += 18;

            // Fact and simple stats
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(info.line, x, y); y += 18;
            this.ctx.fillText(`Size: ${info.size}`, x, y); y += 18;
            // Simple hint
            this.ctx.fillStyle = 'rgba(255,255,255,0.85)';
        } else {
            // Short guidance for kids
            this.ctx.fillText('Pick a planet to see a fun fact!', x, y); y += 18;
            this.ctx.fillText('Modes: 1 Solar System • 2 Inner Planets • 3 Planet Focus', x, y); y += 18;
            this.ctx.fillText(`Current view: ${cameraMode}`, x, y);
        }
    }
}

function colorToRgba(color, alpha) {
    if (typeof color === 'string' && color.startsWith('#') && color.length === 7) {
        const r = parseInt(color.slice(1,3), 16);
        const g = parseInt(color.slice(3,5), 16);
        const b = parseInt(color.slice(5,7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}