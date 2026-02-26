import { __debug } from "../debug/debug"

/**
 * 普通测试用例； 用于测试一个功能的多个方面；每个方面可以有不同的测试数据； 通过 group 来区分不同的方面；
 * @param name 
 * @param group 
 */
export function debug_case(name: string, group?: string,) {
    
    return function (target, key, descriptor) {
        let oldvalue = descriptor.value
        descriptor.value = function (...args: any[]) {
            let result = oldvalue.apply(target, args)
            return result
        }
        return descriptor
    }
    __debug.addCase({ name, group })
}

/**
 * 流程测试用例； 用于测试一个流程的多个步骤；每个步骤可以有不同的测试数据； 通过 group 来区分不同的步骤； 通过 flow_id 来区分不同的流程；
 * @param name 
 * @param group 
 * @param flow_id 
 */
export function debug_flow_case(name:string, group?:string, flow_id?:number) { 

}
