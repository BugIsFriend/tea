/*  
* @Author: myerse.lee  
* @Date: 2026-06-03 10:46:57   
* @Modified by:   myerse.lee   
* @Modified time: 2026-06-03 10:46:57   
* */

import { _decorator, EditBox, find, Label, Layout, ScrollView, UITransform } from 'cc';
import { DebugContainer } from './container';
import { seek } from '../../meta/method';
import { storage } from '../..//storage';
import { DebugItemBase, formatDisplayData } from './item-base';
import { HttpURL } from '../../net/http-url';
const { ccclass, property } = _decorator;

//https://www.fengniaojianzhan.com/fengniao/p/7309884543599429452?actId=7309884543599429452&groupId=0&enforceWK=1
@ccclass('DebugContainerHttp')
export class DebugContainerHttp extends DebugContainer {

    @property(EditBox) TxtSearch: EditBox = null;
    
    @property(EditBox) TxtParam: EditBox = null ;
    @property(EditBox) TxtRunCode: EditBox = null ;
    @property(EditBox) TxtPost: EditBox = null ;
    @property(EditBox) TxtResponse: EditBox = null ;


    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    public toggleGetOrPost(EditBox: EditBox) {
    
    }

    public tapBtnAdd() {
        let url = this.TxtSearch.string
        if (!!url && url.trim()) { 
            console.log(HttpURL.parseParts(url))
        }
     }
    
    public tapBtnFilter() { }

    public tapSave() { 

    }

    public tapSend() {
        
    }

    public addDebugItem(item: DebugItemBase) {
        super.addDebugItem(item)
        
        let num = this.debugItemParent().children.length+1
        let gap = this.debugItemParent().getComponent(Layout)?.spacingY ?? 0
        this.debugItemParent().getComponent(UITransform).height = (item.node.getComponent(UITransform).height +gap)* num
    }

    public tapUrlDebugCase(caseItem: DebugItemBase) {
        // this.DataViewEditBox.string = formatDisplayData(caseItem.caseData.data)
    }

    public updateView(action?: 'delete' | 'save'| 'tap' | string, caseItem?: DebugItemBase) {  
        
        let tar_key = caseItem?.caseData.name
        switch (action) {
            case 'delete':
                    // this.TxtKey.string = ''
                    // this.DataViewEditBox.string = ''
                    storage.remove(tar_key)
                    caseItem.node.parent = null
                break
            case 'save':
                    try {
                        // let data = JSON.parse(this.DataViewEditBox.string,(key, value) => key === 'expire' ? dayjs(value).valueOf() : value)
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

