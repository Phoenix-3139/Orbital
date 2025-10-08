import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../SolarSim/Display/Conductor.js';

/**
 * ButtonUP
 */
export class ButtonUP extends Component {
    static TypeName = 'Button5';
    
    /* Properties that are configurable in the editor */
    static Properties = {
        drawerObject: Property.object(), // Exposed for manual attachment
        targetCameraMode: Property.int(1), // 1=Solar, 2=Inner, 3=Planet
    };

    start() {
        this.target = this.object.getComponent(CursorTarget) || 
                      this.object.addComponent(CursorTarget);

        // Get Drawer component from the manually attached object
        this.drawerComponent = this.drawerObject?.getComponent(Drawer);

        // Set up event listeners
        this.target.onDown.add(this.onDown);
        this.target.onUp.add(this.onUp);
    }

    onDown = () => {
        if (this.drawerComponent) {
            // Cycle through modes 1 → 2 → 3 → 1
            this.targetCameraMode = (this.targetCameraMode % 3) + 1;
            this.drawerComponent.setCameraMode(this.targetCameraMode);
            console.log(`Button pressed: Camera mode set to ${this.targetCameraMode}`);
        }
    };
    
    onUp = () => {
        console.log('Button released');
    };
}