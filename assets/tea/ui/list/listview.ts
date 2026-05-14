/**
 * author: myerse.lee
 * created: 2024-09-25 17:10:15
 */
import {_decorator, Sprite, Node, UITransform, Prefab, Enum, Graphics, Mask, instantiate, Vec3, Size, SpriteFrame, EventTouch, tween, Label, EventHandler, Pool, v2, v3, Widget, CCInteger, Component, lerp, math, error } from 'cc'

import { Unit } from '../../unit'
import { ItemParam, MoveDirection, ItemLayout } from './listview-item'
import { EDITOR } from 'cc/env'
import { Background } from '../background'
const { ccclass, property, executeInEditMode, requireComponent } = _decorator

const FlowDirection = Enum({ Vertical: 0, Horizontal: 1 })

const Group0 = {
    name: 'RowColumn',
    id: '1'
}

// 布局组
const GroupPadding = {
    name: 'Border',
    id: '2'
}

// 事件组
const GroupEvent = {
    name: 'Event',
    id: '3'
}

@ccclass('ListView')
@requireComponent(UITransform)
@executeInEditMode()
export class ListView extends Unit {
    @property({ type: CCInteger, group: { ...GroupPadding }, displayOrder: 2 }) left: number = 0
    @property({ type: CCInteger, group: { ...GroupPadding }, displayOrder: 2 }) right: number = 0
    @property({ type: CCInteger, group: { ...GroupPadding }, displayOrder: 2 }) top: number = 0
    @property({ type: CCInteger, group: { ...GroupPadding }, displayOrder: 2 }) bottom: number = 0

    @property({ type: FlowDirection, group: { ...Group0 } }) flowDirection: number = 0
    @property({ type: Prefab, group: { ...Group0 } }) ItemPrefab: Prefab

    @property({ type: SpriteFrame, group: { ...Group0 } }) background: SpriteFrame = null
    @property({ type: ItemParam, group: { ...Group0 } }) itemParam: ItemParam = new ItemParam()

    @property({ type: Node, displayOrder: 5, visible: false }) bgNode: Node // 背景图片
    @property({ type: Node, displayOrder: 5, visible: false }) view: Node // 显示颜色
    @property({ type: Node, displayOrder: 5, visible: false }) content: Node // Item容器

    cursor = { min: 0, max: 0 }
    pageRenderSize: number = 0 // 一屏能渲染的item数量

    // @property({ type: EventHandler, group: { ...GroupEvent }, tooltip: '点击某个Item:(node,idx,data)=>void' })
    // onClickItem: EventHandler = new EventHandler()

    @property({ type: EventHandler, group: { ...GroupEvent }, tooltip: '点击Item回调函数:(node,idx,data)=>void' })
    onClickItem: EventHandler = new EventHandler()

    @property({ type: EventHandler, group: { ...GroupEvent }, tooltip: '渲染到某个Item回调函数:(node,idx,data)=>void' })
    onRenderItem: EventHandler = new EventHandler()

    @property({ type: EventHandler, group: { ...GroupEvent }, tooltip: '渲染到第一个Item回调函数:' })
    onRenderFirstItem: EventHandler = new EventHandler()

    @property({ type: EventHandler, group: { ...GroupEvent }, tooltip: '渲染到最后Item回调函数:' })
    onRenderLastItem: EventHandler = new EventHandler()

    // @property
    itemPool: Pool<Node> = null

    touch_time: number

    originStartPos: Vec3 = null // content 初始位置
    moveDir: MoveDirection = MoveDirection.None // 手指移动方向

    // 自动滚动对象  enabled: 开关   direction: 滑动方向   total_s: 可滑动总位移   dt_s: 已经移动位移   s_pos: 位移开始的位置 }
    scrollObj: {
        maxLen: number
        time?: number
        time_scale?: number // 时间缩放
        speed?: number // 当前速度
        speed_c?: number // 初始速度
        enabled?: boolean
        direction?: MoveDirection
        total_s?: number
        dt_s?: number
        s_pos?: number
        tmpX?: number
        tmpY?: number
    }

    // 自动回弹
    bounce = {
        enabled: false,
        offset: 100,
        curPos: v3(0, 0, 0),
        tarPos: v3(0, 0, 0)
    }

