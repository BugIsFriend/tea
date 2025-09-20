/**
 * @Author: myerse.lee
 * @Date: 2024-09-25 17:10:15
 */
import { EDITOR } from 'cc/env'
import { loadAsync } from '../load'
import { ui } from '../ui'
import { BgView } from './bg'
import { ViewAction, ViewState, ViewCategory } from './const'

const { ccclass, property, executionOrder, executeInEditMode, disallowMultiple } = _decorator
import { _decorator, CCBoolean, Color, Component, Enum, EventHandler, Node, UITransform, Vec3, tween, Prefab, instantiate } from 'cc'

@ccclass('View')
@executionOrder(-1)
@disallowMultiple
@executeInEditMode
export class View extends Component {
    public tag: string // 标记当前ViewTag

    @property({ type: Enum(ViewCategory), tooltip: '弹出动作' })
    category: number = ViewCategory.Window

    @property({ type: Enum(ViewAction), tooltip: '弹出动作' })
    action: number = ViewAction.Scale

    @property({ type: [EventHandler], tooltip: '显示时: 回调xx组件的xx方法' })
    showHandler: EventHandler[] = []

    @property({ type: [EventHandler], tooltip: '关闭时: 回调xx组件的xx方法' })
    closeHandler: EventHandler[] = []

    private onShowCbs: Function[] = []
    private onCloseCbs: Function[] = []

    public state: ViewState = ViewState.None // 窗口状态

    /**
     * 创建有 ViewComp 组件的 Node
     * @param asset :
     * @param bundleName : asset 是字符串，则需要bundleName
     * @returns
     */
    static async create(asset: string | Prefab | Node | '', bundleName: string = 'resources'): Promise<View> {
        let node = null
        if (!asset) {
            node = new Node()
        } else if (asset instanceof Node) {
            node = asset
        } else if (typeof asset == 'string' || asset instanceof Prefab) {
            if (typeof asset == 'string') {
                asset = (await loadAsync(asset, bundleName)) as any
                if (!asset) return null
            }
            node = instantiate(asset)
        }
        return node.addComponent(View)
    }

    protected onLoad(): void {
        this.runEditor()
    }

    /**
     * 在编辑器中定时调用 update;
     */
    runEditor() {
        // 添加默认背景颜色
        if (EDITOR) {
            this.unschedule(this.updateView)
            this.schedule(this.updateView, 0.2)
        }
    }

    getBgView(): BgView {
        return this.getComponent(BgView)
    }

    updateView() {}

    // 动作执行完了
    _completed(state: ViewState) {
        this.state = state
        let tarHandler = this.state == ViewState.Openged ? this.showHandler : this.closeHandler

        tarHandler.forEach((handler) => {
            if (handler && handler.target && handler.handler) handler.emit([handler.customEventData])
        })

        let cbs = []
        if (this.state == ViewState.Openged) {
            cbs = this.onShowCbs
            this.onShowCbs = []
        } else if (this.state == ViewState.Closed) {
            cbs = this.onCloseCbs
            this.onCloseCbs = []
        }
        cbs.forEach((func) => func())

        if (this.category == ViewCategory.PopView || this.category == ViewCategory.Window) {
            // todo 通知 ui 对象 做相关处理
            ui.handleActCompeleted(this)
        }
    }

    show() {
        if (this.state == ViewState.Opening || this.state == ViewState.Closing) return
        let uiRoot = this.node.parent
        this.state = ViewState.Opening
        let [openDt] = [0.2, 0.15]
        this.updateView()
        if (this.action == ViewAction.Scale) {
            let [scaleB, scaleM] = [new Vec3(1.2, 1.2, 1.2), new Vec3(1, 1, 1)]

            this.node.setScale(Vec3.ZERO)
            tween(this.node)
                .to(openDt + 0.05, { scale: scaleB }, { easing: 'cubicIn' })
                .to(openDt, { scale: scaleM })
                .call(() => this._completed(ViewState.Openged))
                .start()
        } else if (this.action == ViewAction.Bottom || this.action == ViewAction.Top) {
            let sign = this.action == ViewAction.Top ? 1 : -1
            let bootY = uiRoot.getComponent(UITransform).contentSize.height
            this.node.setPosition(new Vec3(0, sign * bootY, 0))
            tween(this.node)
                .to(openDt, { position: Vec3.ZERO })
                .call(() => this._completed(ViewState.Openged))
                .start()
        } else if (this.action == ViewAction.Left || this.action == ViewAction.Right) {
            let sign = this.action == ViewAction.Right ? 1 : -1
            let x = uiRoot.getComponent(UITransform).contentSize.width
            this.node.setPosition(new Vec3(sign * x, 0, 0))
            tween(this.node)
                .to(openDt, { position: Vec3.ZERO })
                .call(() => this._completed(ViewState.Openged))
                .start()
        }
    }

    closeAction() {
        if (this.state == ViewState.Opening || this.state == ViewState.Closing) return
        let uiRoot = this.node.parent
        this.state = ViewState.Closing
        let [openDt] = [0.2, 0.15]
        if (this.action == ViewAction.Scale) {
            let [scaleB, scaleM] = [new Vec3(1.2, 1.2, 1.2), new Vec3(0, 0, 0)]

            tween(this.node)
                .to(openDt, { scale: scaleB }, { easing: 'cubicOut' })
                .to(openDt, { scale: scaleM })
                .call(() => this._completed(ViewState.Closed))
                .start()
        } else if (this.action == ViewAction.Bottom || this.action == ViewAction.Top) {
            let sign = this.action == ViewAction.Top ? 1 : -1
            let bootY = uiRoot.getComponent(UITransform).contentSize.height
            let pos = new Vec3(0, sign * bootY, 0)
            tween(this.node)
                .to(openDt, { position: pos })
                .call(() => this._completed(ViewState.Closed))
                .start()
        } else if (this.action == ViewAction.Left || this.action == ViewAction.Right) {
            let sign = this.action == ViewAction.Right ? 1 : -1
            let x = uiRoot.getComponent(UITransform).contentSize.width
            let pos = new Vec3(sign * x, 0, 0)
            tween(this.node)
                .to(openDt, { position: pos })
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

    protected onDestroy(): void {}
}
