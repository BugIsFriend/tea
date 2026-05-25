import { _decorator, Component, EditBox, find, Label, Layout, Node, UITransform } from 'cc';
import { DebugContainer } from './debug-container';
import { DebugItemBase } from './debug';
import { DebugItemStorage } from './debug-item-storage';
import { seek } from '../meta/method';
import { storage } from '../storage';
const { ccclass, property } = _decorator;

@ccclass('DebugContainerStorage')
export class DebugContainerStorage extends DebugContainer {

    @seek(Label, 'DataView/TxtKey') TxtKey: Label;
    @seek(EditBox, 'DataView/TxtView') DataViewEditBox: EditBox;

    public debugItemParent() {
        return find('ListView/view/content', this.node)
    }

    public addDebugItem(item: DebugItemBase) {
        super.addDebugItem(item)
        
        let num = this.debugItemParent().children.length+1
        let gap = this.debugItemParent().getComponent(Layout)?.spacingY ?? 0
        this.debugItemParent().getComponent(UITransform).height = (item.node.getComponent(UITransform).height +gap)* num
    }

    public tapDebugCase(caseItem: DebugItemBase) {
        let _caseItem = caseItem as DebugItemStorage
        

        this.TxtKey.string = `Key: ${_caseItem.caseData.name}`

        this.DataViewEditBox.string = JSON.stringify(_caseItem.caseData.data)
    }

    public updateView(action?: 'delete' | 'save'| string, caseItem?: DebugItemBase) {  
      
        if (action == 'delete') { 
             this.TxtKey.string = ''
            this.DataViewEditBox.string = ''
            storage.remove(caseItem.name)
            caseItem.node.parent = null
        }   

        if (action == 'save') { 
            try {
                let data = JSON.parse(this.DataViewEditBox.string)
                caseItem.caseData.data = data
                storage.set(caseItem.name, { value: this.DataViewEditBox.string, expire:data.expire })
            } catch (error) {
                console.error('Invalid JSON string')
                return
            }
        }
        
     }

}

