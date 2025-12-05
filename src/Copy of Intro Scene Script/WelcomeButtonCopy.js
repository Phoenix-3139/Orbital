//This file is a copy of what has been attached to the starting button in the intro scene.
//It has been modified to load the main scene when clicked.
//Code for this was taken from the default button and then modified according to the documentation and a YouTube tutorial.

import { Component, Property } from '@wonderlandengine/api';

/**
 * Simple haptic helper using the input native component (safe string lookup).
 */
export function hapticFeedback(object, strength, duration) {
    try {
        const input = object.getComponent('input');
        if (input && input.xrInputSource) {
            const gamepad = input.xrInputSource.gamepad;
            if (gamepad && gamepad.hapticActuators && gamepad.hapticActuators[0])
                gamepad.hapticActuators[0].pulse(strength, duration);
        }
    } catch (e) {
        // Best-effort, ignore failures.
    }
}

/**
 * Minimal button component:
 * - changes material on hover
 * - moves down on press, returns on release
 * - plays click/unclick via HTMLAudio to avoid engine component registration issues
 * - loads main scene via engine.loadMainScene when clicked
 */
export class ButtonComponent extends Component {
    static TypeName = 'button';
    static Properties = {
        buttonMeshObject: Property.object(),
        hoverMaterial: Property.material(),
        sceneBin: Property.string('OrbitalVR-V0.2.bin'), //Change this if you change project name and stuff
        clickSrc: Property.string('sfx/click.wav'),
        unclickSrc: Property.string('sfx/unclick.wav'),
        pressOffset: Property.float(0.1), 
    };

    // Do not re-register native/shared components here.
    static onRegister(/* engine */) {}

    start() {
        // store return position
        this.returnPos = new Float32Array(3);
        if (this.buttonMeshObject) this.buttonMeshObject.getTranslationLocal(this.returnPos);

        // mesh and default material
        this.mesh = this.buttonMeshObject ? this.buttonMeshObject.getComponent('mesh') : null;
        this.defaultMaterial = this.mesh ? this.mesh.material : null;

        // ensure a cursor-target is present (use string names to avoid double-registration)
        this.target = this.object.getComponent('cursor-target') || this.object.addComponent('cursor-target');

        // HTMLAudio fallback to avoid engine audio-component registration mismatch
        try {
            this.clickAudio = new Audio(this.clickSrc);
            this.unclickAudio = new Audio(this.unclickSrc);
        } catch (e) {
            this.clickAudio = null;
            this.unclickAudio = null;
        }

        this._loading = false;
    }

    onActivate() {
        if (!this.target) return;
        this.target.onHover.add(this.onHover);
        this.target.onUnhover.add(this.onUnhover);
        this.target.onDown.add(this.onDown);
        this.target.onUp.add(this.onUp);
        this.target.onClick.add(this.onClick);
    }

    onDeactivate() {
        if (!this.target) return;
        this.target.onHover.remove(this.onHover);
        this.target.onUnhover.remove(this.onUnhover);
        this.target.onDown.remove(this.onDown);
        this.target.onUp.remove(this.onUp);
        this.target.onClick.remove(this.onClick);
    }

    onHover = (_, cursor) => {
        if (this.mesh && this.hoverMaterial) this.mesh.material = this.hoverMaterial;
        hapticFeedback(cursor.object, 0.4, 30);
    };

    onUnhover = (_, cursor) => {
        if (this.mesh && this.defaultMaterial) this.mesh.material = this.defaultMaterial;
        // finger cursors may need to call onUp
        if (cursor && cursor.type === 'finger-cursor') this.onUp(_, cursor);
        hapticFeedback(cursor.object, 0.2, 30);
    };

    onDown = (_, cursor) => {
        if (this.clickAudio) {
            try { this.clickAudio.currentTime = 0; this.clickAudio.play(); } catch (e) {}
        }
        if (this.buttonMeshObject) this.buttonMeshObject.translate([0.0, -this.pressOffset, 0.0]);
        hapticFeedback(cursor.object, 1.0, 20);
    };

    onUp = (_, cursor) => {
        if (this.unclickAudio) {
            try { this.unclickAudio.currentTime = 0; this.unclickAudio.play(); } catch (e) {}
        }
        if (this.buttonMeshObject && this.returnPos) this.buttonMeshObject.setTranslationLocal(this.returnPos);
        hapticFeedback(cursor.object, 0.6, 20);
    };

    onClick = async () => {
        if (this._loading) return;
        this._loading = true;

        try {
            if (this.engine && this.sceneBin) {
                // Use new API that resets engine state safely
                await this.engine.loadMainScene(this.sceneBin);
            }
        } catch (e) {
            console.error('Scene load failed:', e);
            this._loading = false;
        }
    };
}
