/*
Unified Renderer - All rendering in one place
Handles planets, trails, labels, UI, and grid
 */
export class Renderer {
    constructor(canvasManager, coordSystem) {
        this.canvas = canvasManager.canvas;
        this.ctx = canvasManager.ctx;
        this.coordSystem = coordSystem;
        this.spriteCache = {}; //Caching the planet sprites for efficiency

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
            console.log("Drawing barycenter for:", body.name);
            return;
        }

        const radius = this.calculateRadius(body, cameraMode, useRealScale, minSize, scaleBoost);

        if (body.spritePath && body.isBarycenter !== true) {
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
        if(body.spritePath && body.name !== "Earth-Moon Barycenter")
        {
        const key = body.spritePath; //path to the sprite
        
        if (this.spriteCache[key]) //if the sprite is cached
        {
            this.ctx.drawImage(this.spriteCache[key], screenPos.x - radius, screenPos.y - radius, radius * 2, radius * 2); // draws the sprite
            return;
        }

        const img = new Image(); //create a new image
        img.onload = () => { //when the image is loaded, draw it
            this.spriteCache[key] = img; //cache the image
        };
        img.src = key; // sets the source of the image
    }
    }

    drawBarycenterMarker(screenPos) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2); // small circle for barycenter
        this.ctx.fill();
        console.log("Drawing barycenter marker at:", screenPos);
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

    drawTrail(body, flag) 
    {
        if(flag)
        {
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

    drawUI(cameraMode, timeMultiplier, simulationTime, targetPlanet, size = 1.0) {
        // Define base sizes and scale them by the size parameter
        const baseFontSize = 13;
        const baseLineHeight = 18;
        const baseSectionSpacing = 22;
        const baseMargin = 10;

        const fontSize = baseFontSize * size;
        const lineHeight = baseLineHeight * size;
        const sectionSpacing = baseSectionSpacing * size;
        const margin = baseMargin * size;

        this.ctx.fillStyle = 'white';
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textAlign = 'left';

        const x = margin;
        let y = margin + (fontSize / 2); // Start y position adjusted for font size

        // Short time display
        const days = Math.round(simulationTime / 86400);
        const years = days / 365.25;
        const timeText = years >= 1 ? `${years.toFixed(2)} years` : `${days} days`;
        this.ctx.fillText(`Speed: ${Math.round(timeMultiplier)}x`, x, y); y += lineHeight;
        this.ctx.fillText(`Elapsed: ${timeText}`, x, y); y += sectionSpacing;

        if (targetPlanet && typeof targetPlanet === 'string') {
            // Kid-friendly one-line facts
            const facts = 
            {
                'sun': {line: 'A huge, hot star that lights our solar system.', size: 'Huge'},
                'earth-moon barycenter': {line: 'The center of mass between Earth and the Moon.', size: 'Imaginary Point'},
                'mercury': {line: 'Tiny and speedy, very close to the Sun.', size: 'Tiny'},
                'venus': {line: 'Cloudy and bright with a very hot surface.', size: 'Small'},
                'earth': {line: 'Our home — the only planet known with life.', size: 'Medium'},
                'moon': {line: 'Earth’s companion that lights the night.', size: 'Tiny'},
                'mars': {line: 'The red planet with big volcanoes and valleys.', size: 'Small'},
                'jupiter': {line: 'A giant gas planet with a huge storm.', size: 'Huge'},
                'saturn': {line: 'Famous for its beautiful rings.', size: 'Huge'},
                'uranus': {line: 'A tilted, icy world that looks blue-green.', size: 'Large'},
                'neptune': {line: 'A windy, distant blue planet.', size: 'Large'}
            };
            const info = facts[targetPlanet.toLowerCase()] || {line: 'A mysterious world to discover!', size: 'Unknown'};

            // Title
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.fillText(targetPlanet, x, y); y += lineHeight;

            // Fact and simple stats
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(info.line, x, y); y += lineHeight;
            this.ctx.fillText(`Size: ${info.size}`, x, y); y += lineHeight;
            // Simple hint
            this.ctx.fillStyle = 'rgba(255,255,255,0.85)';
        } else {
            // Short guidance for kids
            this.ctx.fillText('Pick a planet to see a fun fact!', x, y); y += lineHeight;
            this.ctx.fillText('Modes: 1 Solar System • 2 Inner Planets • 3 Planet Focus', x, y); y += lineHeight;
            this.ctx.fillText(`Current view: ${cameraMode}`, x, y);
        }
    }

    drawKeplerEllipse(planetData) {
        // Add a check to prevent crash if planetData or its orbit is missing
        if (!planetData || !planetData.orbit) {
            return; // Exit the function if data is not valid
        }

        const ctx = this.ctx;

        const a = planetData.orbit.semiMajorAxis;       // meters
        const e = planetData.orbit.eccentricity;
        const b = a * Math.sqrt(1 - e*e);

        const scale = 1e9;  // convert meters → pixels
        const rx = a/scale;
        const ry = b/scale;


        const cx = this.canvas.width/2;
        const cy = this.canvas.height/2;

        ctx.save();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;

        // draw ellipse
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
        ctx.stroke();

        // shaded 60° slice
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI/3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI + Math.PI/3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText("Equal areas in equal times", 20, 125);

        ctx.restore();

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