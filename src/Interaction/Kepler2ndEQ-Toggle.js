import {Component, Property} from '@wonderlandengine/api';

/**
 * Kepler2ndEQ-Toggle
 */
export class Kepler2ndEQToggle extends Component {
    static TypeName = 'Kepler2ndEQ-Toggle';
    /* Properties that are configurable in the editor */
    static Properties = {
               drawerObject: Property.object(),
         };

    start() {
         
        const drawer = this.drawerObject.getComponent("orbital-simulation");
        const cursor = this.object.getComponent("cursor-target");
        cursor.onDown.add(() => {
            drawer.drawKeplerEllipse = !drawer.drawKeplerEllipse;
        });
     
    }
}

