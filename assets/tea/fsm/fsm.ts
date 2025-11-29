/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 13:57:55
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 13:57:55
 * */

import { State } from './state'
import { _decorator, Component, Node, CCString, warn, Enum, CCClass } from 'cc'
const { ccclass, property, executeInEditMode, executionOrder } = _decorator

/**
 * TODO:   1.  添加全局状态；
 */
@ccclass('StateMachine')
// @executeInEditMode()
@executionOrder(3)
export class StateMachine extends Component {
    owner: Node

    curState = '' // 设置状态列表
    currentStateCom: State // 当前的状态类

    @property({ type: [CCString], tooltip: '状态组件都需要继承 State 类' }) states = []

    // @property({
    //     tooltip: '没有值,重新激活组件',
    //     type: Enum({}),
    //     visible() {
    //         let e_states = (this.states as []).map((state) => {
    //             return { name: state, value: state }
    //         })
    //         CCClass.Attr.setClassAttr(this, 'curState', 'enumList', e_states)
    //         return true
    //     }
    // })

    protected onLoad(): void {
        this.init()
    }

    init() {
        // 重置所有的状态；
        for (const state of this.states) {
            if (!this.getStateComponent(state)) this.addComponent(state)
        }

        let stateList = this.getComponents(State)
        stateList.forEach((state) => state.exit(this.node))

        let state = this.addStateComponent(this.curState)
        this.enterState(state)
    }

    /**
     * 当前状态是否为xxx
     */
    public isInState(state: string) {
        return this.curState == state
    }

    /**
     * 获取当前状态组件
     */
    public getStateComponent(state: string) {
        return this.getComponent(state)
    }

    public addStateComponent(state: string): State {
        return (this.getComponent(state) || this.addComponent(state)) as State
    }

    /**
     * 改变状态；
     */
    public changeState(state: string) {
        this._changeState(state)
    }

    enterState(stateCom: State) {
        this.currentStateCom = stateCom
        this.currentStateCom.enter(this.owner)
    }

    private _changeState(state: string) {
        if (!this.isInState(state)) {
            let currentStateCom = this.getComponent(this.curState) as State
            if (currentStateCom) currentStateCom?.exit(this.owner)

            let nextStateCom = (this.getComponent(state) || this.addComponent(state)) as State

            this.enterState(nextStateCom)

            this.curState = state
        } else {
            warn(`${state} 与当前状态相同，无需切换`)
        }
    }

    protected update(dt: number): void {
        this.currentStateCom?.execute(this.owner)
    }
}
