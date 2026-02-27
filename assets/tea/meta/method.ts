/*  
 * @Author: myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2026-02-27 17:05:46
* * */

import { Component, find, js, Node, error } from 'cc'
import { emmiter } from '../emitter'

export type MixType = Node | Component

type ParamTypeObj<T> = { type: T[] }

export type ParamTypeComp<T extends Component> = T | ParamTypeObj<T>
export type ParamType<T extends MixType> = T | ParamTypeObj<T>

function getTarget<T extends MixType>(ctor: { new(): T }, comp: any, key?:string, url?:string): T {
    if (js.isChildClassOf(ctor, Node)) {
        if(!url && !!key) return comp.node.getChildByName(key) as T
        return comp.node
    } else { 
        let tarcom = comp.getComponent(ctor)
        if (!tarcom) error(` there isn't ${ctor.name}  in  ${comp.node.name} Node`)
        return tarcom
    }
}

function initDecoratorKey(obj: any) {
    if (!obj.__decoratorkey__) obj.__decoratorkey__ = {}
}

/**
 *  获取当前节点的组件或者子节点的组件； 通过url参数指定获取组件的节点
 * @param param: Component|Node|[Component|Node]
 * @param url : 路径：指向当前节点对应的子节点； 若不存在 
 * ! 非数组
 * @example 1： @seek(Node) xNode: Node;                获取子节点名字为label的节点； 
 * @example 2： @seek(Node,'xxx/xx') xNode: Node;       获取子节点为'xxx/xx'的节点 
 * @example 3： @seek(Label) label: Label;              获取Label组件；
 * @example 4： @seek(Label,'xxx/xx') label: Label;     获取子节点为'xxx/xx'的节点的 Label 组件；
 * ! 数组 需要链接key的前缀(最后一个字符前面的部分) 
 * @example 5： @seek([Node]) nodes: Node[];            获取所有子节点名字包含 'node' 的节点；
 * @example 6： @seek([Label]) lables: Label[];          获取所有子节点名字包含 'lable' 的节点上的 Label 组件；
 * */
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
                this.__decoratorkey__[mapKey] = getTarget(param, node, key,url) // 找到对应的
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
            oldvalue.apply(target, args)
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
            let result = oldvalue.apply(target, args)
            emmiter.emit(msg, result)
        }
        return descriptor
    }
}
