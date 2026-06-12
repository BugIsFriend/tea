/*  
* @Author: myerse.lee   
* @Date: 2026-02-26 14:55:35   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-26 14:55:35   
* * */

import { LoadComponent} from "../component/load";
import { singleton } from "../meta/class";
import { gain, keys } from "../tools";

import { instantiate, Prefab, find, input, Input, macro, isValid, _decorator, EventKeyboard, } from "cc";
import { DebugView } from "./views/debug-view";

export enum DebugGroupType {
    Default = 'Default',
    Storage = 'Storage',
    Http = 'Http',
    Mock = 'Mock'
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

    private  showGroupId = 0
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

    public registerDebugPrefab(groudId: DebugGroupType, container: Prefab, caseItem: Prefab, containerComp?:any, caseItemComp?:any) {
        this.mapDebugPrefab.set(groudId, {container, caseItem, containerComp:containerComp, caseItemComp:caseItemComp})
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
                this.view.show(this.showGroupId)
            })
        } else { 
            this.view.show(this.showGroupId)
        }
    }

    public init() {
        
        keys(DebugGroupType,'string').forEach(groupId => this.addGroup(groupId as DebugGroupType))
        
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    }

    public data(): Map<DebugGroupType,DebugDatas> { 
        return this._gData
    }

    public clearData() { 
        this._gData.forEach((value, key) =>  value.clear())
        this._mFlowGroups.clear()
    }

    public onKeyDown(event:EventKeyboard) {
        if (event.keyCode == macro.KEY.q) { // F12
            this.show()
        }
        if(event.keyCode >= macro.KEY.f1 && event.keyCode <= macro.KEY.f12) { // F12
            this.showGroupId = event.keyCode - macro.KEY.f1
        }
    }

}
// 自定义CaseItem界面；如果没有设置，则使用默认界面

export const __debug = new Debug()
