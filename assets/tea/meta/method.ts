/*  
 * @Author: myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified by: myerse.lee
 * @Last Modified time: 2026-02-27 17:05:46
* * */

import { Component, js, Node} from 'cc'
import { emmiter } from '../emitter'

export type MixType = Node | Component


// type ParamTypeObj<T> = { type: T[] }

// export type ParamTypeComp<T extends Component> = T | ParamTypeObj<T>
// export type ParamType<T extends MixType> = T | ParamTypeObj<T>

function initDecoratorKey(obj: any) {
    if (!obj.__decoratorkey__) obj.__decoratorkey__ = {}
}

/**
 * 
 * @param url 获取 以属性名为名的节点， 并且该节点是 url 指定节点的子节点；
 *            若 url 为空，则该节点是当前节点的子节点
 */
export function seek(tType: any = Node, parentUrl:string = '') {
    return function (target, key) {
        const mapKey = '_##_' + key

        const set = function (value) {
            initDecoratorKey(this)
            this.__decoratorkey__[mapKey] = value
        }

        const get = function () {
            initDecoratorKey(this)
            if (!!this.__decoratorkey__[mapKey]) return this.__decoratorkey__[mapKey]
            //@ts-ignore

            if (!!parentUrl && !parentUrl.endsWith('/')) parentUrl += '/'

            let parent: Node = !parentUrl ? this.node : this.node.getChildByName(parentUrl)
            let tarNode = parent.getChildByName(key)

            this.__decoratorkey__[mapKey] = js.isChildClassOf(tType,Node) ? tarNode : tarNode?.getComponent(tType)

            if (!this.__decoratorkey__[mapKey]) console.warn(`未找到属${key}性对应的目标`)
            return this.__decoratorkey__[mapKey]
        }
        return Object.defineProperty(target, key, { set: set, get: get })
    }
}

/**
 *  找到以 key.substring(0,key.lenght-1) 为前缀的所有子节或者 子节点的组件；
 * @param tType 
 * @param parentUrl 
 * @returns 
 */
export function seeks(tType: any = Node, parentUrl: string ='') { 
    return function (target, key) {
        const mapKey = '_##_' + key

        const set = function (value) {
            initDecoratorKey(this)
            this.__decoratorkey__[mapKey] = value
        }

        const get = function () {
            initDecoratorKey(this)
            if (!!this.__decoratorkey__[mapKey]) return this.__decoratorkey__[mapKey]
           
            //@ts-ignore
            let prefix = key.substring(0, key.length - 1).toLowerCase()


            if (!!parentUrl && !parentUrl.endsWith('/')) parentUrl += '/'

            let parent: Node = !parentUrl ? this.node : this.node.getChildByName(parentUrl)
            
            let tarChildren:any[] = parent.children.filter(node => node.name.toLowerCase().includes(prefix))
            
            if (js.isChildClassOf(tType, Component)) { 
                tarChildren = tarChildren.map(child=>child.getComponent(tType))
            }
            
            this.__decoratorkey__[mapKey] = tarChildren

            if (!tarChildren || tarChildren.length == 0 ) { 
                console.warn(`未找到目标 Node 或者组件 `)
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
        let oldvalue = descriptor.value
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
        let oldvalue = descriptor.value
        descriptor.value = function (...args: any[]) {
            let result = oldvalue.apply(target, args)
            emmiter.emit(msg, result)
        }
        return descriptor
    }
}
