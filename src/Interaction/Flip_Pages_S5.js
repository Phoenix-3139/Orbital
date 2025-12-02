import {Component, Property} from '@wonderlandengine/api';

/*
FlipPages
 */
export class FlipPages extends Component {
    static TypeName = 'Flip_Pages_S5';
    /* Properties that are configurable in the editor */
    static Properties = {
            drawerObject: Property.object()
        };
    
        start() {
            this.target = this.object.getComponent("cursor-target") || this.object.addComponent(CursorTarget);
            this.drawerComponent = this.drawerObject ? this.drawerObject.getComponent("Text_S5") : null;
    
            this.onDown = this.onDown.bind(this);
            this.target.onDown.add(this.onDown);
        }
    
        onDown() {
            if (!this.drawerComponent) { console.log("FlipPages parent object not attached"); return; }
            this.drawerComponent.nextPage();
        }
    }

