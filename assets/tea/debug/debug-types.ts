import { Prefab } from "cc"


export type KeyType = number | string
export type DebugDatas = Map<KeyType, ICaseData>
export type TDebugPrefab = { container: Prefab, caseItem: Prefab,  containerComp?:any, caseItemComp?:any }

export enum ECase { 
    TabItem = 0,   // 页签
    DebugItem = 1, // 测试用例
}

export enum DebugGroupType {
    Default = 'Default',    // 默认
    Storage = 'Storage',    // 本地存储
    Http = 'Http',          // Http请求
    Memory = 'Memory',       // 内存对象
    Socket = 'Socket',      // 网络消息
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

export interface ICaseDataMemory extends ICaseData {
    getData: () => object,              // 获取内存对象数据；用于显示在界面上
    setData?: (data: object) => void,    // 设置内存对象数据；用于在界面上修改内存对象数据
    runCode?: string, // 执行代码；用于在界面上执行代码
}

