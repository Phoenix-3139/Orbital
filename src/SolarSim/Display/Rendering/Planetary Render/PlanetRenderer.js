import { PlanetSphereRenderer } from './PlanetSphereRenderer.js';
import { PlanetLabelRenderer } from './PlanetLabelRenderer.js';

/**
 * Planet Renderer (Coordinator)
 * Coordinates different rendering modes and delegates to specialized renderers
 * Modes: 1 (Solar System), 2 (Inner Planets), 3 (Planet Focus)
 */
export class PlanetRenderer {
    constructor(canvasManager, coordSystem, atmosphereRenderer) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
        this.atmosphereRenderer = atmosphereRenderer;
        
        // Initialize specialized renderers
        this.sphereRenderer = new PlanetSphereRenderer(canvasManager, coordSystem);
        this.labelRenderer = new PlanetLabelRenderer(canvasManager);
    }

    /**
     * Main rendering method - delegates to appropriate renderer
     * Modes 1, 2, 3: Normal sphere rendering
     */
    drawBodyWithAtmosphere(body, showAtmospheres, atmosphereOpacity, useRealScale, 
                          minPlanetPixels, cameraMode, planetScaleBoost,
                          showAtmosphericLayers = true, layerDetail = 5) {
        
        // Get screen position
        const screenPos = this.coordSystem.worldToScreen(body.position.x, body.position.y);
        
        // Calculate planet radius
        const planetRadius = this.sphereRenderer.calculateDisplayRadius(
            body, useRealScale, minPlanetPixels, cameraMode, planetScaleBoost
        );

        // Draw planet sphere
        this.sphereRenderer.drawPlanetSphere(body, screenPos, planetRadius, cameraMode);

        // Draw atmosphere halo
        const atmosphericRadius = this.atmosphereRenderer.drawAtmosphere(
            body, screenPos, planetRadius, showAtmospheres, atmosphereOpacity,
            cameraMode, useRealScale, showAtmosphericLayers, layerDetail
        );

        // Draw labels
        if (this.labelRenderer.shouldDrawLabels(planetRadius, cameraMode)) {
            this.labelRenderer.drawPlanetLabels(
                body, screenPos, planetRadius, atmosphericRadius, useRealScale, cameraMode
            );
        }
    }

    _planetHasAtmosphere(planetName) {
        const atmosphericPlanets = ['Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Titan'];
        return atmosphericPlanets.includes(planetName);
    }
}

export default PlanetRenderer;