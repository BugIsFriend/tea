import { Component ,_decorator, Node} from "cc";
const { ccclass} = _decorator

/**
 * 用于非 cocos Creator 组件的封装；
 */
export interface IUnit {
    get isValid(): boolean
}


/**
 * cocos Creator 组件的封装；
 */
@ccclass('Unit')
export class Unit extends Component implements IUnit { 

    /** 
     * 组将被创建出来后，做一些初始化工作；
     * @param creator 
     */
    public init(data?: any): void {}

    /**
     *  获取一个 Unit 组件，如果没有该组件则添加一个,首次添加会尝试调用 init 方法；
     * @returns 
     */
    public gain<T extends Component>(type: { new(): T; }, data?: any ): T {
        let comp = this.getComponent(type)
        if (!comp) {
            comp = this.addComponent(type)
            this?.init(data)
        }
        return comp
    }

}