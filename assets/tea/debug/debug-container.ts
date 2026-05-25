import { _decorator, Component, Node } from 'cc';
import { DebugItemBase } from './debug-item-base';
const { ccclass, property } = _decorator;

@ccclass('DebugContainer')
export class DebugContainer extends Component {


    public debugItemParent() { 
        return this.node
    }

    public addDebugItem(item: DebugItemBase) { 
        item.node.parent = this.debugItemParent()
    }

    public tapDebugCase(caseItem: DebugItemBase) { }
    
    public updateView(action?: string, caseItem?: DebugItemBase) { }


}

