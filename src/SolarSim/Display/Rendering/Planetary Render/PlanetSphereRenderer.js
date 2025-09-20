import { ColorUtils } from '../ColorUtils.js';

/**
 * Planet Sphere Renderer
 * Handles normal spherical planet rendering for camera modes 1, 2, and 3
 */
export class PlanetSphereRenderer {
    constructor(canvasManager, coordSystem) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
    }

    /**
     * Draw planet as sphere
     */
    drawPlanetSphere(body, screenPos, planetRadius, cameraMode) {
        const ctx = this.canvasManager.ctx;
        
        // *** DEBUG: Log sphere drawing ***
        console.log(`Drawing sphere for ${body.name}: radius=${planetRadius.toFixed(1)}, pos=(${screenPos.x.toFixed(0)}, ${screenPos.y.toFixed(0)})`);
        
        // Draw the main celestial body
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, planetRadius, 0, 2 * Math.PI);
        ctx.fillStyle = body.color;
        ctx.fill();

        // Add outline for better definition
        if (planetRadius >= 2 || cameraMode === 3) { // *** FIXED: Lower threshold ***
            const outlineColor = ColorUtils.adjustColorBrightness(body.color, 0.3);
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, planetRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(0.5, planetRadius * 0.05); // *** FIXED: Thinner minimum line ***
            ctx.stroke();
        }
    }

    /**
     * Calculate display radius for body
     * *** FIXED: Ensure larger minimum sizes ***
     */
    calculateDisplayRadius(body, useRealScale, minPlanetPixels, cameraMode, planetScaleBoost) {
        if (!useRealScale) {
            let baseRadius = body.getDisplayRadius();
            
            if (cameraMode === 3) {
                baseRadius *= planetScaleBoost;
            }
            
            // *** FIXED: Higher minimum for non-real scale ***
            const minSize = Math.max(minPlanetPixels, 4);
            return Math.max(minSize, baseRadius);
        }

        let worldRadius;
        if (typeof body.getWorldRadius === 'function') {
            worldRadius = body.getWorldRadius();
        } else if (body.radius) {
            worldRadius = body.radius * 1000;
        } else {
            return Math.max(minPlanetPixels, 4) * planetScaleBoost;
        }

        let screenRadius = worldRadius / this.coordSystem.metersPerPixel;
        
        const multipliers = this.coordSystem.getPlanetSizeMultipliers();
        if (body.name === 'Sun') {
            screenRadius *= multipliers.sunMultiplier;
        } else {
            screenRadius *= multipliers.planetMultiplier;
        }

        // *** FIXED: Better minimum size calculation ***
        let minSize;
        if (cameraMode === 3) {
            minSize = Math.max(8.0, minPlanetPixels); // Large minimum for planet mode
        } else if (cameraMode === 2) {
            minSize = Math.max(4.0, minPlanetPixels); // Medium minimum for inner planets
        } else {
            minSize = Math.max(3.0, minPlanetPixels); // Small minimum for solar system
        }
        
        const finalRadius = Math.max(minSize, screenRadius);
        
        // *** DEBUG: Log radius calculation ***
        console.log(`Radius calc for ${body.name}: worldRadius=${(worldRadius/1000).toFixed(0)}km, screenRadius=${screenRadius.toFixed(1)}, minSize=${minSize}, final=${finalRadius.toFixed(1)}`);
        
        return finalRadius;
    }
}

export default PlanetSphereRenderer;