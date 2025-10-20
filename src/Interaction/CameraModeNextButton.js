import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../Core/Display/Conductor.js';

export class CameraModeNextButton extends Component {
    static TypeName = 'camera-mode-next-button';
    static Properties = {
        drawerObject: Property.object()
    };

    start() {
        this.target = this.object.getComponent(CursorTarget) || this.object.addComponent(CursorTarget);
        this.drawerComponent = this.drawerObject ? this.drawerObject.getComponent(Drawer) : null;

        this.onDown = this.onDown.bind(this);
        this.target.onDown.add(this.onDown);
    }

    onDown() {
        if (!this.drawerComponent) { return; }
        const cur = Number(this.drawerComponent.cameraMode) || 1;
        this.drawerComponent.cameraMode = (cur % 3) + 1;
    }
}

export default CameraModeNextButton;