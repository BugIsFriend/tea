import { Component } from "cc";



/**
 * 用于非 cocos Creator 组件的封装；
 */
export interface IUnit {
    get isValid(): boolean
}


/**
 * cocos Creator 组件的封装；
 */
export class Unit extends Component implements IUnit { 


    /** 
     * 组将被创建出来后，做一些初始化工作；
     * @param creator 
     */
    public init<T extends Component>(creator: T, data?: any): void {}

    /**
     *  获取一个 Unit 组件，如果没有该组件则添加一个，有别于 getComponent 只是获取；
     * @returns 
     */
    public gainComponent<T extends Component>(type: { new(): T; } ): T | null {
        let comp = this.getComponent(type)
        if (!comp) {
            comp = this.addComponent(type)
            this?.init(comp)
        }
        return comp
    }


}