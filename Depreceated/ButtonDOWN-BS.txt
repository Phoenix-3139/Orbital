import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../SolarSim/Display/Conductor.js';

/**
 * ButtonDOWN
 */
export class ButtonDOWN extends Component {
    static TypeName = 'ButtonDOWN';

    /* Properties that are configurable in the editor */
    static Properties = {
        drawerObject: Property.object(), // Exposed for manual attachment
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
            // Toggle the paused state in the Drawer component
            this.drawerComponent.paused = !this.drawerComponent.paused;
            console.log(`Button pressed: Simulation paused = ${this.drawerComponent.paused}`);
        }
    };
    
    onUp = () => {
        console.log('Button released');
    };
}