/**
 * Grid Renderer
 * Extracted from Display.js - handles reference grid, orbital trails, and distance formatting
 */
export class GridRenderer {
    constructor(canvasManager, coordSystem) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
    }

    /**
     * Draw reference grid
     */
    drawReferenceGrid() {
        this._drawSpaceGrid();
    }

    _drawSpaceGrid() {
        // Original space grid code
        const ctx = this.canvasManager.ctx;
        const canvasWidth = this.canvasManager.canvas.width;
        const canvasHeight = this.canvasManager.canvas.height;
        
        // Grid settings
        const gridSpacing = 100; // pixels
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= canvasWidth; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= canvasHeight; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }

        // Draw reference circles centered on canvas
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const circles = [100, 200, 300, 400];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        circles.forEach(radius => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        });
    }

    /**
     * Draw orbital trail
     */
    drawTrail(body, showOrbits) {
        if (!showOrbits || !body.trail || body.trail.length < 2) {
            return;
        }

        const ctx = this.canvasManager.ctx;
        const trail = body.trail;

        // Convert trail points to screen coordinates
        const screenPoints = [];
        for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const screenPos = this.coordSystem.worldToScreen(point.x, point.y);
            
            // Only add points that are within reasonable bounds
            if (screenPos.x > -1000 && screenPos.x < 2000 && 
                screenPos.y > -1000 && screenPos.y < 2000) {
                screenPoints.push(screenPos);
            }
        }

        if (screenPoints.length < 2) 
            {return;}

        // Draw the trail
        const trailColor = this._colorToRgba(body.color, 0.4);
        
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        
        ctx.stroke();
    }

    /**
     * Format distance for display (from original _formatDistance)
     */
    formatDistance(distance) {
        if (distance > 1e11) {
            // Astronomical Units (1 AU = 1.496e11 meters)
            return `${(distance / 1.496e11).toFixed(2)} AU`;
        } else if (distance > 1e9) {
            // Gigameters
            return `${(distance / 1e9).toFixed(1)} Gm`;
        } else if (distance > 1e6) {
            // Megameters
            return `${(distance / 1e6).toFixed(1)} Mm`;
        } else {
            // Kilometers
            return `${(distance / 1e3).toFixed(0)} km`;
        }
    }

    /**
     * Convert color to RGBA (from original _colorToRgba)
     */
    _colorToRgba(color, alpha) {
        if (color.startsWith('#') && color.length === 7) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }
}

export default GridRenderer;