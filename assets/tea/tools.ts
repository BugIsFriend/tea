/*
 * @Author: myerse.lee
 * @Date: 2025-09-23 16:50:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2026-04-01 18:59:33
 */

import { isValid, tween, Node, v3, Component, js } from "cc";

export type KT = number | string

export type eMap = { idx: number; ikey: KT; skey: KT; map: any }

/**
 * 取出对象中所有的 数字key 或者 字符串key
 * @param enum
 * @returns
 */
export function keys<T extends object>(enumObj: T, kt: 'string' | 'number' = 'number'): KT[] {
    return Object.keys(enumObj)
        .filter((key) => (kt == 'number' ? !isNaN(Number(key)) : isNaN(Number(key))))
        .map((key) => (kt == 'number' ? parseInt(key) : key))
}

/**
 * 有序化枚举对象，并且和有序的数组进行映射
 * @scene 为每个枚举值增加处理函数|默认处理函数|默认对象；
 * @param enumObj
 * @param mapValue
 * @param defaultValue
 * @returns
 */
export function enum2map<T extends object, MT>(enumObj: T, kt: 'string' | 'number' = 'string', mapValue?: MT[], defaultValue?: any): Map<string | number, MT> {
    let map = new Map<string | number, any>()
    keys(enumObj, kt).forEach((key, idx) => {
        map.set(key, (mapValue && mapValue[idx]) || defaultValue)
    })
    return map
}

/**
 * 节点的呼吸动效
 * @param node 
 * @param repeatTimes: -1: 永久效果；
 */
export function breath(node: Node, repeatTimes: number = -1, timeScale: number = 1) {
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

/**
 **  找当前节点是否存在 类的继承链上的组件，没有则增加一个该组件；
 * @param node 
 * @param ctor 
 */
export function gain<T extends Component>(node: Node | Component, ctor?: { new(): T } | string, classChain: boolean = true): T {

    if (classChain) { 
        let comClass: T = null
        if (typeof ctor === 'string') {
            //@ts-ignore
            comClass = js.getClassByName(ctor as string)
        } else { 
            //@ts-ignore
            comClass = ctor
        }

        let comps = node instanceof Node? node.components: node.node.components

        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            //@ts-ignore
            if (comp instanceof comClass) {
                return comp as T;
            }
        }
    }

    //@ts-ignore
    return node.getComponent(ctor) || node.addComponent(ctor)
}


/**
 * 打乱数组顺序
 * @param arr 
 */
export function shuffle<T>(arr: T[]):T[]{
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
}