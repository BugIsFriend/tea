/**
 * @Author: myerse.lee
 * @Date: 2024-09-25 17:10:15
 */
import { ui } from '../ui'
import { Background } from './background'
import { ViewCategory } from './category'

const { ccclass, property, executionOrder, executeInEditMode, disallowMultiple } = _decorator
import { _decorator, Enum, EventHandler, Node, Prefab, instantiate } from 'cc'
import { BackgroudParam, NumberAnimateMap, UIAnimate } from '../uitypes'
import { Unit } from '../unit'
import { LoadCom } from '../component/loadcom'

export enum ViewState {
    None,
    Opening,
    Openged,
    Hide, // 隐藏不删除
    Closing, //关闭中
    Closed // 关闭且删除
}

/**
 * 弹框基类
 */
@ccclass('View')
@executionOrder(-1)
@disallowMultiple
@executeInEditMode
export class View extends Unit {
    public tag: string // 标记当前ViewTag

    @property({ type: Enum(ViewCategory), tooltip: '弹出动作' })
    category: number = ViewCategory.View

    @property({ type: Enum(UIAnimate), tooltip: '弹出动作' })
    animate: number = UIAnimate.scale

    @property({ type: BackgroudParam, tooltip: '背景参数' }) param: BackgroudParam = new BackgroudParam()

    @property({ type: [EventHandler], tooltip: '显示时: 回调xx组件的xx方法' })
    showHandler: EventHandler[] = []

    @property({ type: [EventHandler], tooltip: '关闭时: 回调xx组件的xx方法' })
    closeHandler: EventHandler[] = []

    private onShowCbs: Function[] = []
    private onCloseCbs: Function[] = []

    public background: Background
    public state: ViewState = ViewState.None // 窗口状态

    /**
     * 创建有 ViewComp 组件的 Node
     * @param asset :
     * @param bundleName : asset 是字符串，则需要bundleName
     * @returns
     */
    static async create(asset: string | Prefab | Node | ''): Promise<View> {
        let node = null
        if (!asset) {
            node = new Node()
        } else if (asset instanceof Node) {
            node = asset
        } else if (typeof asset == 'string' || asset instanceof Prefab) {
            if (typeof asset == 'string') {
                asset = (await LoadCom.asynload(asset)) as any
                if (!asset) return null
            }
            node = instantiate(asset)
        }
        return node.addComponent(View)
    }

    public setBackgroundParam(param: BackgroudParam) {
        Object.assign(this.param, param)
        this.background?.setParam(this.param)
    }

    addBackground() {
        if (this.param.active && !this.background) {
            this.background = this.addComponent(Background)
        }
        this.background.setParam(this.param)
    }

    updateView() {}

    // 打开或关闭动画结束时回调函数
    _completeFunc: Function
    setCompletedFunc(func: Function) {
        this._completeFunc = func
    }

    _completed(state: ViewState) {
        // 动作执行完了
        this.state = state
        let tarHandler = this.state == ViewState.Openged ? this.showHandler : this.closeHandler

        tarHandler.forEach((handler) => {
            if (handler && handler.target && handler.handler) handler.emit([handler.customEventData])
        })

        if (this.state == ViewState.Openged) {
            this.onShowCbs.forEach((func) => func())
        } else if (this.state == ViewState.Closed) {
            this.onCloseCbs.forEach((func) => func())
        }

        if (this.category == ViewCategory.PopView || this.category == ViewCategory.View) {
            this._completeFunc && this._completeFunc(this)
        }
    }

    show() {
        if (this.state == ViewState.Opening || this.state == ViewState.Closing) return
        this.state = ViewState.Opening
        this.updateView()

        let aniFunc = NumberAnimateMap.get(this.animate)
        if (aniFunc) {
            aniFunc(this.node, true)
                .call(() => this._completed(ViewState.Openged))
                .start()
        }
    }

    close() {
        if (this.state == ViewState.Opening || this.state == ViewState.Closing) return
        this.state = ViewState.Closing
        let aniFunc = NumberAnimateMap.get(this.animate)
        if (aniFunc) {
            aniFunc(this.node, false)
                .call(() => this._completed(ViewState.Closed))
                .start()
        }
    }

    /**
     * 触发关闭: 给关闭 btn 使用
     */
    triggerClose() {
        ui.close(this)
    }

    appendShowedCb(func: Function) {
        this.onShowCbs.push(func)
    }

    appendClosedCb(func: Function) {
        this.onCloseCbs.push(func)
    }

    /**
     * TODO 响应返回按键，尚未实现
     * @returns 
     */
    returnKeyEnabled() { 
        return false
    }
}
