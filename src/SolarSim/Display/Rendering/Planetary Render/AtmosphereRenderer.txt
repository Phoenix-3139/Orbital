import { ColorUtils } from '../ColorUtils.js';

/**
 * Atmosphere Renderer - Simple atmospheric effects
 * - Modes 1, 2, 3: Atmospheric halos around planets
 * - Mode 4: Not used (surface view handles its own atmosphere overlay)
 */
export class AtmosphereRenderer {
    constructor(canvasManager, coordSystem) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
    }

    /**
     * Draw atmospheric halo around planet (modes 1, 2, 3 ONLY)
     * *** CRITICAL: This is NOT called in mode 4 ***
     */
    drawAtmosphere(body, screenPos, planetRadius, showAtmospheres, atmosphereOpacity, cameraMode) {
        // *** FIXED: Don't draw atmospheric halos in surface mode (4) ***
        if (cameraMode === 4 || !showAtmospheres) {
            return planetRadius;
        }

        // Check if planet has atmosphere
        const atmosphericSummary = body.getAtmosphericSummary?.();
        if (!atmosphericSummary) {
            return planetRadius;
        }

        const ctx = this.canvasManager.ctx;
        if (!ctx) {
            console.error('Canvas context not available');
            return planetRadius;
        }

        // Calculate atmosphere radius
        const atmosphereRadius = this._calculateAtmosphereRadius(body, planetRadius, cameraMode);
        
        // Draw atmospheric halo
        this._drawAtmosphericHalo(ctx, body, screenPos, planetRadius, atmosphereRadius, atmosphereOpacity);
        
        return atmosphereRadius;
    }

    /**
     * Calculate atmosphere radius based on planet and camera mode
     */
    _calculateAtmosphereRadius(body, planetRadius, cameraMode) {
        const atmosphericSummary = body.getAtmosphericSummary();
        
        // Base atmosphere size multiplier
        let multiplier = 1.2;
        
        // Adjust based on atmospheric density
        if (atmosphericSummary.estimatedSurfacePressure > 100000) {
            multiplier = 1.4; // Thick atmosphere (Venus, etc.)
        } else if (atmosphericSummary.estimatedSurfacePressure > 50000) {
            multiplier = 1.3; // Medium atmosphere (Earth, etc.)
        } else if (atmosphericSummary.estimatedSurfacePressure > 1000) {
            multiplier = 1.2; // Thin atmosphere (Mars, etc.)
        } else {
            multiplier = 1.1; // Very thin atmosphere
        }
        
        // Adjust for camera mode
        if (cameraMode === 1) {
            multiplier *= 0.8; // Smaller in overview mode
        } else if (cameraMode === 3) {
            multiplier *= 1.2; // Larger in close-up mode
        }
        
        return planetRadius * multiplier;
    }

    /**
     * Draw the atmospheric halo effect
     */
    _drawAtmosphericHalo(ctx, body, screenPos, planetRadius, atmosphereRadius, opacity) {
        // Get atmosphere color
        const atmosphereColor = this._getAtmosphereColor(body);
        
        // Create radial gradient for atmospheric effect
        const gradient = ctx.createRadialGradient(
            screenPos.x, screenPos.y, planetRadius,      // Inner circle (planet surface)
            screenPos.x, screenPos.y, atmosphereRadius   // Outer circle (atmosphere edge)
        );
        
        // Gradient colors
        gradient.addColorStop(0, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, ${opacity})`);
        gradient.addColorStop(0.7, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${atmosphereColor.r}, ${atmosphereColor.g}, ${atmosphereColor.b}, 0)`);
        
        // Draw atmospheric halo
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, atmosphereRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Get atmosphere color based on planet composition
     */
    _getAtmosphereColor(body) {
        const planetName = body.name.toLowerCase();
        
        // Planet-specific atmosphere colors
        const atmosphereColors = {
            'earth': { r: 135, g: 206, b: 250 },    // Sky blue
            'mars': { r: 205, g: 133, b: 63 },      // Dusty orange
            'venus': { r: 255, g: 215, b: 0 },      // Sulfuric yellow
            'jupiter': { r: 218, g: 165, b: 32 },   // Golden
            'saturn': { r: 250, g: 213, b: 165 },   // Pale gold
            'uranus': { r: 79, g: 208, b: 231 },    // Cyan
            'neptune': { r: 75, g: 112, b: 221 },   // Deep blue
            'titan': { r: 255, g: 140, b: 0 }       // Orange (for Saturn's moon)
        };
        
        return atmosphereColors[planetName] || { r: 150, g: 150, b: 200 }; // Default bluish
    }

    /**
     * Get atmospheric summary for display
     */
    getAtmosphericInfo(body) {
        const atmosphericSummary = body.getAtmosphericSummary?.();
        if (!atmosphericSummary) {
            return null;
        }
        
        return {
            pressure: atmosphericSummary.estimatedSurfacePressure,
            composition: atmosphericSummary.composition || 'Unknown',
            hasAtmosphere: atmosphericSummary.estimatedSurfacePressure > 0
        };
    }

    /**
     * Check if body has significant atmosphere
     */
    hasSignificantAtmosphere(body) {
        const atmosphericSummary = body.getAtmosphericSummary?.();
        return atmosphericSummary && atmosphericSummary.estimatedSurfacePressure > 100; // 100 Pa minimum
    }
}

export default AtmosphereRenderer;