import { Component, Property } from '@wonderlandengine/api';
import { Drawer } from '../../Core/Display/Conductor.js';
import { Body } from '../../Core/Data/body.js';

export class DistanceGraph extends Component {
    static TypeName = 'distance-graph'; // component type name used by Wonderland Engine

    static Properties = {
        material: Property.material(),           // material to paint the graph texture onto
        canvasWidth: Property.int(512),         // canvas pixel width
        canvasHeight: Property.int(512),        // canvas pixel height
        backgroundColor: Property.string('#000000'), // clear color for the canvas
        graphColor: Property.string('#FFFFFF'), // color used for the graph line and labels
        drawerObject: Property.object(),        // reference to Drawer object that exposes simulationController
    };

    start() {
        // obtain Drawer component from the assigned object
        this.drawerComponent = this.drawerObject.getComponent(Drawer);
        // get SimulationController reference
        this.simulationController = this.drawerComponent.simulationController;

        this.setupCanvas();          // create canvas & brush
        this.distanceHistory = [];   // circular buffer of recent distance values
    }

    update(dt) {
        const PAD = 60; // left/right padding for axes and labels

        // get the current SimulationController
        const sc = this.simulationController;
        if (!sc) return; // nothing to plot without bodies
        const bodies = sc.bodies;

        // targetPlanet comes from Drawer; normalize casing for comparison
        const rawTarget = this.drawerComponent.targetPlanet;
        const targetNormalized = String(rawTarget).toLowerCase().trim();

        let sunPos = null;    // will hold {x,y} of Sun
        let planetPos = null; // will hold {x,y} of the selected planet

        // iterate bodies to find Sun and target planet positions
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (!body || !body.name) continue;

            // SimulationController provides position as { x: number, y: number }
            const pos = body.position;

            const nameLower = body.name.toLowerCase();
            if (nameLower === 'sun') {
                sunPos = pos; // found Sun
            }
            // accept exact match or partial (e.g. "earth" matches "Earth-Moon Barycenter")
            if (targetNormalized && (nameLower === targetNormalized || nameLower.includes(targetNormalized))) {
                planetPos = pos;
            }
        }

        if (!sunPos || !planetPos) return; // wait until both positions are available

        // compute Euclidean distance in simulation units (meters) and convert to AU
        const dx = sunPos.x - planetPos.x;
        const dy = sunPos.y - planetPos.y;
        const distanceMeters = Math.sqrt(dx * dx + dy * dy);
        const currentDistanceAU = distanceMeters / Body.AU;

        this.distanceHistory.push(currentDistanceAU); // append latest distance

        // keep history bounded by drawable width (account for padding)
        const maxPoints = Math.max(10, this.canvas.width - PAD * 2);
        while (this.distanceHistory.length > maxPoints) this.distanceHistory.shift();

