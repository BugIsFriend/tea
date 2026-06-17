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
import { gain } from '../../tools';
const { ccclass, property } = _decorator;

//https://www.fengniaojianzhan.com/fengniao/p/7309884543599429452?actId=7309884543599429452&groupId=0&enforceWK=1

type THttpDebugData = {__key?: string, url: string, method?: HttpMethod, postData?:any , mockData?:any, isMock?:boolean}

@ccclass('DebugContainerHttp')
export class DebugContainerHttp extends DebugContainer {

    @property(EditBox) TxtSearch: EditBox = null;
    
    @property(EditBox) TxtParam: EditBox = null;
    @property(EditBox) TxtRunCode: EditBox = null;
    @property(EditBox) TxtPost: EditBox = null;
    @property(EditBox) TxtResponse: EditBox = null;

    @property(Toggle) toggleGet: Toggle = null;
    @property(Toggle) togglePost: Toggle = null;
    @property(Toggle) toggleMock: Toggle = null;
    
    url:HttpURL
    urlPrix:string = storage.DEBUG_KEYS[0]

    
    public get method() : HttpMethod {
        return this.toggleGet.isChecked ? HttpMethod.GET : HttpMethod.POST
    }

    onEditBegan(edit: EditBox) {
        edit.getComponentInChildren(Label).node.active = true  
    }

    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    setUrlData(data: THttpDebugData, tapItem:boolean = false) { 
        data.url.trim()
        this.url = new HttpURL(data.url)
        this.url.method = data.method

        let k_url = this.urlPrix + data.url
        let s_data = storage.get<THttpDebugData>(k_url)

        let parseUrl = this.url.parse()

        if (!js.isEmptyObject(parseUrl.params)) { 
            this.TxtParam.string = formatDisplayData(parseUrl.params)
        }

        if (tapItem && s_data) {
            if (s_data.method == HttpMethod.POST) {
                this.togglePost.isChecked = true
                s_data.postData && (this.TxtPost.string = formatDisplayData(data.postData))
            } else {
                this.toggleGet.isChecked = true
                this.TxtPost.string = ''
            }

            this.toggleMock.isChecked = s_data.isMock
            s_data.isMock && s_data.mockData && (this.TxtResponse.string = formatDisplayData(s_data.mockData))
        } else { 

        }
        
        storage.set(k_url, { value: Object.assign(s_data,data)})
    }

    public tapBtnAdd() {
        let url = this.TxtSearch.string
        let k_url = this.urlPrix + url
        let s_data = storage.get<THttpDebugData>(k_url)
        if (!s_data) { 
            this.setUrlData({ url, method: HttpMethod.GET })
        }
    }
    
    public tapBtnFilter() {
        let url = this.TxtSearch.string 
        if (!!url) { 
            let urlPrix =   this.urlPrix + !!url.trim()
            let values = storage.getValues(urlPrix)
            let tar = values[0]?.key
            for (let i = 0; i < values.length; i++) {
                const element = values[i];
                if (urlPrix == element.key) { 
                    tar = element.key
                    break;
                }
            }
            
            if (!!tar) { 
                // TODO  goto tar url item
            }
        }
    }

    public toggleGetOrPost(toggle: Toggle) {
        if (!this.url) return;
        this.setUrlData({url:this.url.getURL(), method :this.method})
    }

    public tapMockToggle() { 
        if(!this.url) return 
        if (this.toggleMock.isChecked) {
            let k_url = this.urlPrix + this.url.getURL()
            //@ts-ignore
            let mockData = storage.get(k_url)?.mockData
            if (!!mockData) {
                this.TxtResponse.string = formatDisplayData(mockData)
            } else { 
                tea.tip.show('input mock JSON data')
            }
        } 
        this.setUrlData({url:this.url.getURL(), isMock: this.toggleMock.isChecked})

    }

    // 保存参数
    public tapSave() { 
        if (!this.url) return;
        let [param,postData,mockData] = [null,null,null]
        
        // 参数 数据
        if (!!this.TxtParam.string) { 
            param = this.TxtParam.string?.trim()
            try {
                param = JSON.parse(param)
            } catch (error) {
                console.warn('JSON 解析 param 错误')
            }
            !!param&&this.url.setParams(param)
        }
        
        // post 数据
        if (!!this.TxtPost.string && this.method == HttpMethod.POST) {
            postData = this.TxtPost.string?.trim()
            try {
                postData = JSON.parse(postData)
            } catch (error) {
                console.warn('JSON 解析 postData 错误')
            }
        } 

        // mock 数据
        if (this.toggleMock.isChecked && !!this.TxtResponse.string) { 
            mockData = this.TxtResponse.string?.trim()
            try {
                mockData = JSON.parse(mockData)
            } catch (error) {
                console.warn('JSON 解析 postData 错误')
            }
        }

        let url = this.url.getURL()
        this.TxtSearch.string = url
        if (!!url) { 
            this.setUrlData({url, method:this.method, postData, mockData})
        }
    }

    public tapSend() {
        if (this.toggleMock.isChecked && !this.TxtResponse.string) { 
            tea.tip.show('请输入  Mock JSON Data')
            return
        }

        if (this.method == HttpMethod.POST && !this.TxtPost.string) { 
            tea.tip.show('请输入  Post JSON Data')
            return
        }

        HttpComponent.request(this.url).then((response) => { 
            this.TxtResponse.string = formatDisplayData(response)
        })
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
                        let item = gain(child,DebugItemBase)
                        if (item === caseItem) { 
                            this.setUrlData(item.caseData.data, true)
                        }
                        item?.handleTap(item === caseItem)
                    })  
                return
        }
     }

}

