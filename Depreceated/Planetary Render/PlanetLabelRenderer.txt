/**
 * Planet Label Renderer
 * Handles planet name labels and information display
 * Modes: 1 (Solar System), 2 (Inner Planets), 3 (Planet Focus)
 */
export class PlanetLabelRenderer {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }

    /**
     * Draw planet labels and information
     */
    drawPlanetLabels(body, screenPos, planetRadius, atmosphericRadius, useRealScale, cameraMode) {
        const ctx = this.canvasManager.ctx;
        const maxRadius = Math.max(planetRadius, atmosphericRadius);
        const labelY = screenPos.y - maxRadius - 8;
        const infoY = screenPos.y + maxRadius + 15;

        // Draw planet name
        this._drawPlanetName(ctx, body.name, screenPos.x, labelY, planetRadius, cameraMode);

        // Draw detailed info for larger planets in mode 3
        if (useRealScale && planetRadius > 8 && cameraMode === 3) {
            this._drawDetailedInfo(ctx, body, screenPos.x, infoY, atmosphericRadius, planetRadius);
        }
    }

    /**
     * Draw planet name with appropriate font size
     */
    _drawPlanetName(ctx, planetName, x, y, planetRadius, cameraMode) {
        let fontSize;
        if (cameraMode === 3) {
            fontSize = Math.min(16, Math.max(10, planetRadius * 0.6));
        } else if (cameraMode === 2) {
            fontSize = Math.min(14, Math.max(8, planetRadius * 0.8));
        } else {
            fontSize = Math.min(12, Math.max(8, planetRadius * 1.0));
        }

        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(planetName, x, y);
    }

    /**
     * Draw detailed planet information
     */
    _drawDetailedInfo(ctx, body, x, y, atmosphericRadius, planetRadius) {
        // Planet size
        let sizeText;
        if (body.radius > 10000) {
            sizeText = `${(body.radius / 1000).toFixed(0)}k km`;
        } else {
            sizeText = `${body.radius.toFixed(0)} km`;
        }
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sizeText, x, y);

        // Atmospheric information
        if (atmosphericRadius > planetRadius) {
            const atmosphericSummary = body.getAtmosphericSummary?.();
            if (atmosphericSummary) {
                this._drawAtmosphericInfo(ctx, atmosphericSummary, x, y + 12);
            }
        }
    }

    /**
     * Draw atmospheric information
     */
    _drawAtmosphericInfo(ctx, atmosphericSummary, x, startY) {
        let yOffset = 0;

        if (atmosphericSummary.estimatedSurfacePressure > 0) {
            let pressureText;
            const pressure = atmosphericSummary.estimatedSurfacePressure;
            if (pressure > 100000) {
                pressureText = `${(pressure / 100000).toFixed(1)} bar`;
            } else if (pressure > 1000) {
                pressureText = `${(pressure / 1000).toFixed(1)} kPa`;
            } else {
                pressureText = `${pressure.toFixed(0)} Pa`;
            }
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Pressure: ${pressureText}`, x, startY + yOffset);
            yOffset += 12;
        }

        if (atmosphericSummary.surfaceDensity > 0) {
            let densityText;
            const density = atmosphericSummary.surfaceDensity;
            if (density > 1) {
                densityText = `${density.toFixed(1)} kg/m³`;
            } else {
                densityText = `${(density * 1000).toFixed(0)} g/m³`;
            }
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Density: ${densityText}`, x, startY + yOffset);
        }
    }

    /**
     * Check if labels should be drawn based on size threshold
     */
    shouldDrawLabels(planetRadius, cameraMode) {
        // Lower minimum radius threshold
        let minRadiusForLabels;
        if (cameraMode === 3) {
            minRadiusForLabels = 3; // Very low threshold for planet mode
        } else if (cameraMode === 2) {
            minRadiusForLabels = 2; // Low threshold for inner planets
        } else {
            minRadiusForLabels = 2; // Low threshold for solar system view
        }
        
        return planetRadius >= minRadiusForLabels;
    }
}

export default PlanetLabelRenderer;