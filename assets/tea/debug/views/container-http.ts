/*  
* @Author: myerse.lee  
* @Date: 2026-06-03 10:46:57   
* @Modified by:   myerse.lee   
* @Modified time: 2026-06-03 10:46:57   
* */

import { _decorator, EditBox, find, js, Label, Layout, Toggle, UITransform } from 'cc';
import { DebugContainer } from './container';
import { storage } from '../..//storage';
import { DebugItemBase, formatDisplayData } from './item-base';
import { HttpMethod, HttpURL } from '../../net/http-url';
import { HttpComponent } from '../../net/http-component';
const { ccclass, property } = _decorator;

//https://www.fengniaojianzhan.com/fengniao/p/7309884543599429452?actId=7309884543599429452&groupId=0&enforceWK=1
@ccclass('DebugContainerHttp')
export class DebugContainerHttp extends DebugContainer {

    @property(EditBox) TxtSearch: EditBox = null;
    
    @property(EditBox) TxtParam: EditBox = null;
    @property(EditBox) TxtRunCode: EditBox = null;
    @property(EditBox) TxtPost: EditBox = null;
    @property(EditBox) TxtResponse: EditBox = null;

    @property(Toggle) mock: Toggle = null;
    
    url:HttpURL
    method:HttpMethod = HttpMethod.GET
    urlPrix:string = storage.DEBUG_KEYS[0]


    onEditBegan(edit: EditBox) {
        edit.getComponentInChildren(Label).node.active = true  
    }

    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    public tapBtnAdd() {
        let url = this.TxtSearch.string
        if (!!url) { 
            url = this.TxtSearch.string.trim()
            this.url = new HttpURL(url)
            let parseUrl = this.url.parse()
            if (!js.isEmptyObject(parseUrl.params)) { 
                this.TxtParam.string = formatDisplayData(parseUrl.params)
            }
            console.log('add:  ', parseUrl)
            this.url.method = HttpMethod.GET
            storage.set(this.urlPrix + url, { value: url, method:this.url.method })
        }
     }
    
    public tapBtnFilter() {
        let url = this.TxtSearch.string 
        if (!!url) { 
            let urlPrix =   this.urlPrix + !!url.trim()
            let values = storage.getValues(urlPrix)
            let tar = values[0]?.__key
            for (let i = 0; i < values.length; i++) {
                const element = values[i];
                if (urlPrix == element.__key) { 
                    tar = element.__key
                    break;
                }
            }
            
            if (!!tar) { 
                // TODO  goto tar url item
            }
        }
    }

    public toggleGetOrPost(EditBox: EditBox, method: 'get' | 'post') {
        if (!this.url) return;

        this.method = method == 'get' ? HttpMethod.GET : HttpMethod.POST
        let s_url =  this.url.getURL()
        storage.set(this.urlPrix + s_url, { value: s_url, method:this.url.method })
    }

    public toggleMock() { 
        tea.tip.show('input mock JSON data')
    }

    // 保存参数
    public tapSave() { 
        let param = null
        try {
            param = JSON.parse(this.TxtParam.string)
        } catch (error) {
            console.warn('JSON 解析错误')
        }
        if (!!param) this.url.setParams(param)
        let url = this.url.getURL()
        this.TxtSearch.string = url
        if (!!url) { 
            storage.set(this.urlPrix+url, { value: url, method:this.url.method })
        }
    }

    public tapSend() {
        if (this.mock.isChecked) {
            if (!this.TxtResponse.string) {
                tea.tip.show('input mock JSON data')
            }
        } else { 
            HttpComponent.request(this.url).then((response) => { 
                this.TxtResponse.string = formatDisplayData(response)
            })
        }

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

