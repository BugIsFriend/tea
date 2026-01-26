/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:43:12
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:43:12
 * */
import { View, ViewState } from './ui/view'
import { Background } from './ui/background'
import { director, find, instantiate, Layers, Node, Prefab, UITransform, warn, Color, Vec2 } from 'cc'
import { BackgroudParam, UIAnimate } from './uitypes'
import { singleton } from './meta/class'
import { LoadCom } from './component/loadcom'

type Param = { asset: string | Prefab | Node; bundle?: string; tag?: string }

@singleton
export class UI {
    private uiViews: Array<View> = []

    // 公共背景，制作动画期间显示，动画结束之后隐藏，并且展示的弹框自己的bgView
    private background_0: Background = null
    private background_1: Background = null

    private color: Color = new Color(0, 0, 0, Math.floor(255 * 0.6))
    private defaultParam: BackgroudParam = new BackgroudParam({ color: this.color, active: true, touch: true })

    loadParam: Param

    get root() {
        return find('UI/view', tea.root)
    }
    /**
     * 首个场景调用下
     */
    init() {
        if (!this.background_0 ) {
            this.background_0 = this.createBackground(0)
            this.background_1 = this.createBackground(1)
        } else {
            this.background_0 = this.root.getChildByName('CommonBgView0').getComponent(Background)
            this.background_1 = this.root.getChildByName('CommonBgView1').getComponent(Background)
        }
        let closeTop = this.closeTop.bind(this)
        this.background_0.setTouchCloseFunc(closeTop)
        this.background_1.setTouchCloseFunc(closeTop)
    }

    createBackground(idx: number) {
        let canvas = find('Canvas', director.getScene())
        let size_canvas = canvas.getComponent(UITransform).contentSize
        let background = new Node().addComponent(Background)
        background.node.layer = Layers.BitMask.UI_2D
        background.node.name = 'CommonBgView' + idx
        background.node.active = false
        background.addComponent(UITransform)
        background.setParam({ active: false, touch: false, intercept: false, color: this.defaultParam.color })
        background.updateUITransform(size_canvas.clone())

        this.root.addChild(background.node)

        return background
    }

    async _load(loadParam: Param): Promise<View> {
        let { asset, tag } = loadParam
        let node: Node = null
        if (asset instanceof Node) {
            node = asset
        } else if (asset instanceof Prefab) {
            node = instantiate(asset)
        } else if (typeof asset == 'string') {
            let prefab = await LoadCom.asynload(asset) as Prefab
            if (!prefab) {
                throw new Error(`did't find prefab: ${asset}`)
            }
            node = instantiate(prefab) as Node
        }

        let viewcom = node.getComponent(View) || node.addComponent(View)
        viewcom.setCompletedFunc(this.handleViewAnimateCompleted.bind(this))
        viewcom.tag = tag || ''
        return viewcom
    }

    /**
     *  加载资源或者实例为节点
     * @param asset
     * @param bundle : 默认为 'resources'
     * @param tag
     * @returns
     */
    load(asset: string | Prefab | Node, tag?: string): UI {
        this.loadParam = { asset, tag }
        return this
    }

    /**
     * 先调用 load(param).show(param)
     * @param animate
     * @param closeCb
     * @param param
     */
    public async show(animate?: UIAnimate, closeCb?: Function, param?: BackgroudParam): Promise<View>

    public async show(view: View, closeCb?: Function, param?: BackgroudParam): Promise<View>

    public async show(view?: View | UIAnimate, closeCb?: Function, param?: BackgroudParam): Promise<View> {
        if (!view || typeof view == 'number') {
            let animate = view as number
            let _view = await ui._load(ui.loadParam)
            _view.animate = animate
            ui.show(_view, closeCb, param)
            ui.loadParam = null
        } else {
            if (closeCb) view.appendClosedCb(closeCb)
            if (this.getViewIdx(view) == -1) {
                view.node.active = true
                this.root.addChild(view.node) 
                this.uiViews.push(view)
            }
            let param0 = Object.assign(this.defaultParam, param || view.param || {})
            view.setBackgroundParam({ ...param0 })
            this.backgroundAnimate(true, view)
            view.show()
            return view
        }
    }

    setBackgroundParam(param: BackgroudParam) {
        this.background_0.setParam(param)
    }

    /**
     *  播放背景动画
     * @param show  显示或者不显示
     * @param curViewCom
     */
    public backgroundAnimate(show: boolean, viewcom: View) {
        if (show) {
            this.setBackgroundParam(viewcom.param)
            this.background_0.fadeIn()
            this.background_0.setSiblingIndex(this.uiViews.length - 1)
        } else {
            let prebg = this.background_0
            prebg.fadeOut(() => prebg.setParam({ active: false }))
            if (viewcom) {
                this.background_1.setSiblingIndex(this.uiViews.length - 1)
                this.background_1.setParam(viewcom.param)
                this.background_1.fadeIn()

                let temp = this.background_1
                this.background_1 = this.background_0
                this.background_0 = temp
            }
        }
    }

    /**
     * 打开和关闭播放完的回调
     * @param viewcom
     */
    public handleViewAnimateCompleted(viewcom: View) {
        if (viewcom.state == ViewState.Openged) {
        } else if (viewcom.state == ViewState.Closed) {
            // 1：关闭动作执行完毕，销毁该节点；
            viewcom.node.destroy()

            // 2：弹出下一个
            let view = this.getTop()
            if (view && view.state == ViewState.Hide) {
                ui.show(view, null, null)
            }
        }
    }

    public close(tag: string | View) {
        let idx = this.getViewIdx(tag)
        let view = this.uiViews[idx]
        if (view) {
            this.uiViews.splice(idx, 1)
            view.close()
            this.backgroundAnimate(false, this.getTop())
        }
    }

    public getTop() {
        return this.uiViews[this.uiViews.length - 1]
    }

    public closeTop() {
        if (this.uiViews.length > 0) {
            this.close(this.getTop())
        }
    }

    public getViewIdx(tag: string | View): number {
        for (let i = 0; i < this.uiViews.length; i++) {
            if (this.uiViews[i].tag == tag || this.uiViews[i] == tag) {
                return i
            }
        }
        return -1
    }
}

export const ui = new UI()
