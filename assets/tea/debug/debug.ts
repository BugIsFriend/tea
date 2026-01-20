import { singleton } from "../meta/class";


type KeyType = number | string
type DebugData =  Map<KeyType, IDebugCaseData>

export interface IDebugCaseData { 
    name: number,
    flow_id?:  KeyType,    // 如果存在 flow_id 则，优先存储在 流 id 中；流可以建立测试逻辑；
    group?: KeyType,      // 当前属于那一组； 0
    id?: KeyType,
    cb?:Function
}


/**
 *  debug 模块；
 */
@singleton
export class Debug { 

    // 单个测试用例
    private _mData: DebugData = new Map<KeyType, IDebugCaseData>()
    
    private _mFlowGroups:Map<KeyType,IDebugCaseData[]> = new Map<KeyType,IDebugCaseData[]>()

    /**
     * 增加一个测试用例；
     * @param debug_case 
     */
    public addCase(debug_case: IDebugCaseData) { 
 
        if (!debug_case.id) { 
            debug_case.id =  Date.now()
        }
    
        if (debug_case.flow_id) {
            let flow_group = this._mFlowGroups.get(debug_case.flow_id)
            if (!flow_group) { 
                flow_group =  new Array<IDebugCaseData>()
                this._mFlowGroups.set(debug_case.flow_id, flow_group)
            }
            flow_group.push(debug_case)
            _.orderBy(flow_group,['group'], ['asc'])
        } else {   
            this._mData.set(debug_case.id , debug_case)
        }
    }

    /**
     * addDataCase: 添加数据测试用例, 用于显示数据的变化；用例，每一帧都要更新；
     */
    public addDataCase() {
        
    }
}

export const __debug = new Debug()