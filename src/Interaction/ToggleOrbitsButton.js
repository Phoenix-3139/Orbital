import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../Core/Display/Conductor.js';

export class ToggleOrbitsButton extends Component {
    static TypeName = 'toggle-orbits-button';
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
        this.drawerComponent.showOrbits = !this.drawerComponent.showOrbits;
    }
}

export default ToggleOrbitsButton;