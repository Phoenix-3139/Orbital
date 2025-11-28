import { Component, Property } from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';
import { Drawer } from '../Core/Display/Conductor.js';

export class PlanetCycleButton extends Component {
    static TypeName = 'planet-cycle-button';
    static Properties = {
        drawerObject: Property.object(),
        planetList: Property.string('Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune')
    };

    start() {
        this.target = this.object.getComponent(CursorTarget) || this.object.addComponent(CursorTarget);
        this.drawerComponent = this.drawerObject ? this.drawerObject.getComponent(Drawer) : null;

        this.planets = (this.planetList || '').split(',').map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 0; });
        this.currentIndex = 0;
        this.currentIndexOneTwo = 0;

        this.onDown = this.onDown.bind(this);
        this.target.onDown.add(this.onDown);

        this.tpIndex = 3; // Start with 3 (EQ3)
    }

    onDown() {
        if (!this.drawerComponent) { return; }
        if (Number(this.drawerComponent.cameraMode) !== 3 && Number(this.drawerComponent.cameraMode) !== 2) { return; }
        if (!this.planets || this.planets.length === 0) { return; }
        
        this.currentIndex = (this.currentIndex + 1) % this.planets.length;
        this.drawerComponent.targetPlanet = this.planets[this.currentIndex];
        console.log("Target Planet set to: " + this.currentIndex + " - " + this.drawerComponent.targetPlanet);

        if (this.tpIndex == 3) 
        {
            this.tpIndex = 2;
        }
        else if (this.tpIndex == 2)
        {
            this.tpIndex = 3;
        }

        this.drawerComponent.targetPlanetIndex = this.tpIndex;

    }
}   