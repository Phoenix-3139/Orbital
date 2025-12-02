import {Component, Property} from '@wonderlandengine/api';

export class TextS5 extends Component {
    static TypeName = 'Text_S5';
    static Properties = {
        material: Property.material(),
        canvasWidth: Property.int(512),
        canvasHeight: Property.int(512),
        backgroundColor: Property.string('#000000'),
        textColor: Property.string('#FFFFFF'),

        
        displayText: Property.string(''),

        
        totalPages: Property.int(3)
    };

    start() {
       
        this.pages = [
            "Page 1 - The Earth-Moon Barycenter\n\nThe Earth doesn't orbit the Sun from\na fixed point in its center. Instead,\nthe Earth and Moon orbit around their\ncommon center of mass - a point called\nthe barycenter. This point lies about\n4,700 km from Earth's center, roughly\n1,700 km beneath the surface. Both\nbodies revolve around this point!",
            "Page 2 — Understanding the Wobble\n\nAs the Earth-Moon system travels\naround the Sun, both objects orbit\ntheir shared barycenter. Because this\npoint is inside Earth but offset from\nits center, Earth follows a slightly\nwavy path through space. The Moon's\ngravitational pull creates this\nconstant wobble in Earth's orbit.",
            "Page 3 — Why This Happens\n\nGravity works both ways - the Moon\npulls on Earth, and Earth pulls on\nthe Moon with equal force. Since the\nMoon has significant mass (about 1/81\nof Earth's), it's strong enough to\nshift Earth's orbital motion. Both\nobjects dance around their mutual\nbalance point as they orbit the Sun.",
            "Page 4 — The Orbital Dance\n\nSo Earth's path around the Sun isn't\na smooth ellipse - it's actually a\nwavy, wobbling trajectory! Picture a\nsmooth curve with small ripples in it.\nThat's Earth's true path through the\nsolar system. Right now, as you stand\nhere, you're riding along on this\ncomplex orbital journey through space!"
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

