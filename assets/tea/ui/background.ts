/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 15:40:49
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 15:40:49
 * */
import {
    _decorator,
    assetManager,
    BlockInputEvents,
    Component,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    v2,
    warn,
    tween,
    isValid,
    Size,
    Tween,
    Input,
    EventHandler
} from 'cc'
import { EDITOR } from 'cc/env'
import { BackgroudParam } from '../uitypes'
const { ccclass, property, executionOrder, executeInEditMode } = _decorator

@ccclass('Background')
@executionOrder(-1)
@executeInEditMode
export class Background extends Component {
    @property(BackgroudParam) param: BackgroudParam = new BackgroudParam({})

    @property({ type: [EventHandler], tooltip: '显示时: 回调xx组件的xx方法' })
    touchHandler: EventHandler[] = []

    private _onTouch: boolean = false

    public tag: string // 标记当前ViewTag

    public bgNode: Node

    protected onLoad(): void {
        this.addBgNode()
        this.onInputEvent({ ...this.param })
    }

    updateUITransform(size: Size) {
        if (!this.bgNode) this.addBgNode()

        let vnode_Trans = this.node.getComponent(UITransform)
        let uiTransform = this.bgNode.getComponent(UITransform)

        if (size && uiTransform) {
            uiTransform.setAnchorPoint(v2(0.5, 0.5))
            uiTransform.setContentSize(size.clone())
        }
        if (size && vnode_Trans) {
            vnode_Trans.setContentSize(size.clone())
        }
    }

    addBgNode() {
        // 添加默认背景颜色
        this.bgNode = this.node.getChildByName('#bgNode')
        if (!this.bgNode) {
            if (!this.bgNode) {
                // 添加背景节点
                this.bgNode = new Node('#bgNode')
                this.node.addChild(this.bgNode)
                this.bgNode.layer = this.node.layer
                this.bgNode.setSiblingIndex(0)
                this.bgNode.active = this.param.active

                // 背景 给节点添加 UITransform

                let vnode_Trans = this.node.getComponent(UITransform)
                if (!vnode_Trans) {
                    vnode_Trans = this.node.addComponent(UITransform)
                    warn(`ViewCom: 该节点没有 UITransform,自动添加,请检查 ${this.node.name}`)
                } else {
                }
                let uiTransform = this.bgNode.addComponent(UITransform)
                uiTransform.setAnchorPoint(v2(0.5, 0.5))
                uiTransform.setContentSize(vnode_Trans.contentSize.clone())

                // 添加组件
                this.bgNode.addComponent(Sprite)
                this.bgNode.addComponent(BlockInputEvents)

                this.updateView()
            }

            this.bgNode.active = true
            let bgSprite = this.bgNode.getComponent(Sprite)
            assetManager.loadAny('7d8f9b89-4fd1-4c9f-a3ab-38ec7cded7ca@f9941', (err, spriteFrame: SpriteFrame) => {
                if (!err) bgSprite.spriteFrame = spriteFrame
            })
        }

        if (EDITOR) {
            this.unschedule(this.updateView)
            this.schedule(this.updateView, 0.2)
        }
    }

    onInputEvent(param: BackgroudParam) {
        this.addBgNode()
        let { touch, intercept, touchClose } = param
        let touchBlock = this.bgNode.getComponent(BlockInputEvents)
        if (this._onTouch !== touch || touchClose) {
            if (!touch) this.node.off(Node.EventType.TOUCH_START, this.onTouch, this)
            if (touch || touchClose) {
                this.node.on(Input.EventType.TOUCH_START, this.onTouch, this)
            }
            this._onTouch = touch
        }

        if (intercept !== touchBlock.enabled) {
            touchBlock.enabled = intercept
        }

        this.param.intercept = intercept
        this.param.touch = touch
    }

    setParam(param: BackgroudParam) {
        Object.assign(this.param, param)
        this.updateView()
    }

    updateView() {
        this.addBgNode()
        if (this.bgNode) {
            let vnode_Trans = this.node.getComponent(UITransform)
            this.bgNode.getComponent(UITransform).setContentSize(vnode_Trans.contentSize.clone())

            // 修改颜色
            let sprite = this.bgNode.getComponent(Sprite)
            sprite.color = this.param.color

            this.bgNode.active = this.param.active

            this.onInputEvent({ ...this.param })
        }
    }

    // 设置触摸关闭回调函数
    _touchCloseFunc: Function
    setTouchCloseFunc(func: Function) {
        this._touchCloseFunc = func
    }

    onTouch() {
        this.param.touch && this.touchHandler.forEach((item) => item.emit(null))

        this._touchCloseFunc && this._touchCloseFunc()
        if (this.param.touchClose) return true
    }

    setactive(active: boolean) {
        this.param.active = active
        this.updateView()
    }

    fadeIn() {
        this.node.active = true
        let [openDt] = [0.2, 0.15]
        let sprite = this.bgNode.getComponent(Sprite)
        let tarColor = this.param.color.clone()
        let startColor = tarColor.clone()
        startColor.a = 0
        sprite.color = startColor
        this.updateView()
        tween(sprite).to(openDt, { color: tarColor }).start().tag(1000)
    }

    fadeOut(callFunc?: Function) {
        this.node.active = true
        let [openDt] = [0.2, 0.15]
        let sprite = this.bgNode.getComponent(Sprite)
        let tarColor = this.param.color.clone()
        tarColor.a = 0
        tween(sprite)
            .to(openDt, { color: tarColor })
            .call(() => {
                this.onInputEvent({})
                callFunc && callFunc()
            })
            .start()
            .tag(1001)
    }

    setSiblingIndex(idx: number) {
        this.node.setSiblingIndex(idx)
    }

    protected onDestroy(): void {
        Tween.stopAllByTag(1000)
        Tween.stopAllByTag(1001)
        isValid(this.bgNode) && this.bgNode.destroy()
    }
}