    itemStartInfo = {
        x: 0, // item起始坐标
        y: 0, // item起始坐标
        height: 0,
        width: 0
    }

    tempVec: Vec3 = new Vec3() //

    set dataList(dataList: any[]) {
        this.itemParam.dataList = dataList
        this.itemParam.count = dataList.length
        this.updateView()
    }

    get dataList() {
        return this.itemParam.dataList
    }

    // testcode
    handlItemRender(item: Node, idx: number, data: any) {
        item.getComponentInChildren(Label).string = 'Button ' + idx
        tween(item)
            .to(0.3, { scale: new Vec3(1.5, 1.5, 1.5) })
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .start()
        item.getComponentInChildren(Label).string
    }

    private callEventHandler(event: EventHandler, params: any[]) {
        if (event && event.target && event.handler) event.emit(params)
    }

    private _renderItem(item: Node, idx: number, scroll: boolean = false) {
        if (scroll) {
            if (idx == 0) {
                this.callEventHandler(this.onRenderFirstItem, [item, idx, this.dataList[idx]])
            } else if (idx == this.dataList.length - 1) {
                this.callEventHandler(this.onRenderLastItem, [item, idx, this.dataList[idx]])
            }
        }
        this.callEventHandler(this.onRenderItem, [item, idx, this.dataList[idx]])
    }

    initItem() {
        if (this.ItemPrefab && !this.itemPool) {
            this.itemPool = new Pool(() => instantiate(this.ItemPrefab), 5)
            let node = this.itemPool.alloc()

            if (node.getComponent(UITransform)) {
                let size = node.getComponent(UITransform).contentSize
                this.itemStartInfo.width = size.width
                this.itemStartInfo.height = size.height
            } else { 
                error('list view item root  没有UITransform 组件')
            }
        }
    }

    protected onLoad(): void {
        this.scrollObj = { maxLen: 300, time_scale: 0.5 }
        this.itemParam.init()
        this.initItem()
        this.initView()
        this.initBg()
        this.updateView()
        this.onTouch()

        if (EDITOR) { 
            this.node.on(Node.EventType.SIZE_CHANGED, this.updateView, this)
        } 
    }

    private initBg() {
        this.bgNode = this.node.getChildByName('#bgNode')
        if (!this.bgNode) {
            this.bgNode = new Node('#bgNode')
            this.bgNode.layer = this.node.layer
            this.bgNode.addComponent(UITransform)
            this.bgNode.addComponent(Sprite)
            this.node.addChild(this.bgNode)
            this.bgNode.setSiblingIndex(0)
        }
    }

    private initView() {
        if (!this.view) {
            this.view = new Node('view')
            this.node.addChild(this.view)
            this.view.addComponent(UITransform)
            this.view.layer = this.node.layer

            this.view.addComponent(Widget)
            this.view.addComponent(Graphics)
            let mask = this.view.addComponent(Mask)
            mask.type = Mask.Type.GRAPHICS_RECT

            this.content = new Node('content')
            this.view.addChild(this.content)

            this.content.layer = this.node.layer
            this.content.addComponent(UITransform)
        }
    }

    updateView() {
        let size = this.gain(UITransform).contentSize
        if (this.bgNode) {
            this.bgNode.getComponent(UITransform).setContentSize(size.clone())
            this.bgNode.getComponent(Sprite).spriteFrame = this.background
        }

        size = new Size(size.width - this.left - this.right, size.height - this.top - this.bottom)

        if (this.view) {
            let posx = (this.left - this.right) / 2
            let posy = (this.top - this.bottom) / 2
            this.view.getComponent(UITransform).setContentSize(size.clone())
            this.view.position = new Vec3(posx, posy, 0)
        }

        if (this.content) {
            this.content.position = v3(-size.width / 2, size.height / 2, 0)
            let uitransform = this.content.getComponent(UITransform)
            uitransform.setContentSize(size.clone())
            uitransform.setAnchorPoint(v2(0, 1))
            this._showItems()
        }
    }

