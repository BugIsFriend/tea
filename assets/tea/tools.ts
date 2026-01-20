/*
 * @Author: myerse.lee
 * @Date: 2025-09-23 16:50:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2025-12-21 16:39:27
 */

import { isValid, tween, Node, v3 } from "cc";

export type KT = number | string

export type eMap = { idx: number; ikey: KT; skey: KT; map: any }

/**
 * 取出对象中所有的数字 key 或者字符串 key
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

/**
 * 节点的呼吸动效
 * @param node 
 * @param repeatTimes: -1: 永久效果；
 */
export function breathingAni(node: Node, repeatTimes: number = -1, timeScale: number = 1) {
    if (!isValid(node)) return
    let once_ani = tween(node)
                .to(.35*timeScale,{scale:v3(1.05,1.05,1.05)})
                .to(.35*timeScale,{scale:v3(1,1,1)})
                .to(.35*timeScale,{scale:v3(0.95,0.95,0.95)})
        .to(.35 * timeScale,{scale:v3(1,1,1)})
    
    if (repeatTimes == -1) {
      return tween(node).repeatForever(once_ani).start()
    } else { 
      return tween(node).repeat(repeatTimes,once_ani).start()
    }
}
