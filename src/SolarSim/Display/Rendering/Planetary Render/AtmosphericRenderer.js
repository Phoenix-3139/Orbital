import { UniversalCoordinateSystem } from "../../CoordinateSystem";
import { Body } from "../../../Data/body.js";
import { ColorUtils } from "../ColorUtils.js";

export class AtmosphericRenderer {

    constructor(canvasManager, coordSystem) {
        this.canvasManager = canvasManager;
        this.coordSystem = coordSystem;
    }

    drawAtmosphere(screenPos, planetRadius, planetName)
    {
        const ctx = this.canvasManager.ctx;
        
        // Get planet data using the correct key format
        const planetKey = planetName.toLowerCase();
        const planetData = Body.planetData[planetKey];
        
        if (!planetData || !planetData.atmosphere || !planetData.atmosphere.layers) {
            console.warn(`No atmosphere data found for ${planetName}`);
            return;
        }
        
        const atmosphere = planetData.atmosphere.layers;
        const planetColor = planetData.color;
        
        console.log(`Drawing atmosphere for ${planetName} with ${atmosphere.length} layers`);

        // Save context state
        ctx.save();
        
        // Draw atmosphere layers from outermost to innermost
        for (let j = atmosphere.length - 1; j >= 0; j--) {
            const layer = atmosphere[j];
            const height = layer.height;
            const density = layer.density;

            // Convert height from meters to screen pixels
            const atmosphereRadius = planetRadius + (height / this.coordSystem.metersPerPixel);

            // Log radius and other details for debugging
            console.log(`Layer ${j}: Height = ${height}, Density = ${density}, Atmosphere Radius = ${atmosphereRadius}`);

            // Calculate alpha based on density
            // const alpha = Body.densityToAlpha(density); // Temporarily disabling alpha
            const alpha = 1; // Set alpha to 1 for debugging

            // Create fill style with alpha
            let fillStyle;
            if (ColorUtils && ColorUtils.colorToRgba) {
                fillStyle = ColorUtils.colorToRgba(planetColor, alpha);
            } else {
                // Fallback color parsing
                const hex = planetColor.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16); 
                const b = parseInt(hex.substring(4, 6), 16);
                fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }

            // Draw the atmospheric layer
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, atmosphereRadius, 0, 2 * Math.PI);
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        
        // Restore context state
        ctx.restore();
    }
}