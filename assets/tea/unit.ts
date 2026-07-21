/*  
* @Author: myerse.lee  
* @Date: 2026-06-03 10:48:13   
* @Modified by:   myerse.lee   
* @Modified time: 2026-06-03 10:48:13   
* */

import { Component, _decorator, Node, js } from "cc";
import { emmiter } from "./emitter";
import { unlinkProperty } from "./meta/method";
import { gain } from "./tools";
const { ccclass} = _decorator

/**
 * 用于非 cocos Creator 组件的封装；
 */
export interface IUnit {
    get isValid(): boolean
}

// Cocos 组件的封装；
@ccclass('Unit')
export class Unit extends Component implements IUnit { 

    _data: any = null

    /** 
     * 组将被创建出来后，做一些初始化工作；
     * @param creator 
     */
    public init(data?: any): void { }

    public getData<T>():T{ 
        return this._data
    }

    /**
     *  获取一个 Unit 组件，如果没有该组件则添加一个,首次添加会尝试调用 init 方法；
     * @returns 
     */
    public gain<T extends Component>(compClass: { new(): T; } | string, data?: any, classChain: boolean = true): T {
        //@ts-ignore
        let comp = this.getComponent(compClass)
        if (!comp) {
            //@ts-ignore
            comp = gain(this.node, compClass)
            //@ts-ignore
            js.isChildClassOf(comp.constructor, Unit) && comp?.init(data)
            
        }
        return comp
    }

   protected onDestroy(): void {
       emmiter.off({ context: this })
       unlinkProperty(this)
   }

}