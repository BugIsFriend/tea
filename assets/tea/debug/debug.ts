/*  
* @Author: myerse.lee   
* @Date: 2026-02-26 14:55:35   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-26 14:55:35   
* * */

import { LoadComponent} from "../component/load";
import { singleton } from "../meta/class";
import { gain, keys } from "../tools";

import { instantiate, Prefab, find, input, Input, macro, isValid, _decorator, EventKeyboard, UITransform, KeyCode, } from "cc";
import { DebugView } from "./views/debug-view";
import { storage } from "../storage";

export enum DebugGroupType {
    Default = 'Default',    // 默认
    Storage = 'Storage',    // 本地存储
    Http = 'Http',          // Http请求
    Socket = 'Socket',      // 网络消息
    Memory = 'Memory'       // 内存对象
}

type KeyType = number | string
type DebugDatas = Map<KeyType, ICaseData>
type TDebugPrefab = { container: Prefab, caseItem: Prefab,  containerComp?:any, caseItemComp?:any }

export enum ECase { 
    TabItem = 0,   // 页签
    DebugItem = 1, // 测试用例
}

export interface ICaseData { 
    name: string,                               // 显示名字；
    id?: KeyType,                               // 用户可指定 ID； 没有指定ID 时，会自动生成，指定ID 和 自动生成id 可能会冲突
    group?: DebugGroupType,                     // 当前属于那一组； 没有放在 'Default' 组中
    flow_id?:  KeyType,                         // 如果存在 flow_id 则，优先存储在流 id 中；流可用以组织测试用例的执行流程；
    tapCb?: (duebugData: ICaseData) => string   // 点击回调： 返回值会显示在界面上；如果没有返回值，则显示 name
    data?: any,                                 // 用户自定数据
}

export interface IFlowCaseData extends ICaseData { 
    flow_id:  KeyType
}

@singleton
export class Debug { 

    private  showGroupId:DebugGroupType = DebugGroupType.Default
    public view: DebugView

    // caseData 中没有 id，则自动生成一个 id
    private _caseId = 0
    private _gData: Map<DebugGroupType, DebugDatas> = new Map<DebugGroupType, Map<KeyType, ICaseData>>()    // 测试用例
    
    private _mFlowGroups: Map<KeyType, ICaseData[]> = new Map<KeyType, ICaseData[]>()

    public mapDebugPrefab: Map<DebugGroupType, TDebugPrefab> = new Map<DebugGroupType, TDebugPrefab>()  // 增加 自定义界面预设；根据组别显示不同的界面；如果没有设置，则使用默认界面；
    
    addGroup(groupId: DebugGroupType) { 
        if (!this._gData.has(groupId)) { 
            this._gData.set(groupId, new Map<KeyType, ICaseData>())
        }
    }

    get caseId() {
        return this._caseId++
    }

    /**
     * 增加一个测试用例；
     * @param debug_case 
     */
    public addCase(debug_case: ICaseData) { 
 
        if (!debug_case.id) debug_case.id =  this.caseId

        debug_case.group ??= DebugGroupType.Default

        let mGroup = this._gData.get(debug_case.group)
        if (!mGroup) { 
            mGroup = new Map<KeyType, ICaseData>()
            this._gData.set(debug_case.group,mGroup)
        }
        
        if (debug_case.flow_id) {
            let flow_group = this._mFlowGroups.get(debug_case.flow_id)
            if (!flow_group) { 
                flow_group =  new Array<ICaseData>()
                this._mFlowGroups.set(debug_case.flow_id, flow_group)
            }
            flow_group.push(debug_case)
            _.orderBy(flow_group,['group'], ['asc'])
        } else {   
            mGroup.set(debug_case.id , debug_case)
        }
    }

    public registerDebugPrefab(groudId: DebugGroupType, container: Prefab, caseItem: Prefab, containerCtr?:any, caseItemCtr?:any) {
        this.mapDebugPrefab.set(groudId, {container, caseItem, containerComp:containerCtr, caseItemComp:caseItemCtr})
    }

    public getDebugPrefab(groudId: DebugGroupType): TDebugPrefab {
        return this.mapDebugPrefab.get(groudId)
    }  

    get root() {
        return find('Canvas/debug', tea.root)
    }

    public show() { 
        if (!isValid(this.view)) {
            LoadComponent.asynload<Prefab>('tea/asset/prefab/debug/DebugsView').then((prefab) => {
                let debug_node = instantiate(prefab)
                debug_node.parent = this.root
                this.view = gain(debug_node, DebugView)
                this.view.gain(UITransform).setContentSize(gain(this.root,UITransform).contentSize.clone())
                this.view.show(this.showGroupId)
            })
        } else { 
            this.view.show(this.showGroupId)
        }
    }

    public init() {
        keys(DebugGroupType, 'string').forEach(groupId => this.addGroup(groupId as DebugGroupType))
        this.refreshCaseData()
        
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)

        let key = storage.DEBUG_KEYS[1]+'last_show'
        if (storage.get(key)) { 
             //@ts-ignore
             this.showGroupId = storage.get(key)
        }
    }

    public data(): Map<DebugGroupType,DebugDatas> { 
        return this._gData
    }

    public clearData() { 
        this._gData.forEach((value, key) =>  value.clear())
        this._mFlowGroups.clear()
    }

    public onKeyDown(event:EventKeyboard) {
        if (event.keyCode == KeyCode.KEY_Q) { // F12
            this.view?.node.active? this.hide():this.show()
        }
        if (event.keyCode > KeyCode.DIGIT_0 && event.keyCode <= KeyCode.DIGIT_9) { // F12
            if (this.view?.node.active) { 
                let keys = Object.keys(DebugGroupType)
                let tar_group = keys[event.keyCode - KeyCode.DIGIT_1]  as DebugGroupType

                if (tar_group) { 
                    let key = storage.DEBUG_KEYS[1]+'last_show'
                    storage.set(key,{value:tar_group})
                    this.showGroupId =  tar_group
                    this.show()
                }
            }
        }
    }

    public hide() { 
        this.view?.hide()
    }

    refreshCaseData() { 

        // storage debug case
        this._gData.forEach((mGroup, group) => { 
            this._gData.set(group, mGroup)
        })

        storage.getAllKeys(storage.DEBUG_KEYS).forEach(key => {
            tea.debug.addCase({
                group:DebugGroupType.Storage,
                name: key,
                data: storage.get(key),
                tapCb: (data) => {
                    return ''
                }
            })
        })

        // http http case
        storage.getValues(storage.DEBUG_KEYS[0]).forEach(pair => {
            tea.debug.addCase({
                group:DebugGroupType.Http,
                name: pair.key,
                data: pair.value
            })
        })
    }

}
// 自定义CaseItem界面；如果没有设置，则使用默认界面

export const __debug = new Debug()
