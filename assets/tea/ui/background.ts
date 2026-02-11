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
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    v2,
    warn,
    tween,
    Size,
    Tween,
    Input,
    EventHandler
} from 'cc'
import { EDITOR } from 'cc/env'
import { BackgroudParam } from '../uitypes'
import { Unit } from '../unit'
const { ccclass, property, executionOrder, executeInEditMode } = _decorator

@ccclass('Background')
@executionOrder(-1)
@executeInEditMode
export class Background extends Unit {
    @property(BackgroudParam) param: BackgroudParam = new BackgroudParam({})

    @property({ type: [EventHandler], tooltip: '显示时: 回调xx组件的xx方法' })
    touchHandler: EventHandler[] = []

    private _onTouch: boolean = false

    public tag: string // 标记当前ViewTag

    public bgNode: Node
    public bgUnit: Unit

    protected onLoad(): void {
        this.addBgNode()
    }

    updateUITransform(size: Size) {
        if (!this.bgNode) this.addBgNode()

        let vnode_Trans = this.gain(UITransform)
        let uiTransform = this.bgUnit.gain(UITransform)

        uiTransform.setAnchorPoint(v2(0.5, 0.5))
        uiTransform.setContentSize(size.clone())
    
        vnode_Trans.setContentSize(size.clone())
    }

    addBgNode() {
        // 添加默认背景颜色
        let _nodename ='#bgNode'
        let bgNode =  this.node.getChildByName(_nodename)

        if (!bgNode) {
            // 添加背景节点
            this.bgNode = new Node(_nodename)
            this.bgUnit = this.bgNode.addComponent(Unit)
            this.node.addChild(this.bgNode)
            this.bgNode.setSiblingIndex(0)
            this.bgNode.active = this.param.active
            this.bgUnit.node.layer = this.node.layer

            // 背景 给节点添加 UITransform
            let vnode_Trans = this.gain(UITransform)
            let uiTransform = this.bgUnit.gain(UITransform)
            uiTransform.setAnchorPoint(v2(0.5, 0.5))
            uiTransform.setContentSize(vnode_Trans.contentSize.clone())

            // 添加组件
            this.bgNode.addComponent(Sprite)
            this.bgNode.addComponent(BlockInputEvents)

            let bgSprite = this.bgNode.getComponent(Sprite)
            assetManager.loadAny('7d8f9b89-4fd1-4c9f-a3ab-38ec7cded7ca@f9941', (err, spriteFrame: SpriteFrame) => {
                if (!err) { 
                    bgSprite.spriteFrame = spriteFrame
                }
            })
            this.updateView()
        } else { 
            this.bgNode = bgNode
            this.bgNode.active = true
        }
    }

    onInputEvent(param: BackgroudParam) {
        this.addBgNode()
        let { touch, intercept, touchClose } = param
        let touchBlock = this.bgNode.getComponent(BlockInputEvents)
        if (this._onTouch !== touch || touchClose) {
            if (!touch) this.node.off(Node.EventType.TOUCH_START, this.onTouch, this)
            if (touch || touchClose) {
                this.node.on(Input.EventType.TOUCH_END, this.onTouch, this)
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
        this.bgNode.isValid && this.bgNode.destroy()
    }
}
