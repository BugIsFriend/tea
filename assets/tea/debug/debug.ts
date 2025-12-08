import { singleton } from "../meta/class";


type DebugData =  Map<number, IDebugCaseData>

/**
 *  debug 模块；
 */
@singleton
export class Debug { 

    // 单个测试用例
    private _mData: DebugData = new Map<number, IDebugCaseData>()
    
    private _mFlowGroups:Map<number,IDebugCaseData[]> = new Map<number,IDebugCaseData[]>()

    // 添加一个测试用例
    public addCase(debug_case: IDebugCaseData) { 
 
        if (!debug_case.id) { 
            debug_case.id =  Date.now()
        }
    
        if (debug_case.flow_id) {
            let flow_group = this._mFlowGroups.get(debug_case.flow_id)
            if (!flow_group) { 
                flow_group =  new Array<IDebugCaseData>()
                this._mFlowGroups.set(debug_case.flow_id, flow_group)
                _.orderBy(flow_group,['group'], ['asc'])
            }
            flow_group.push(debug_case)
        } else {   
            this._mData.set(debug_case.id , debug_case)
        }
    }
}

export interface IDebugCaseData { 
    name: number,
    flow_id?: number,    // 如果存在 flow_id 则，优先存储在 流 id 中；流可以建立测试逻辑；
    group?: number,      // 当前属于那一组； 0
    id?: number,
    cb?:Function
}

export const _debug = new Debug()