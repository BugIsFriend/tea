/**
 * @Author: myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2025-12-21 16:51:39
 */

import { Component, find, js, Node } from 'cc'
import { emmiter } from '../emitter'

export type MixType = Node | Component

type ParamTypeObj<T> = { type: T[] }

export type ParamTypeComp<T extends Component> = T | ParamTypeObj<T>
export type ParamType<T extends MixType> = T | ParamTypeObj<T>

function getTarget<T extends MixType>(ctor: { new (): T }, comp: any): T {
    return js.isChildClassOf(ctor, Node) ? comp.node : comp.getComponent(ctor)
}

function initDecoratorKey(obj: any) {
    if (!obj.__decoratorkey__) obj.__decoratorkey__ = {}
}

/**
 *  !不能和property一起使用
 *  获取当前节点的组件(某一类组件列表)
 * @param param: Component|Node|[Component|Node]
 * @param url : 如果 param 非数组，目标节点或者目标组件；
 *              如果 param 是数组，并且param[0] 是 Node，找到所有名字为propNameLenght-1的节点： 如属性golds 前缀为gold
 *              如果 param 是数组，并且param[0] 是 Component, 找到所有名字为propNameLenght-1的节点, 且节点拥有 param[0]组件；
 * @returns
 */
export function seek<ParamType>(param: ParamType, url?: string) {
    return function (target, key) {
        const mapKey = '_##_' + key

        const set = function (value) {
            initDecoratorKey(this)
            this.__decoratorkey__[mapKey] = value
        }

        const get = function () {
            initDecoratorKey(this)
            if (!!this.__decoratorkey__[mapKey]) return this.__decoratorkey__[mapKey]

            let node = !!url ? find(url, this.node) : this.node
            if (!Array.isArray(param)) {
                //@ts-ignore
                this.__decoratorkey__[mapKey] = getTarget(param, node) // 找到对应的
            } else {
                let result = []
                //@ts-ignore
                let tpyeInfo = param[0]

                let prefix = key.substring(0, key.length - 1).toLowerCase()
                if (tpyeInfo === Node) {
                    node.children.forEach((child) => {
                        let name = child.name.toLowerCase()
                        name.includes(prefix) && result.push(child)
                    })
                } else {
                    node.children.forEach((child) => {
                        let name = child.name.toLowerCase()
                        let com = child.getComponent(tpyeInfo)
                        name.includes(prefix) && com && result.push(com)
                    })
                }
                this.__decoratorkey__[mapKey] = result
            }
            return this.__decoratorkey__[mapKey]
        }
        return Object.defineProperty(target, key, { set: set, get: get })
    }
}

/**
 * 对象销毁时：删除对象的__decoratorkey__属性，防止循环引用内存泄漏
 * onDestory 可调用该对象
 * @param obj
 * @returns
 */
export function unlinkProperty(obj) {
    if (!obj.__decoratorkey__ || !Object.keys(obj.__decoratorkey__).length) return
    for (const key in obj.__decoratorkey__) {
        delete obj.__decoratorkey__[key]
    }
}

/**
 * 为该方法订阅一个消息： 当消息触发，调用该函数
 * @param msg
 */
export function subscribe(msg: string, priority?: number, once?: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let oldvalue = target[propertyKey]
        descriptor.value = function (...args: any[]) {
            oldvalue.apply(this, args)
        }
        once ? emmiter.once(msg, descriptor.value, target) : emmiter.on(msg, descriptor.value, target, priority)
        return descriptor
    }
}

/**
 * 该方法被调用，触发一个消息；
 * 返回值会作为触发消息的参数；
 * @param msg
 */
export function publish(msg: string, data?: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let oldvalue = target[propertyKey]
        descriptor.value = function (...args: any[]) {
            let result = oldvalue.apply(this, args)
            emmiter.emit(msg, result)
        }
        return descriptor
    }
}
