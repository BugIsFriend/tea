import { _decorator, EditBox, find, Label, Layout, ScrollView, UITransform } from 'cc';
import { DebugContainer } from './debug-container';
import { seek } from '../meta/method';
import { storage } from '../storage';
import { DebugItemBase } from './debug-item-base';
const { ccclass, property } = _decorator;

function formatDisplayData(data: object) {
    if (typeof data === 'string') {
        return data
    }
    const json = JSON.stringify(data, (key, value) => key === 'expire' ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : value, 2)
    return json ?? String(data)
}

@ccclass('DebugContainerStorage')
export class DebugContainerStorage extends DebugContainer {

    @seek(Label, 'DataView/TxtKey') TxtKey: Label;
    @seek(EditBox, 'DataView/TxtView') DataViewEditBox: EditBox;

    public debugItemParent() {
        return find('ListView/view/content', this.node)
    }

    onSearchReturn(editBox: EditBox) { 
        this.debugItemParent().children.forEach((child,idx,arr) => {
            let item = child.getComponent(DebugItemBase)
            if (item?.caseData.name == editBox.string) {
                item?.handleTap(true)
                this.tapDebugCase(item)
                let listview = find('ListView', this.node).getComponent(ScrollView)
                listview.scrollToPercentVertical(1-idx/arr.length, 0.5, true)
            } else { 
                item?.handleTap(false)
            }
        }) 
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

    public updateView(action?: 'delete' | 'save'| 'tap' | string, caseItem?: DebugItemBase) {  
        
        let tar_key = caseItem?.caseData.name
        switch (action) {
            case 'delete':
                    this.TxtKey.string = ''
                    this.DataViewEditBox.string = ''
                    storage.remove(tar_key)
                    caseItem.node.parent = null
                break
            case 'save':
                    try {
                        let data = JSON.parse(this.DataViewEditBox.string,(key, value) => key === 'expire' ? dayjs(value).valueOf() : value)
                        caseItem.caseData.data = data
                        storage.set(tar_key, { value: data.value, expire:data.expire })
                    } catch (error) {
                        console.error('Invalid JSON string')
                        return
                    }
                break
            case 'tap':
                    this.debugItemParent().children.forEach((child) => {
                        let item = child.getComponent(DebugItemBase)
                        item?.handleTap(item === caseItem)
                    })  
                return
        }
     }

}

