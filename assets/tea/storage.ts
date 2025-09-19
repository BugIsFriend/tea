/**
 * 本地存储带过期时间的数据
 * 使用day 来定义数据格式
 */

export namespace storage {
    type StorageValue<T> = {
        value: T
        expireAt: number // 过期时间的时间戳（毫秒）
    }

    export function set<T>(key: string, value: T, expireDate: Date) {
        const data: StorageValue<T> = {
            value,
            expireAt: expireDate.getTime()
        }
        localStorage.setItem(key, JSON.stringify(data))
    }

    export function get<T>(key: string): T | null {
        const item = localStorage.getItem(key)
        if (!item) return null
        try {
            const data: StorageValue<T> = JSON.parse(item)
            if (data.expireAt && Date.now() > data.expireAt) {
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
}
