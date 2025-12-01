import {Component, Property} from '@wonderlandengine/api';

export class TextS1 extends Component {
    static TypeName = 'Text_S1';
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
            "Page 1 - What Is Gravity?\n\nGravity is a pulling force that\nthings with a lot of mass, like\nplanets, have. It's what pulls\nobjects toward each other, even\nyou. This is super cool because it\nmeans the Earth is giving you a\ngiant, invisible hug to keep you\nclose!",
            "Page 2 — Why Don't We Float Away?\n\nThe Earth's strong gravity\nconstantly pulls you down toward its\ncenter, which is why you always land\non the ground after you jump.\nGravity also keeps the oceans, air,\nand all people and buildings from\nfloating away into space. Isn't it\namazing that this invisible force\nholds our whole world together so\nperfectly?",
            "Page 3 — Gravity in Space\n\nGravity is everywhere in space,\nacting as an invisible force that\nkeeps planets near the Sun. Without\nthe Sun's powerful gravity, the\nplanets would fly off in a straight\nline forever instead of staying in\ntheir paths. The Sun is like a\nsuper-giant magnet, and it has such\na strong pull that it makes all the\nplanets dance around it!",
            "Page 4 — Gravity as an Invisible String\n\nYou can imagine that the Sun holds\nonto each planet with an invisible\nstring. This invisible \"pull\" keeps\nthe planets close to the Sun, but it\nalso lets them keep moving forward.\nThis exciting, powerful pull is what\nmakes sure our whole solar system\nstays spinning and organized!"
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