    // 更新contentSize
    updateContentSize(itemSize: Size) {
        if (this.content) {
            let uitransform = this.content.getComponent(UITransform)
            let v_size = this.view.getComponent(UITransform).contentSize.clone()
            let size = uitransform.contentSize.clone()
            let { gap, left = 0, right, top, bottom, dataList } = this.itemParam
            if (this.flowDirection === FlowDirection.Vertical) {
                let item_len = itemSize.height + gap
                size.height = Math.max(dataList.length * item_len - gap + top + bottom, v_size.height)
                this.pageRenderSize = (v_size.height - top) / item_len
            } else {
                let item_len = itemSize.width + gap
                size.width = Math.max(dataList.length * item_len - gap + left + right, v_size.width)
                this.pageRenderSize = (v_size.width - left) / item_len
            }

            uitransform.setContentSize(size)
            this.pageRenderSize = Math.ceil(this.pageRenderSize)
            this.cursor.max = this.pageRenderSize
            // log('this.pageRenderSize', this.pageRenderSize)
        }
    }

    /**
     * 计算item的位置
     * @param idx
     * @returns
     */
    private _calculateItemPos(idx: number) {
        let startSize = this.itemStartInfo
        let { gap } = this.itemParam

        let viewSize = this.view.getComponent(UITransform).contentSize
        if (this.flowDirection === FlowDirection.Vertical) {
            let x = 0
            if (this.itemParam.layout == ItemLayout.Center) x = viewSize.width / 2
            else if (this.itemParam.layout == ItemLayout.Left) x = startSize.width / 2
            else if (this.itemParam.layout == ItemLayout.Right) x = viewSize.width - startSize.width / 2

            return new Vec3(x, startSize.y - idx * (gap + startSize.height) - startSize.height / 2, 0)
        } else if (this.flowDirection === FlowDirection.Horizontal) {
            let y = 0
            if (this.itemParam.layout == ItemLayout.Center) y = -viewSize.height / 2
            else if (this.itemParam.layout == ItemLayout.Top) y = -startSize.height / 2
            else if (this.itemParam.layout == ItemLayout.Bottom) y = -viewSize.height + startSize.height / 2

            return new Vec3(startSize.x + idx * (gap + startSize.width), y, 0)
        }
    }

    _showItems() {
        let itemSize = new Size(this.itemStartInfo.width, this.itemStartInfo.height)
        this.updateContentSize(itemSize)

        if (this.flowDirection === FlowDirection.Vertical) {
            this.itemStartInfo.x = itemSize.width / 2
        } else if (this.flowDirection === FlowDirection.Horizontal) {
            this.itemStartInfo.x = itemSize.width / 2
            this.itemStartInfo.y = -itemSize.height / 2
        }

        let { dataList } = this.itemParam
        if (dataList.length > 0 && this.ItemPrefab) {
            this.itemPool.freeArray(this.content.children)
            this.content.removeAllChildren()
            let min = Math.min(dataList.length, this.cursor.max)
            for (let i = 0; i < min; i++) {
                let item = this.createItem(i)
                this._renderItem(item, i)
            }
        } else {
            this.content.removeAllChildren()
        }
    }

    getItemByTag(tag: number) {
        //@ts-ignore
        let items = this.content.children.filter((item) => item.tag == tag)
        items.length > 1 && items.forEach((item, idx) => idx >= 1 && item.removeFromParent())
        return items[0]
    }

    createItem(idx: number) {
        let item = this.itemPool.alloc()
        //@ts-ignore
        item.tag = idx
        item.parent = this.content
        let pos = this._calculateItemPos(idx)
        item.position = pos
        return item
    }

