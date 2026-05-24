import { _decorator, Component, EditBox, find, Node } from 'cc';
import { DebugContainer } from './debug-container';
import { DebugItemBase } from './debug';
import { DebugItemStorage } from './debug-item-storage';
import { seek } from '../meta/method';
const { ccclass, property } = _decorator;

@ccclass('DebugContainerStorage')
export class DebugContainerStorage extends DebugContainer {

    @seek(EditBox, 'DataView/TxtView') DataViewEditBox: EditBox;
    // @seek(Node, 'ListView/view/content') content: EditBox;

    public debugItemParent() { 
        return  find('ListView/view/content', this.node)
    }

    public tapDebugCase(caseItem: DebugItemBase) {
        let _caseItem = caseItem as DebugItemStorage
        

        this.DataViewEditBox.string = typeof _caseItem.caseData.data == 'string' ? _caseItem.caseData.data : JSON.stringify(_caseItem.caseData.data)
        // _caseItem.caseData.data
        
        

    }

}

