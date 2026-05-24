import { _decorator, Component, Node } from 'cc';
import { DebugItemBase } from './debug';
const { ccclass, property } = _decorator;

@ccclass('DebugContainer')
export class DebugContainer extends Component {


    public debugItemParent() { 
        return this.node
    }

    public tapDebugCase(caseItem:DebugItemBase) { }


}

