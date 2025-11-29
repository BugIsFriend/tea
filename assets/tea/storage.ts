/**
 * 本地存储带过期时间的数据
 * 使用day 来定义数据格式
 */

export namespace storage {
    type StorageValue<T> = {
        value: T
        expireAt: number // 过期时间的时间戳（毫秒）
        encrypt?: boolean
    }

    const ALL_KEYS = '__ALL_KEYS'

    export function set<T>(key: string, value: T, expireDate?: Dayjs, encrypt?:boolean) {
        const data: StorageValue<T> = {
            value,
            expireAt : expireDate?.valueOf(),
            encrypt : encrypt?true:false
        }
        localStorage.setItem(key, JSON.stringify(data))

        let values = localStorage.getItem(ALL_KEYS) || ''
        if (!values.includes(key)) {
            values += `,${key}`
            localStorage.setItem(ALL_KEYS, values)
        }
    }

    export function get<T>(key: string): T | null {
        const item = localStorage.getItem(key)
        if (!item) return null
        try {
            const data: StorageValue<T> = JSON.parse(item)
            if (!!data.expireAt && Date.now() > data.expireAt) {
                localStorage.removeItem(key)
                return null
            }
            return data.value
        } catch {
            localStorage.removeItem(key)
            return null
        }
    }

    export function remove(key: string) {
        localStorage.removeItem(key)
    }

    export function dump(key){ 
        
    }

    /**
     * 清除素有的key
     */
    export function clear() {
        let allKeys: string = localStorage.getItem(ALL_KEYS)
        if (!!allKeys) allKeys.split(',').forEach((key) => storage.remove(key))
    }
}