    onTouch() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this)
    }

    onTouchStart(event: EventTouch) {
        this.touch_time = Date.now()
        if (this.scrollObj.enabled) {
            this.scrollObj.enabled = false
        }
    }

    updateRenderItem(curr_s: number) {
        //  跟偏移位移计算出，偏移到第几个item;
        let { width, height } = this.itemStartInfo
        let [offset_idx, minOffset] = [0, 2]

        let [new_max, new_min, change] = [0, 0, 0, 0]
        if (this.moveDir == MoveDirection.Up || this.moveDir == MoveDirection.Left) {
            let render_width = this.flowDirection === FlowDirection.Vertical ? height : width
            offset_idx = Math.ceil(Math.abs(curr_s) / (this.itemParam.gap + render_width)) + 1
            new_max = this.pageRenderSize + offset_idx
            new_max = Math.min(new_max, this.itemParam.dataList.length)

            let _min = Math.max(0, new_max - this.pageRenderSize - minOffset)
            new_min = _min
            if (this.cursor.max != new_max) {
                change = 1
                this.cursor.min = _min
                this.cursor.max = new_max
            }
        } else if (this.moveDir == MoveDirection.Down || this.moveDir == MoveDirection.Right) {
            let render_width = this.flowDirection === FlowDirection.Vertical ? height : width
            offset_idx = Math.floor(Math.abs(curr_s) / (this.itemParam.gap + render_width))
            new_max = this.pageRenderSize + offset_idx
            new_max = Math.min(new_max, this.itemParam.dataList.length)

            let _min = Math.max(0, new_max - this.pageRenderSize)
            new_min = _min
            if (this.cursor.max != new_max) {
                change = 1
                this.cursor.max = new_max
                this.cursor.min = new_max - this.pageRenderSize
            }
        }

        // log('updateRenderItem  ', new_min, new_max, curr_s)
        if (change) {
            // log(tip)
            this.content.children.forEach((child) => {
                // @ts-ignore
                let { tag } = child
                if (tag < new_min || tag > new_max) {
                    child.removeFromParent()
                    this.itemPool.free(child)
                }
            })
            // log('ssss11111111  s ', this.content.children.length)
            for (let i = new_min; i < new_max; i++) {
                let item = this.getItemByTag(i)
                if (!item || i > this.cursor.max) {
                    item = this.createItem(i)
                    this._renderItem(item, i)
                }
            }
        }
    }

    autoScrollEnabled(enabled: boolean, direction?: number, s_pos?: number, total_s?: number) {
        this.scrollObj.enabled = enabled
        if (enabled) {
            this.scrollObj.enabled = true // 开启自动滑动
            this.scrollObj.direction = direction // 滑动方向
            this.scrollObj.s_pos = s_pos
            this.scrollObj.total_s = total_s // 可滑动总位移
        }
    }

    setBonceEnabled(enabled: boolean, tarPos: Vec3) {
        this.bounce.enabled = enabled
        if (enabled) {
            this.autoScrollEnabled(false)
            this.bounce.curPos = this.content.position
            this.bounce.tarPos = tarPos
            tween(this.content)
                .to(0.2, { position: tarPos })
                .call(() => {
                    this.bounce.enabled = false
                })
                .start()
        }
    }

    onTouchMove(event: EventTouch) {
        if (this.itemParam.dataList.length == 0) return
        if (this.content) {
            if (this.content) {
                this.calculateContentPos(event.getDeltaX(), event.getDeltaY(), event, false)
            }
        }
    }

    onTouchCancel(event: EventTouch) {
        if (this.itemParam.dataList.length == 0) return
        if (this.content) {
            this.calculateContentPos(event.getDeltaX(), event.getDeltaY(), event, true)
        }
    }

    onTouchEnded(event: EventTouch) {
        if (this.itemParam.dataList.length == 0) return
        if (this.content) {
            let dx = event.getLocationX() - event.getPreviousLocation().x
            let dy = event.getLocationY() - event.getPreviousLocation().y
            this.calculateContentPos(dx, dy, event, true)
        }
    }

    calculateContentPos(dx: number, dy: number, endEvent?: EventTouch, isTouchEnd: boolean = false) {
        // let dirction = MoveDirection.None
        let viewSize = this.view.getComponent(UITransform).contentSize
        let contentSize = this.content.getComponent(UITransform).contentSize
        let [s_pos, total_s, dt_s] = [0, 0, 0]

        if (this.flowDirection === FlowDirection.Vertical) {
            s_pos = viewSize.height / 2
            dt_s = this.content.position.y - s_pos // 已经移动位移
            total_s = contentSize.height - viewSize.height // 总移动位移

            if (dy != 0) this.moveDir = dy > 0 ? MoveDirection.Up : MoveDirection.Down

            this._updateContentPos(total_s, dt_s, dy, s_pos, isTouchEnd, endEvent)
        } else if (this.flowDirection === FlowDirection.Horizontal) {
            s_pos = -viewSize.width / 2
            dt_s = this.content.position.x - s_pos // 已经移动位移`
            total_s = contentSize.width - viewSize.width // 总移动位移

            if (dx != 0) this.moveDir = dx > 0 ? MoveDirection.Right : MoveDirection.Left

            this._updateContentPos(total_s, dt_s, dx, s_pos, isTouchEnd, endEvent)
        }
    }

    /**
     * @param dirction 移动方向
     * @param total_s 距离起点的最大位移
     * @param curr_s 当前距离起点的位移
     * @param ds  当前位移
     * @param s_pos  起始坐标
     * @returns
     */
    _updateContentPos(total_s: number, curr_s: number, ds: number, s_pos: number, touch_end: boolean = false, endEvent?: EventTouch) {
        if (this.bounce.enabled) return
        // console.log('updateContentPos  ', dirction, total_s.toFixed(2), curr_s.toFixed(2), ds.toFixed(2))

        let border = false // 超过边界
        let border_max = false // 超过最大边界

        switch (this.moveDir) {
            case MoveDirection.Up:
                border = total_s - curr_s <= 0
                border_max = total_s - curr_s < -this.bounce.offset

                this.tempVec.set(this.content.position.x, s_pos + total_s, 0)

                this.originStartPos = this.tempVec
                if (!border_max) {
                    this.content.position = this.content.position.add3f(0, ds, 0)
                }
                break
            case MoveDirection.Down:
                border = curr_s < 0
                border_max = curr_s < -this.bounce.offset
                this.tempVec.set(this.content.position.x, s_pos, 0)
                this.originStartPos = this.tempVec
                if (curr_s > -this.bounce.offset) {
                    this.content.position = this.content.position.add3f(0, ds, 0)
                }
                break
            case MoveDirection.Left:
                border = total_s + curr_s < 0
                border_max = total_s + curr_s <= -this.bounce.offset
                this.tempVec.set(-total_s + s_pos, this.content.position.y, 0)
                this.originStartPos = this.tempVec

                if (total_s + curr_s > -this.bounce.offset) {
                    this.content.position = this.content.position.add3f(ds, 0, 0)
                }
                break
            case MoveDirection.Right:
                border = curr_s > 0
                border_max = curr_s > -this.bounce.offset
                this.tempVec.set(s_pos, this.content.position.y, 0)
                this.originStartPos = this.tempVec
                if (curr_s < this.bounce.offset) {
                    this.content.position = this.content.position.add3f(ds, 0, 0)
                }
                break
        }

        // console.log('ssss11    ', total_s - curr_s, border, this.moveDir, touch_end)

        if (touch_end) {
            if (border_max || border) {
                this.setBonceEnabled(true, this.originStartPos)
            } else if (!this.scrollObj.enabled) {
                let len_sqr = endEvent.getLocation().subtract(endEvent.getStartLocation()).length()
                // 大于 35 像素开启自动滑动
                if (len_sqr > 35) {
                    this.scrollObj.time = 0
                    let speed = len_sqr / ((Date.now() - this.touch_time) / 1000)
                    this.scrollObj.speed = math.clamp(speed, 200, 550)
                    this.scrollObj.speed_c = this.scrollObj.speed
                    this.autoScrollEnabled(true, this.moveDir, s_pos, total_s)
                }
            }
        }

        if (!(border_max || border)) this.updateRenderItem(curr_s)
    }

    protected update(dt: number): void {
        if (!this.bounce.enabled && this.scrollObj.enabled) {
            let ds = this.scrollObj.speed * dt
            this.scrollObj.time += dt * this.scrollObj.time_scale
            this.scrollObj.speed = lerp(this.scrollObj.speed_c, 0, this.scrollObj.time)
            if (this.scrollObj.speed > 0) {
                let dirction = this.scrollObj.direction
                let s_pos = this.scrollObj.s_pos
                let total_s = this.scrollObj.total_s
                let curr_s = (this.flowDirection === FlowDirection.Vertical ? this.content.position.y : this.content.position.x) - s_pos
                if (dirction == MoveDirection.Down || dirction == MoveDirection.Left) ds *= -1
                this.moveDir = dirction
                this._updateContentPos(total_s, curr_s, ds, s_pos, true)
            }
        }
    }

    protected onDestroy(): void {
        this.view?.isValid && this.view.destroy()
        this.bgNode?.isValid && this.bgNode.destroy()
        this.itemPool?.tryShrink()
    }
    
}
