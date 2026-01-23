/*  
* @Author: myerse.lee  
* @Date: 2025-12-21 16:22:58   
* @Modified by:   myerse.lee   
* @Modified time: 2025-12-21 16:22:58
* @Description:  本地存储带过期时间的数据 使用day 来定义数据格式
* */

import { sys, warn } from "cc"
import { PREVIEW } from "cc/env"

export interface IValue { 
    value: any,
    expireDate?: Dayjs,
    encrypt?: boolean
}

export namespace storage {

    const ALL_KEYS = '__ALL_KEYS'

    type StorageValue<T> = {
        value: T
        expireAt: number // 过期时间的时间戳（毫秒）
        encrypt?: boolean
    }

    function encode<T>(obj: StorageValue<T>):string{ 
        if (obj.encrypt && !PREVIEW) { 
            // obj.value =  _encode(obj.value)  // TODO implement _encode method 
        }
        return  JSON.stringify(obj)
    }

    function decode<T>(content:string) { 
        if (!!content) { 
            let obj = JSON.parse(content) as StorageValue<T>
            if (obj.encrypt && !PREVIEW) { 
                // return _decode(obj.value) as T  // TODO implement _decode method
            }
            return obj.value
        }
        return null
    }

    /**
     * 
     * @param key  存储 key
     * @param data 存储 数据
     * @param id   存储 key 绑定到指定 id 上如 uid / device_id 等， 也可是是组合 id;
     * @returns 
     */
    export function set<T>(key: string, data:IValue, id?:number|string) {
        
        if (data.value === null || data.value === undefined) { 
            warn('storage fail:  the value is null')
            return 
        }

        if (!!id) key = `${key}_${id}`   
        
        const sdata: StorageValue<T> = {
            value : data.value,
            expireAt : data.expireDate?.valueOf(),
            encrypt : data.encrypt?true:false
        }
        
        sys.localStorage.setItem(key, encode(sdata))

        let values = sys.localStorage.getItem(ALL_KEYS) || ''
        if (!values.includes(key)) {
            values += `,${key}`
            sys.localStorage.setItem(ALL_KEYS, values)
        }
    }

    export function get<T>(key: string, id?: number | string): T | null {

        if (!!id) key = `${key}_${id}`  

        const content:string = sys.localStorage.getItem(key)
        if (!content) return null
        try {
            const data: StorageValue<T> = decode(content)
            if (!!data.expireAt && Date.now() > data.expireAt) {
                remove(key)
                return null
            }
            return data.value
        } catch {
            sys.localStorage.removeItem(key)
            return null
        }
    }

    // 删除某个指定key
    export function remove(key: string) {
        sys.localStorage.removeItem(key)
        let keys_string: string = sys.localStorage.getItem(ALL_KEYS)
        if (!!keys_string) { 
            let allKeys = keys_string.split(',').filter((item) => item != key)
            keys_string = allKeys.join(',')
            sys.localStorage.setItem(ALL_KEYS, keys_string)
        }
    }

    /**
     * 清除素有的key
     */
    export function clear() {
        sys.localStorage.clear()
    }
}
