
export interface ITBox { 
    title?:string   // 标题
    content:string  // 提示内容
    ok?: {
        txt?: string,
        cb?: Function,
    },
    cancel?: {
        txt?: string,
        cb?: Function,
    }   
}