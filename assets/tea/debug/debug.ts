/*  
* @Author: myerse.lee   
* @Date: 2026-02-26 14:55:35   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-26 14:55:35   
* * */

import { LoadComponent} from "../component/load";
import { singleton } from "../meta/class";
import { gain } from "../tools";
import { DebugView } from "./debug-view";
import { Unit } from "../unit";
import { seek } from "../meta/method";

import { instantiate, Prefab, Node, find, input, Input, macro, isValid, Label, Color, Sprite, Button, Layout, _decorator, } from "cc";
const { ccclass } = _decorator


export type DebugTabType = 'Default' | 'Storage' | string
type KeyType = number | string
type Group  = DebugTabType
type DebugDatas = Map<KeyType, ICaseData>
type TDebugPrefab = { container: Prefab, caseItem: Prefab }



export enum ECase { 
    TabItem = 0,   // 页签
    DebugItem = 1, // 测试用例
}

export interface ICaseData { 
    name: string,                               // 显示名字；
    flow_id?:  KeyType,                         // 如果存在 flow_id 则，优先存储在 流 id 中；流可以建立测试逻辑；
    group?: Group,                              // 当前属于那一组； 0
    id?: KeyType,                               // 测试用例ID；
    tapCb?: (duebugData: ICaseData) => string   // 点击回调： 返回值会显示在界面上；如果没有返回值，则显示 name
    data?: any,                                 // 其他数据
}

export interface IFlowCaseData extends ICaseData { 
    flow_id:  KeyType
}



@singleton
export class Debug { 

    // 单个测试用例
    private _caseId = 0
    private _gData: Map<Group, DebugDatas> = new Map<Group, Map<KeyType, ICaseData>>()
    
    private _mFlowGroups: Map<KeyType, ICaseData[]> = new Map<KeyType, ICaseData[]>()

    public view: DebugView

    public mapDebugPrefab: Map<Group, TDebugPrefab> = new Map<Group, TDebugPrefab>()  // 增加 自定义界面预设；根据组别显示不同的界面；如果没有设置，则使用默认界面；
    
    get caseId() {
        return this._caseId++
    }
    
    /**
     * 增加一个测试用例；
     * @param debug_case 
     */
    public addCase(debug_case: ICaseData) { 
 
        if (!debug_case.id) debug_case.id =  this.caseId

        debug_case.group ??= 'Default'

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

    public registerDebugPrefab(groudId: Group, container: Prefab, caseItem: Prefab) {
        this.mapDebugPrefab.set(groudId, {container, caseItem})
    }

    public getDebugPrefab(groudId: Group): TDebugPrefab {
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
                this.view.show()
            })
        } else { 
            this.view.show()
        }
    }

    public init() { 
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
    }

    public data(): Map<Group,DebugDatas> { 
        return this._gData
    }

    public clearData() { 
        this._gData.forEach((value, key) =>  value.clear())
        this._mFlowGroups.clear()
    }

    public onKeyDown(event) {
        if (event.keyCode == macro.KEY.q) { // F12
            this.show()
        }
    }

}
// 自定义CaseItem界面；如果没有设置，则使用默认界面；
@ccclass('DebugItemBase')
export class DebugItemBase extends Unit { 
    caseData: ICaseData
    container: Node
    initData(caseData: ICaseData, container?: Node): void { 
        this.caseData = caseData
        this.node.parent = container
        this.container = container
    }
}

export const __debug = new Debug()
