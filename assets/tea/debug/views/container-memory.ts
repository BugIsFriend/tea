

import { _decorator, EditBox, find, js, Label, Layout, Toggle, UITransform } from 'cc';
import { DebugContainer } from './container';
const { ccclass, property } = _decorator;
import { DebugItemBase, formatDisplayData } from './item-base';
import { gain } from '../../tools';

@ccclass('DebugContainerMemory')
export class DebugContainerMemory extends DebugContainer { 

    @property(EditBox) TxtSearch: EditBox = null;
    @property(EditBox) EditBoxMemoryObject:EditBox = null

    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    public setMemoryData(data: object) {
       !!data &&(this.EditBoxMemoryObject.string = formatDisplayData(data))
    }

    public tapBtnFilter() {
        let url = this.TxtSearch.string.trim()
        if (!!url) { 
            let likes = []
            this.debugItemParent().children.forEach((child) => {
                let item = gain(child, DebugItemBase)
                let data: object = item.caseData.data
                item?.handleTap(false)
            })

            if (likes.length > 0) {
                this.clear()
                this.setMemoryData(likes[0].caseData.data)
                likes[0]?.handleTap(true)
                // scroll to target position;
                tea.tip.show('找到匹配 Http 请求')
            } else { 
                tea.tip.show('没有找到匹配 htttp 请求')
            }
        }
    }
    
    public clear() { 

    }

}