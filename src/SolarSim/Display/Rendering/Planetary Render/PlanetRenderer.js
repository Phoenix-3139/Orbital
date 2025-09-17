import { PlanetSphereRenderer } from './PlanetSphereRenderer.js';
import { PlanetLabelRenderer } from './PlanetLabelRenderer.js';
import { AtmosphericRenderer } from './AtmosphericRenderer.js';

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
        this.atmosphericRenderer = new AtmosphericRenderer(canvasManager, coordSystem);
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

        // Draw atmosphere layers FIRST (behind the planet)
        if (cameraMode === 3 && body.name) {
            this.atmosphericRenderer.drawAtmosphere(screenPos, planetRadius, body.name);
        }

        // Draw planet sphere ON TOP of atmosphere 
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