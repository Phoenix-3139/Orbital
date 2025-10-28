/**
 * Canvas and Texture Management
 * Extracted from Display.js - handles canvas creation and Wonderland Engine texture setup
 */
export class CanvasManager {
    constructor(engine, material, bgColor = '#0a0a0a') {
        this.engine = engine;
        this.material = material;
        this.bgColor = bgColor;
        
        this.canvas = null;
        this.ctx = null;
        this.tex = null;
    }

    /**
     * Initialize canvas and texture (from original start() method)
     */
    initialize() {
        // Create HTML5 Canvas for rendering the simulation
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize canvas with background color before creating texture
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create Wonderland Engine texture from canvas
        this.tex = this.engine.textures.create(this.canvas);
        
        // Apply texture to material if material is assigned
        if (this.material) {
            this.material.flatTexture = this.tex;
        } else {
            console.error('Material not assigned to orbital-simulation component');
            return false;
        }

        return true;
   }

    /**
     * Update texture (called at end of each frame)
     */
    updateTexture() {
        if (this.tex) {
            this.tex.update();
        }
    }

}

