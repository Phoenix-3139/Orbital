import { Component, Property } from '@wonderlandengine/api';

/**
 * SIMPLE PLANE DRAWING TEMPLATE
 * 
 * This makes a drawing on a flat surface (like a TV screen or poster).
 * You can draw anything you want - just change the "drawContent" section below!
 */
export class PlaneDrawingTemplate extends Component {
    static TypeName = 'plane-drawing-template';
    
    static Properties = {
        material: Property.material(),        // The "paint" that goes on your object
        canvasWidth: Property.int(512),       // How wide your drawing is
        canvasHeight: Property.int(512),      // How tall your drawing is
        backgroundColor: Property.string('#000000'),  // Background color (black)
        animate: Property.bool(false),        // Make it move? true/false
        animationSpeed: Property.float(1.0)   // How fast it moves (1 = normal speed)
    };

    start() {
        console.log('Starting to draw...');
        
        // Make sure we have paint assigned
        if (!this.material) {
            console.error('ERROR: You need to assign a material!');
            return;
        }
        
        // Set up our drawing canvas (like getting a piece of paper ready)
        this.setupCanvas();
        
        // Draw our picture
        this.drawContent();
        
        // Show the drawing on the object
        this.showDrawing();
        
        // Keep track of time for animation
        this.time = 0;
        
        console.log('Drawing is ready!');
    }

    update(dt) {
        // Only redraw if animation is turned on
        if (this.animate) {
            this.time += dt * this.animationSpeed;  // Count up time
            this.drawContent();                     // Draw again
            this.showDrawing();                     // Update the display
        }
    }

    setupCanvas() {
        // Create our "piece of paper" to draw on
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Get our "paintbrush" (the thing that draws)
        this.brush = this.canvas.getContext('2d');
        
        // Fill the background
        this.clearCanvas();
    }

    clearCanvas() {
        // Paint the whole canvas with background color (like erasing)
        this.brush.fillStyle = this.backgroundColor;
        this.brush.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * ===== CHANGE THIS PART TO DRAW WHAT YOU WANT! =====
     */
    drawContent() {
        // Start fresh
        this.clearCanvas();
        
        // === YOUR DRAWING GOES HERE ===
        
        // Get the center of our canvas
        const centerX = this.canvas.width / 2;   // Middle left-right
        const centerY = this.canvas.height / 2;  // Middle up-down
        
        // EXAMPLE: Draw a bouncing ball
        
        // Figure out where the ball should be
        let ballHeight = 0;
        if (this.animate) {
            // Make it bounce up and down over time
            ballHeight = Math.abs(Math.sin(this.time * 2)) * 100; // Bounce between 0 and 100
        } else {
            ballHeight = 50; // Stay in the middle if not animated
        }
        
        const ballX = centerX;                    // Ball stays in center horizontally
        const ballY = centerY + 100 - ballHeight; // Ball moves up and down
        
        // Draw the ball (a circle)
        this.drawCircle(ballX, ballY, 20, '#ff0000'); // Red ball, size 20
        
        // Draw the ground (a line)
        this.drawLine(50, centerY + 100, this.canvas.width - 50, centerY + 100, '#ffffff', 3);
        
        // Draw some text
        this.drawText('Bouncing Ball!', centerX, 50, '24px Arial', '#ffffff');
        
        // Draw the height number
        if (this.animate) {
            this.drawText(`Height: ${Math.round(ballHeight)}`, centerX, centerY - 50, '16px Arial', '#ffff00');
        }
    }

    showDrawing() {
        // Put our drawing onto the 3D object
        if (!this.texture) {
            this.texture = this.engine.textures.create(this.canvas);
            this.material.flatTexture = this.texture;
        } else {
            this.texture.update();
        }
    }

    onDestroy() {
        // Clean up when done
        this.texture = null;
        this.canvas = null;
        this.brush = null;
    }

    // ===== EASY DRAWING TOOLS =====
    // Use these to draw shapes!

    drawCircle(x, y, size, color) {
        this.brush.beginPath();
        this.brush.arc(x, y, size, 0, 2 * Math.PI);
        this.brush.fillStyle = color;
        this.brush.fill();
    }

    drawRectangle(x, y, width, height, color) {
        this.brush.fillStyle = color;
        this.brush.fillRect(x, y, width, height);
    }

    drawLine(x1, y1, x2, y2, color, thickness = 1) {
        this.brush.beginPath();
        this.brush.moveTo(x1, y1);
        this.brush.lineTo(x2, y2);
        this.brush.strokeStyle = color;
        this.brush.lineWidth = thickness;
        this.brush.stroke();
    }

    drawText(text, x, y, font = '16px Arial', color = '#ffffff') {
        this.brush.font = font;
        this.brush.fillStyle = color;
        this.brush.textAlign = 'center';
        this.brush.fillText(text, x, y);
    }
}

/*
===== HOW TO USE THIS =====

1. In Wonderland Editor:
   - Make a plane (flat rectangle)
   - Add this component to it
   - Create a material and drag it to the "material" slot
   - Check "animate" if you want it to move

2. To change what it draws:
   - Find the "drawContent()" function above
   - Look for "=== YOUR DRAWING GOES HERE ==="
   - Replace that section with your own drawing code

3. Easy drawing examples:

   Draw a red circle:
   this.drawCircle(100, 100, 30, '#ff0000');
   
   Draw a blue rectangle:
   this.drawRectangle(50, 50, 100, 80, '#0000ff');
   
   Draw a white line:
   this.drawLine(0, 0, 200, 200, '#ffffff', 5);
   
   Write some text:
   this.drawText('Hello World!', 250, 250, '20px Arial', '#00ff00');

4. Colors:
   '#ff0000' = Red
   '#00ff00' = Green  
   '#0000ff' = Blue
   '#ffffff' = White
   '#000000' = Black
   '#ffff00' = Yellow
   '#ff00ff' = Purple

5. Animation:
   - Use "this.time" to make things move
   - Math.sin(this.time) makes things go back and forth smoothly
   - Math.cos(this.time) does the same but starts at a different point

Have fun drawing!
*/