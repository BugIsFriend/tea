/*  
* @Author: myerse.lee  
* @Date: 2026-06-03 10:47:16   
* @Modified by:   myerse.lee   
* @Modified time: 2026-06-03 10:47:16   
* */

import { _decorator, Component, Node } from 'cc';
import { DebugItemBase } from './item-base';
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

