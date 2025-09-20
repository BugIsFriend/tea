/**
 * @author myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified time: 2024-09-25 18:46:51
 */

import { loadAsync } from './load'
import { ViewState } from './ui/const'
import { View } from './ui/view'
import { BgView } from './ui/bg'
import { director, find, instantiate, js, Layers, Node, Prefab, UITransform, warn, Color } from 'cc'

export class UI {
    static _instance: UI = null
    static getInstance() {
        if (!UI._instance) {
            UI._instance = new UI()
        }
        return UI._instance
    }

    private _root: Node = null
    private uiViews: Array<View> = []

    private bgView: BgView = null // 公共背景，制作动画期间显示，动画结束之后隐藏，并且展示的弹框自己的bgView

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

            this.bgView = new Node().addComponent(BgView)
            this.bgView.node.name = 'CommonBgView'
            this.bgView.node.active = false
            this.bgView.node.layer = Layers.BitMask.UI_2D
            this.bgView.node.parent = this._root

            this.bgView.setParam(true, new Color(0, 0, 0, 0), false, false)
            this.bgView.updateUITransform(size_canvas.clone())
        }
    }

    /**
     *
     * @param tag: 用于标记view,用于获取ViewCom
     * @param asset  asset Path|Prefab|Node，则需要 bundle
     * @param bundle  则需要bundleName 默认 resources
     * @returns View 对象，负责管理该弹框, 还没有加入队列中；
     */
    async show(viewInfo: { asset: string | Prefab | Node; bundle?: string; tag?: string; closeCb?: Function }): Promise<View> {
        let { asset, bundle = 'resources', tag, closeCb } = viewInfo

        if (!asset) return null

        let node: Node = null
        if (asset instanceof Node) {
            node = asset
        } else if (asset instanceof Prefab) {
            node = instantiate(asset)
        } else if (typeof asset == 'string') {
            tag = tag || asset.split('/')[asset.split('/').length - 1]
            let prefab = (await loadAsync(asset, bundle)) as any
            if (!prefab) {
                warn(`did't find prefab: ${asset}`)
                return null
            }
            node = instantiate(prefab)
        }

        let viewcom = node.getComponent(View) || node.addComponent(View)
        // 这里没有加队里，因为异步的所以游戏弹框先调用可能后弹出；
        this.initViewCom(viewcom, tag, closeCb)
        return viewcom
    }

    initViewCom(viewcom: View, tag: string, closeCb: Function) {
        viewcom.tag = tag || ''
        closeCb && viewcom.appendClosedCb(closeCb)
        this.handleShow(viewcom)
    }

    public handleShow(viewcom: View) {
        viewcom.node.active = true
        this._root.addChild(viewcom.node)
        this.uiViews.push(viewcom)

        viewcom.show()

        this.showBgAni(true, viewcom)
    }

    /**
     *  这里可能存在两个 BgView
     * @param show
     * @param curViewCom
     */
    public showBgAni(show: boolean, curViewCom: View) {
        // if (curViewCom) {
        //     let { blockTouch, actived, color, touch } = curViewCom
        //     this.bgView.setParam(actived, color, blockTouch, touch)
        //     this.bgView.node.setSiblingIndex(this.uiViews.length - 1)
        //     curViewCom.getBgView()?.setParam(false, Color.TRANSPARENT.clone(), false, false)
        // }

        // show ? this.bgView.node.setSiblingIndex(this.uiViews.length - 1) : this.bgView.node.setSiblingIndex(this.uiViews.length - 2)

        let secondView = this.uiViews[this.uiViews.length - 2]
        if (!secondView) {
            show ? this.bgView.fadeIn() : this.bgView.fadeOut()
        }
    }

    /**
     * 打开和关闭播放完的回调
     * @param viewcom
     */
    public handleActCompeleted(viewcom: View) {
        if (viewcom.state == ViewState.Openged) {
            // this.bgView.touch = viewcom.touch
        } else if (viewcom.state == ViewState.Closed) {
            viewcom.node.destroy()
        }
    }

    public closeTop() {
        if (this.uiViews.length > 0) {
            this.close(this.uiViews[this.uiViews.length - 1])
        }
    }

    public close(tag: string | View) {
        let idx = this.getViewComByIdx(tag)
        let viewComp = this.uiViews[idx]
        if (viewComp) {
            this.showBgAni(false, this.uiViews[idx - 1])
            this.uiViews.splice(idx, 1)
            viewComp.closeAction()
        } else {
            warn('没有找到目标弹框')
        }
    }

    public getViewComByIdx(tag: string | View): number {
        for (let i = 0; i < this.uiViews.length; i++) {
            if (this.uiViews[i].tag == tag || this.uiViews[i] == tag) {
                return i
            }
        }
        return -1
    }
}

export const ui = UI.getInstance()
