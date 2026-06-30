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

type THttpDebugData = {__key?: string, url: string, method?: HttpMethod, postData?:any , mockData?:any, isMock?:boolean}

@ccclass('DebugContainerHttp')
export class DebugContainerHttp extends DebugContainer {

    @property(EditBox) TxtSearch: EditBox = null;
    
    @property(EditBox) TxtParam: EditBox = null;
    @property(EditBox) TxtRunCode: EditBox = null;
    @property(EditBox) TxtPost: EditBox = null;
    @property(EditBox) TxtMock: EditBox = null;
    @property(EditBox) TxtResponse: EditBox = null;

    @property(Toggle) toggleGet: Toggle = null;
    @property(Toggle) togglePost: Toggle = null;
    @property(Toggle) toggleMock: Toggle = null;
    
    url:HttpURL
    urlPrix: string = storage.DEBUG_KEYS[0]
    
    curDebugItem:DebugItemBase

    
    public get method() : HttpMethod {
        return this.toggleGet.isChecked ? HttpMethod.GET : HttpMethod.POST
    }

    onEditBegan(edit: EditBox) {
        edit.getComponentInChildren(Label).node.active = true  
    }

    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    public getStorageKey(url: string) { 
        return this.urlPrix + url
    }

    setUrlData(data: THttpDebugData, tapItem:boolean = false) { 
        data.url.trim()
        this.url = new HttpURL(data.url)

        let k_url = this.getStorageKey(data.url)

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
            if (!s_data.isMock) {
                this.TxtMock.string = ''
            } else { 
                s_data.mockData && (this.TxtMock.string = formatDisplayData(s_data.mockData))
            }
        }

        //@ts-ignore
        !s_data && (s_data = {})
        
        storage.set(k_url, { value: Object.assign(s_data, data) })
        
        this.url.mock = s_data?.isMock
        this.url.mockData = s_data?.mockData
        this.url.method = s_data.method
        this.url.postdata = s_data.postData
    }

    public tapBtnAdd() {
        let url = this.TxtSearch.string
        let k_url = this.getStorageKey(url.trim())
        let s_data = storage.get<THttpDebugData>(k_url)
        if (!s_data) { 
            this.setUrlData({ url, method: HttpMethod.GET })
        }
    }
    
    public tapBtnFilter() {
        let url = this.TxtSearch.string.trim()
        if (!!url) { 
            let likes = []
            this.debugItemParent().children.forEach((child) => {
                let item = gain(child, DebugItemBase)
                let data: THttpDebugData = item.caseData.data
                item?.handleTap(false)
                if (data.url === url) {
                    likes.splice(0,1,item)
                } else if (data.url.includes(url)) { 
                    likes.push(item)
                }
            })

            if (likes.length > 0) {
                this.clear()
                this.setUrlData(likes[0].caseData.data, true)
                likes[0]?.handleTap(true)
                // scroll to target position;
                tea.tip.show('找到匹配 Http 请求')
            } else { 
                tea.tip.show('没有找到匹配 htttp 请求')
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
            let k_url = this.getStorageKey(this.url.getURL())
            //@ts-ignore
            let mockData = storage.get(k_url)?.mockData
            if (!!mockData) {
                this.TxtMock.string = formatDisplayData(mockData)
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
        if (this.toggleMock.isChecked && !!this.TxtMock.string) { 
            mockData = this.TxtMock.string?.trim()
            try {
                mockData = JSON.parse(mockData)
            } catch (error) {
                console.warn('JSON 解析 mockData 错误')
            }
        }

        let url = this.url.getURL()
        this.TxtSearch.string = url
        if (!!url) { 
            this.setUrlData({url, method:this.method, postData, mockData})
        }
    }

    public tapSend() {
        
        this.tapSave()  // 发送前触发下 save

        if (this.toggleMock.isChecked && !this.TxtMock.string) { 
            tea.tip.show('请输入  Mock JSON Data')
            return
        }

        if (this.method == HttpMethod.POST && !this.TxtPost.string) { 
            tea.tip.show('请输入  Post JSON Data')
            return
        }

        this.url.mock = this.toggleMock.isChecked
        HttpComponent.request(this.url).then((response) => { 
            this.TxtResponse.string = formatDisplayData(response)
            let code = this.TxtRunCode.string
            eval(code || `tea.tip.show('http 请求成功')`)
        })
    }

    public addDebugItem(item: DebugItemBase) {
        super.addDebugItem(item)
        let num = this.debugItemParent().children.length+1
        let gap = this.debugItemParent().getComponent(Layout)?.spacingY ?? 0
        this.debugItemParent().getComponent(UITransform).height = (item.node.getComponent(UITransform).height +gap)* num
    }

    public updateView(action?: 'delete' | 'save'| 'tap' | string, caseItem?: DebugItemBase) {  
        let tar_key = caseItem?.caseData.name
        switch (action) {
            case 'delete':
                    storage.remove(tar_key)
                    caseItem.node.parent = null
                    if (this.curDebugItem == caseItem) { 
                        this.clear()
                    }
                break
            case 'tap':
                    this.debugItemParent().children.forEach((child) => {
                        let item = gain(child,DebugItemBase)
                        if (item === caseItem) { 
                            this.clear()
                            this.setUrlData(item.caseData.data, true)
                        }
                        item?.handleTap(item === caseItem)
                    })  
                return
        }
    }
    
    public clear() {
        this.TxtParam.string = '';
        this.TxtRunCode.string = '';
        this.TxtPost.string = '';
        this.TxtResponse.string = '';

        this.toggleGet.isChecked= true;
        this.togglePost.isChecked= false;
        this.toggleMock.isChecked = false;
        this.url?.clear()
    }
}

