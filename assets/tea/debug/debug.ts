/*  
* @Author: myerse.lee   
* @Date: 2026-02-26 14:55:35   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-26 14:55:35   
* * */

import { instantiate, Prefab, Node, find, debug } from "cc";
import { LoadCom } from "../component/load";
import { singleton } from "../meta/class";
import { gain } from "../tools";
import { DebugView } from "./debug-view";


type KeyType = number | string
type Group  = string
type DebugDatas = Map<KeyType, ICaseData>


export interface ICaseData { 
    name: string,                               // 显示名字；
    flow_id?:  KeyType,                         // 如果存在 flow_id 则，优先存储在 流 id 中；流可以建立测试逻辑；
    group?: Group,                              // 当前属于那一组； 0
    id?: KeyType,                               // 测试用例ID；
    cb?:(duebugData:ICaseData)=>string     // 返回数据需要显示文本；
}

export interface IFlowCaseData extends ICaseData { 
    flow_id:  KeyType
}

@singleton
export class Debug { 

    // 单个测试用例
    private _gData: Map<Group,DebugDatas>  = new Map<Group, Map<KeyType,ICaseData>>()
    
    private _mFlowGroups: Map<KeyType, ICaseData[]> = new Map<KeyType, ICaseData[]>()

    public view:DebugView
    
    /**
     * 增加一个测试用例；
     * @param debug_case 
     */
    public addCase(debug_case: ICaseData) { 
 
        if (!debug_case.id) { 
            debug_case.id =  Date.now()
        }

        debug_case.group ??= 'All'

        let mGroup = this._gData.get(debug_case.group)
        if (!mGroup) { 
            mGroup = new Map<Group, ICaseData>()
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

    /**
     * addDataCase: 添加数据测试用例, 用于显示数据的变化；用例，每一帧都要更新；
     */
    public addDataCase() {
        
    }

    get root() {
        return find('Canvas/debug', tea.root)
    }

    public show() { 
        if (!this.view) {
            LoadCom.asynload<Prefab>('tea/asset/prefab/debug/DebugsView').then((prefab) => {
                let debug_node = instantiate(prefab)
                debug_node.parent = this.root
                this.view = gain(debug_node, DebugView)
                this.view.show()
            })
        } else { 
            this.view.show()
        }
    }

    public data(): Map<Group,DebugDatas> { 
        return this._gData
    }

}

export const __debug = new Debug()