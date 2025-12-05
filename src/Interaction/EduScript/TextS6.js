import {Component, Property} from '@wonderlandengine/api';

export class TextS6 extends Component {
    static TypeName = 'Text_S6';
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
            "Page 1 - Welcome to Mission Control!\n\nYou've entered the Orbital Command\nStation! Look at the main screen -\nyou can see our entire solar system\nin motion. The side control panel\nbelow lets you interact with this\nlive simulation. Let's learn how to\nuse these powerful tools!",
            "Page 2 - The Map Mode Button\n\nThe first green button cycles through\ndifferent camera views. Try it!\nMode 1 shows the whole solar system.\nMode 2 follows a specific planet.\nMode 3 gives you a close-up view.\nEach mode helps you see different\naspects of planetary motion!",
            "Page 3 - Pause and Play\n\nThe second button controls time\nitself! Click it to pause the\nsimulation and study the planets'\npositions. Click again to resume.\nThis is incredibly useful when you\nwant to examine a specific moment in\nthe planets' dance around the Sun!",
            "Page 4 - Planet Cycling\n\nThe third button lets you choose\nwhich planet to follow! Each click\nswitches to the next planet in our\nsolar system. Use this with Mode 2\nor 3 to track Mercury's speedy orbit\nor Neptune's slow, distant journey\naround the Sun!",
            "Page 5 - Orbit Trail Toggle\n\nThe fourth button shows or hides the\norbital paths. When active, you'll\nsee colored trails behind each planet\nshowing where they've traveled. This\nreveals the beautiful elliptical\nshapes of planetary orbits that\nJohannes Kepler discovered!",  
            "Page 6 - Your Mission Begins\n\nYou now have full control of this\nsimulation! Try different camera\nmodes, pause to study positions,\nfollow various planets, and toggle\nthe trails. Experiment freely!"
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

