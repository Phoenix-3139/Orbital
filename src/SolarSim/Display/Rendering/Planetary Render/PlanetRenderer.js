import { PlanetSphereRenderer } from './PlanetSphereRenderer.js';
import { PlanetLabelRenderer } from './PlanetLabelRenderer.js';

/**
 * Planet Renderer (Coordinator)
 * Coordinates different rendering modes and delegates to specialized renderers
 * Modes: 1 (Solar System), 2 (Inner Planets), 3 (Planet Focus)
 */
export class PlanetRenderer {
    constructor(canvasManager, coordSystem) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
        
        // Initialize specialized renderers
        this.sphereRenderer = new PlanetSphereRenderer(canvasManager, coordSystem);
        this.labelRenderer = new PlanetLabelRenderer(canvasManager);
    }

    /**
     * Main rendering method - delegates to appropriate renderer
     * Modes 1, 2, 3: Normal sphere rendering
     */
    drawBodyWithAtmosphere(body, useRealScale, minPlanetPixels, cameraMode, planetScaleBoost) {
        // Get screen position
        const screenPos = this.coordSystem.worldToScreen(body.position.x, body.position.y);
        
        // Calculate planet radius
        const planetRadius = this.sphereRenderer.calculateDisplayRadius(
            body, useRealScale, minPlanetPixels, cameraMode, planetScaleBoost
        );

        // Draw planet sphere
        this.sphereRenderer.drawPlanetSphere(body, screenPos, planetRadius, cameraMode);

        // Draw labels
        if (this.labelRenderer.shouldDrawLabels(planetRadius, cameraMode)) {
            this.labelRenderer.drawPlanetLabels(
                body, screenPos, planetRadius, null, useRealScale, cameraMode
            );
        }
    }
}

export default PlanetRenderer;