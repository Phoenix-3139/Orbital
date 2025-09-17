import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../SolarSim/Display/Conductor.js';

/**
 * Button3
 * When clicked, cycles through planets ONLY if camera mode is 3 (Planet Focus).
 */
export class Button3 extends Component {
    static TypeName = 'Button3';

    static Properties = {
        drawerObject: Property.object(), // Reference to Drawer component
        planetList: Property.string('Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune'), // Comma-separated planet names
    };

    start() {
        this.target = this.object.getComponent(CursorTarget) ||
                      this.object.addComponent(CursorTarget);

        this.drawerComponent = this.drawerObject?.getComponent(Drawer);

        // Prepare planet list and index
        this.planets = this.planetList.split(',').map(p => p.trim());
        this.currentIndex = 0;

        this.target.onDown.add(this.onDown);
        this.target.onUp.add(this.onUp);
    }

    onDown = () => {
        if (this.drawerComponent && this.planets.length > 0) {
            // Only cycle if currently in camera mode 3
            if (this.drawerComponent.cameraMode === 3) {
                this.currentIndex = (this.currentIndex + 1) % this.planets.length;
                const nextPlanet = this.planets[this.currentIndex];
                this.drawerComponent.setTargetPlanet(nextPlanet);
                console.log(`Button3 pressed: Focusing on planet: ${nextPlanet}`);
            } else {
                console.log('Button3 pressed: Not in camera mode 3, no action taken.');
            }
        }
    };

    onUp = () => {
        // Optional: Add feedback or UI logic here
        console.log('Button3 released');
    };
}