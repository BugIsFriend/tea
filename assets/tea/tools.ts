/*
 * @Author: myerse.lee
 * @Date: 2025-09-23 16:50:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2025-09-30 17:18:07
 */

export type KT = number | string

export type eMap = { idx: number; ikey: KT; skey: KT; map: any }

/**
 * 取出枚举对象的 数字索引数组 | 字符索引数组
 * @param enumObj
 * @returns
 */
export function idxs<T extends object>(enumObj: T, kt: 'string' | 'number' = 'number'): KT[] {
    return Object.keys(enumObj)
        .filter((key) => (kt == 'number' ? !isNaN(Number(key)) : isNaN(Number(key))))
        .map((key) => (kt == 'number' ? parseInt(key) : key))
}

/**
 * 有序化枚举对象，并且和有序的数组进行映射
 * @scene 为每个枚举值增加处理函数|默认处理函数|默认对象；
 * @param enumObj
 * @param orderMap
 * @param defaultMap
 * @returns
 */
export function enum2map<T extends object, MT>(enumObj: T, kt: 'string' | 'number' = 'string', orderMap?: MT[], defaultMap?: any): Map<string | number, MT> {
    let map = new Map<string | number, any>()
    idxs(enumObj, kt).forEach((key, idx) => {
        map.set(key, (orderMap && orderMap[idx]) || defaultMap)
    })
    return map
}
