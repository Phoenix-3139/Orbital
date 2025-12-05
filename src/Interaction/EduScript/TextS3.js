import {Component, Property} from '@wonderlandengine/api';

export class TextS3 extends Component {
    static TypeName = 'Text_S3';
    static Properties = {
        material: Property.material(),
        canvasWidth: Property.int(512),
        canvasHeight: Property.int(512),
        backgroundColor: Property.string('#000000'),
        textColor: Property.string('#FFFFFF'),

        
        displayText: Property.string(''),

        totalPages: Property.int(6)
    };

    start() {
       
        this.pages = [
            "Page 1 - Kepler's Second Law\n\nJohannes Kepler discovered something\namazing about planetary motion! He\nfound that planets don't move at a\nconstant speed - they speed up and\nslow down as they orbit the Sun.\nLet's explore this fascinating\npattern called the Equal Areas Law!",
            "Page 2 - The Speed Dance\n\nWhen a planet is closer to the Sun,\nit moves faster through space. When\nit's farther away, it slows down.\nThis isn't random - it follows a\nperfect mathematical rule! Watch the\nplanets carefully and you'll see this\nspeed change happening right now.",
            "Page 3 - The Equal Areas Rule\n\nHere's Kepler's brilliant discovery:\nImagine drawing a line from the Sun\nto a planet. As the planet moves,\nthis line sweeps out an area like a\nslice of pie. Kepler found that equal\nareas are swept in equal times, no\nmatter where the planet is!",
            "Page 4 - Visualizing the Law\n\nThe fifth green button toggles a\nspecial visualization! When active,\nyou'll see shaded areas that show\nthis Equal Areas Law in action. Even\nthough the planet moves different\ndistances, the swept areas match\nperfectly over equal time periods!",
            "Page 5 - Why This Happens\n\nGravity causes this beautiful dance!\nWhen planets are closer to the Sun,\nthe Sun's gravity pulls harder,\nmaking them speed up. When they're\nfarther away, gravity is weaker, so\nthey slow down. This creates the\nperfect balance Kepler observed!",
            "Page 6 - Try It Yourself!\n\nUse the fifth button to toggle the\nvisualization on and off when the\n target planet is the Earth or Venus.\n Try pausing the simulation at different \nmoments to study the areas. Follow different\nplanets to see how they all obey\nthis same universal law. Pretty\namazing, right?"
        ];

        this.currentPage = 0; // starting page
        this.setupCanvas();

        // Listen for keyboard input for testing
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === 'ArrowLeft') this.prevPage();
        });
    }

    update(dt) {
        this.clearCanvas();

        // Draw current page
        this.drawParagraph(
            this.pages[this.currentPage],
            this.canvas.width / 2,
            this.canvas.height / 4,
            '24px Arial',
            this.textColor,
            30
        );

        this.showDrawing();
    }

    nextPage() {
        this.currentPage = (this.currentPage + 1) % this.pages.length;
    }

    prevPage() {
        this.currentPage =
            (this.currentPage - 1 + this.pages.length) % this.pages.length;
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.brush = this.canvas.getContext('2d');
        this.clearCanvas();
    }

    clearCanvas() {
        if (!this.brush) return;
        this.brush.fillStyle = this.backgroundColor;
        this.brush.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawParagraph(text, x, y, font = '24px Arial', color = '#ffffff', lineSpacing = 28) {
        if (!this.brush) return;
        this.brush.font = font;
        this.brush.fillStyle = color;
        this.brush.textAlign = 'center';

        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            this.brush.fillText(lines[i], x, y + i * lineSpacing);
        }
    }

    showDrawing() {
        if (!this.canvas || !this.material) return;

        if (!this.texture) {
            if (!this.engine || !this.engine.textures || typeof this.engine.textures.create !== 'function') return;
            this.texture = this.engine.textures.create(this.canvas);
            this.material.flatTexture = this.texture;
        } else {
            this.texture.update();
        }
    }

    onDestroy() {
        this.texture = null;
        this.canvas = null;
        this.brush = null;
    }
}

