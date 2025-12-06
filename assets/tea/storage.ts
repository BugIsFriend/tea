/**
 * 本地存储带过期时间的数据
 * 使用day 来定义数据格式
 */
import { log, sys, warn } from "cc"
import { DEBUG, PREVIEW } from "cc/env"

export namespace storage {

    const ALL_KEYS = '__ALL_KEYS'

    type StorageValue<T> = {
        value: T
        expireAt: number // 过期时间的时间戳（毫秒）
        encrypt?: boolean
    }

    function encode<T>(obj: StorageValue<T>):string{ 
        if (obj.encrypt && !PREVIEW) { 
            // obj.value =  _encode(obj.value)  // TODO implement _encode mether 
        }
        return  JSON.stringify(obj)
    }

    function decode<T>(content:string) { 
        if (!!content) { 
            let obj = JSON.parse(content) as StorageValue<T>
            if (obj.encrypt && !PREVIEW) { 
                // return _decode(obj.value) as T  // TODO implement _decode mether
            }
            return obj.value
        }
        return null
    }

    export function set<T>(key: string, value: T, expireDate?: Dayjs, encrypt?: boolean) {
        
        if (value === null || value === undefined) { 
            warn('storage fail:  the value is null')
            return 
        }
        
        const data: StorageValue<T> = {
            value,
            expireAt : expireDate?.valueOf(),
            encrypt : encrypt?true:false
        }
        
        sys.localStorage.setItem(key, encode(data))

        let values = sys.localStorage.getItem(ALL_KEYS) || ''
        if (!values.includes(key)) {
            values += `,${key}`
            sys.localStorage.setItem(ALL_KEYS, values)
        }
    }

    export function get<T>(key: string): T | null {
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
            sys.localStorage.getItem(keys_string) 
        }
    }

    /**
     * 清除素有的key
     */
    export function clear() {
        sys.localStorage.clear()
    }
}
