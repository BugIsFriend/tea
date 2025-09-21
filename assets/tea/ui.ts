/**
 * @author myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified time: 2024-09-25 18:46:51
 */

import { loadAsync } from './load'
import { BackgroudParam, ViewState } from './ui/const'
import { View } from './ui/view'
import { Background } from './ui/background'
import { director, find, instantiate, Layers, Node, Prefab, UITransform, warn, Color, Size } from 'cc'

interface IShow {
    show: (param?: BackgroudParam, closeCB?: Function) => void
}

export class UI {
    static _instance: UI = null
    static getInstance() {
        if (!UI._instance) UI._instance = new UI()
        return UI._instance
    }

    private _root: Node = null
    private uiViews: Array<View> = []

    // 公共背景，制作动画期间显示，动画结束之后隐藏，并且展示的弹框自己的bgView
    private background_0: Background = null
    private background_1: Background = null

    private color: Color = new Color(0, 0, 0, Math.floor(255 * 0.6))
    private defaultParam: BackgroudParam = new BackgroudParam({ color: this.color, active: true, touch: true })

    /**
     * 切换场景，要把所有的UI 都删除
     */
    onSwitchScene() {
        this._root = null
        this.init()
    }

    /**
     * 首个场景调用下
     */
    init() {
        let tip = ''
        if (!director.getScene()) tip = 'no running scene'
        if (!find('Canvas', director.getScene())) tip = `the scene: ${director.getScene().name},  no Canvas node `

        !!tip && warn(tip)

        if (!!tip) return

        let canvas = find('Canvas', director.getScene())

        this._root = find('_root', canvas)

        if (!this._root) {
            this.uiViews = []
            this._root = new Node('_root')
            canvas.addChild(this._root)
            let uitransfor = this._root.addComponent(UITransform)
            this._root.layer = Layers.BitMask.UI_2D
            let size_canvas = canvas.getComponent(UITransform).contentSize
            this._root.getComponent(UITransform).setContentSize(size_canvas)
            uitransfor.setContentSize(canvas.getComponent(UITransform).contentSize)

            this.background_0 = this.createBackground(0)
            this.background_1 = this.createBackground(1)
        } else {
            this.background_0 = this._root.getChildByName('CommonBgView0').getComponent(Background)
            this.background_1 = this._root.getChildByName('CommonBgView1').getComponent(Background)
        }
    }

    createBackground(idx: number) {
        let canvas = find('Canvas', director.getScene())
        let size_canvas = canvas.getComponent(UITransform).contentSize
        let background = new Node().addComponent(Background)
        background.node.layer = Layers.BitMask.UI_2D
        background.node.name = 'CommonBgView' + idx
        background.node.active = false
        background.setParam({ active: false, touch: false, intercept: false, color: this.defaultParam.color })
        background.updateUITransform(size_canvas.clone())

        this._root.addChild(background.node)

        return background
    }

    async _load(asset: string | Prefab | Node, bundle?: string, tag?: string): Promise<View> {
        if (!asset) return null

        let node: Node = null
        if (asset instanceof Node) {
            node = asset
        } else if (asset instanceof Prefab) {
            node = instantiate(asset)
        } else if (typeof asset == 'string') {
            tag = tag || asset.split('/')[asset.split('/').length - 1]
            let prefab = (await loadAsync(asset, bundle || 'resources')) as any
            if (!prefab) {
                throw new Error(`did't find prefab: ${asset}`)
            }
            node = instantiate(prefab)
        }
        let viewcom = node.getComponent(View) || node.addComponent(View)
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
    load(asset: string | Prefab | Node, bundle?: string, tag?: string): IShow {
        return {
            show: (param?: BackgroudParam, closeCb?: Function) => {
                {
                    ui._load(asset, bundle, tag).then((view) => ui.show({ view, param, closeCb }))
                }
            }
        }
    }

    setBackgroundParam(param: BackgroudParam) {
        this.background_0.setParam(param)
    }

    public show(showParam: { view?: View; closeCb?: Function; param?: BackgroudParam }) {
        let { closeCb, view, param } = showParam
        closeCb && view.appendClosedCb(closeCb)

        if (this.getViewIdx(view) == -1) {
            view.node.active = true
            this._root.addChild(view.node)
            this.uiViews.push(view)
        }

        let param0 = Object.assign(this.defaultParam, param || {})

        view.setBackgroundParam({ ...param0 })
        this.playBackgroundAction(true, view)
        view.show()
    }

    /**
     *  这里可能存在两个 BgView
     * @param show
     * @param curViewCom
     */
    public playBackgroundAction(show: boolean, curView: View) {
        if (show) {
            this.setBackgroundParam(curView.param)
            this.background_0.fadeIn()
            this.background_0.setSiblingIndex(this.uiViews.length - 1)
        } else {
            let prebg = this.background_0
            prebg.fadeOut(() => prebg.setParam({ active: false }))
            if (curView) {
                this.background_1.setSiblingIndex(this.uiViews.length - 1)
                this.background_1.setParam(curView.param)
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
    public handleActionFinish(viewcom: View) {
        if (viewcom.state == ViewState.Openged) {
        } else if (viewcom.state == ViewState.Closed) {
            viewcom.node.destroy()

            // 最顶层关闭，弹出下一个
            let view = this.getTop()
            if (view && view.state == ViewState.Hide) {
                ui.show({ view, param: view.param })
            }
        }
    }

    public close(tag: string | View) {
        let idx = this.getViewIdx(tag)
        let view = this.uiViews[idx]
        if (view) {
            this.uiViews.splice(idx, 1)
            view.closeAction()
            this.playBackgroundAction(false, this.getTop())
        }
    }

    getTop() {
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

export const ui = UI.getInstance()
