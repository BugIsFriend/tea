import { _decorator, Component, EditBox, find, Label, Layout, Node, UITransform } from 'cc';
import { DebugContainer } from './debug-container';
import { seek } from '../meta/method';
import { storage } from '../storage';
import { DebugItemBase } from './debug-item-base';
const { ccclass, property } = _decorator;

function formatDisplayData(data: unknown) {
    if (typeof data === 'string') {
        return data
    }

    const json = JSON.stringify(data, null, 2)
    return json ?? String(data)
}

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
        this.TxtKey.string = `Key: ${caseItem.caseData.name}`
        this.DataViewEditBox.string = formatDisplayData(caseItem.caseData.data)
    }

    public updateView(action?: 'delete' | 'save'| string, caseItem?: DebugItemBase) {  
        
        if (action == 'tap') { 
            this.debugItemParent().children.forEach((child) => {
                let item = child.getComponent(DebugItemBase)
                item?.handleTap(item === caseItem)
            })  
            return 
        }

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
                storage.set(caseItem.caseData.name, { value: data, expire:data.expire })
            } catch (error) {
                console.error('Invalid JSON string')
                return
            }
        }
        
     }

}