        this.drawContent(PAD); // render axes and graph into canvas
        this.showDrawing();    // upload/update material texture
    }

    setupCanvas() {
        // create offscreen canvas used as a texture source
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

    // drawContent now accepts left/right padding to reserve space for axes/labels
    drawContent(pad = 30) {
        this.clearCanvas();
        if (!this.distanceHistory || this.distanceHistory.length < 2) {
            // show placeholder while not enough data
            this.drawText('Gathering data...', this.canvas.width / 2, this.canvas.height / 2, '20px Arial', this.graphColor);
            return;
        }

        const minVal = Math.min(...this.distanceHistory); // minimum distance in buffer
        const maxVal = Math.max(...this.distanceHistory); // maximum distance in buffer

        // Plot bounds
        const xMin = pad;                    // left edge of plotting area
        const xMax = this.canvas.width - pad; // right edge
        const TOP_PAD = 36;                  // top padding (bigger as requested)
        const yTop = TOP_PAD;                // top pixel for plotting area
        const yBottom = this.canvas.height - pad; // bottom pixel for plotting area

        // Draw axes
        const axisColor = '#888888';
        const axisThickness = 1;
        // vertical (y) axis from top to bottom
        this.drawLine(xMin, yTop, xMin, yBottom, axisColor, axisThickness);
        // horizontal (x) axis from left to right
        this.drawLine(xMin, yBottom, xMax, yBottom, axisColor, axisThickness);

        // Y axis labels: max at top, mid, and min at bottom
        const yMaxPos = this.scaleValue(maxVal, minVal, maxVal, yTop, yBottom);
        const yMinPos = this.scaleValue(minVal, minVal, maxVal, yTop, yBottom);
        const yMidPos = this.scaleValue((minVal + maxVal) / 2, minVal, maxVal, yTop, yBottom);

        // drawText is centered horizontally; shift left for Y labels
        this.drawText(maxVal.toFixed(2), xMin - 18, yMaxPos, '12px Arial', this.graphColor);
        this.drawText(((minVal + maxVal) / 2).toFixed(2), xMin - 18, yMidPos, '12px Arial', this.graphColor);
        this.drawText(minVal.toFixed(2), xMin - 18, yMinPos, '12px Arial', this.graphColor);

        // X axis label centered below axis
        this.drawText('Time -->', (xMin + xMax) / 2, this.canvas.height - pad + 18, '12px Arial', this.graphColor);

        // Plot graph scaled into [xMin..xMax] and [yTop..yBottom]
        const n = this.distanceHistory.length;
        const plotWidth = xMax - xMin;
        for (let i = 0; i < n - 1; i++) {
            // normalized horizontal positions (0..1)
            const t1 = n === 1 ? 0 : (i / (n - 1));
            const t2 = n === 1 ? 0 : ((i + 1) / (n - 1));
            // map to pixel X within plot area
            const x1 = xMin + t1 * plotWidth;
            const x2 = xMin + t2 * plotWidth;
            // map values to pixel Y within plot area
            const y1 = this.scaleValue(this.distanceHistory[i], minVal, maxVal, yTop, yBottom);
            const y2 = this.scaleValue(this.distanceHistory[i + 1], minVal, maxVal, yTop, yBottom);
            this.drawLine(x1, y1, x2, y2, this.graphColor, 2); // draw segment
        }

        // show the latest distance at the top area
        const last = this.distanceHistory[this.distanceHistory.length - 1];
        const currentDistText = `Dist: ${last.toFixed(2)} AU`;
        this.drawText(currentDistText, this.canvas.width / 2, TOP_PAD - 8, '14px Arial', this.graphColor);
    }

    // scaleValue maps a data value in [min..max] to pixel Y in [yTop..yBottom]
    scaleValue(value, min, max, yTop = 10, yBottom = null) {
        if (!this.canvas) return 0;
        if (yBottom === null) yBottom = this.canvas.height - 20;
        if (max - min === 0) return (yTop + yBottom) / 2; // avoid divide-by-zero
        const pct = (value - min) / (max - min); // 0..1
        // invert vertical because canvas Y increases downward
        return yTop + (1 - pct) * (yBottom - yTop);
    }

    showDrawing() {
        if (!this.canvas || !this.material) return; // nothing to show if material missing
        if (!this.texture) {
            // create Wonderland Engine texture from canvas once
            if (!this.engine || !this.engine.textures || typeof this.engine.textures.create !== 'function') return;
            this.texture = this.engine.textures.create(this.canvas);
            this.material.flatTexture = this.texture;
        } else {
            // update existing texture each frame
            this.texture.update();
        }
    }

    onDestroy() {

        this.texture = null;
        this.canvas = null;
        this.brush = null;
    }

    drawLine(x1, y1, x2, y2, color, thickness = 1) {
        if (!this.brush) return;
        this.brush.beginPath();
        this.brush.moveTo(x1, y1);
        this.brush.lineTo(x2, y2);
        this.brush.strokeStyle = color;
        this.brush.lineWidth = thickness;
        this.brush.stroke();
    }

    drawText(text, x, y, font = '16px Arial', color = '#ffffff') {
        if (!this.brush) return;
        this.brush.font = font;
        this.brush.fillStyle = color;
        this.brush.textAlign = 'center';
        this.brush.fillText(text, x, y);
    }
}

