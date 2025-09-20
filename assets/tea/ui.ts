/**
 * @author myerse.lee
 * @Date: 2024-09-25 17:10:15
 * @Last Modified time: 2024-09-25 18:46:51
 */

import { loadAsync } from './load'
import { BackgroudParam, ViewState } from './ui/const'
import { View } from './ui/view'
import { Background } from './ui/background'
import { director, find, instantiate, Layers, Node, Prefab, UITransform, warn, Color } from 'cc'

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

    private background: Background = null // 公共背景，制作动画期间显示，动画结束之后隐藏，并且展示的弹框自己的bgView

    private bgColor: Color = new Color(255, 0, 0, Math.floor(255 * 0.6))

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

            this.background = new Node().addComponent(Background)
            this.background.node.layer = Layers.BitMask.UI_2D
            this._root.addChild(this.background.node)
            this.background.node.name = 'CommonBgView'
            this.background.node.active = false

            this.background.setParam({ actived: true, toucheable: true, intercept: true, color: this.bgColor })
            this.background.updateUITransform(size_canvas.clone())
        } else {
            this.background = this._root.getChildByName('CommonBgView').getComponent(Background)
        }
    }

    /**
     *  加载资源或者实例为节点
     * @param asset
     * @param bundle : 默认为 'resources'
     * @param tag
     * @returns
     */
    async load(asset: string | Prefab | Node, bundle?: string, tag?: string) {
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

        return {
            show: (param?: { param?: BackgroudParam; closeCB?: Function }) => ui.handleShow({ viewcom, ...param })
        }
    }

    setBackgroundParam(param: BackgroudParam) {
        this.background.setParam(param)
    }

    public handleShow(showParam: { viewcom?: View; closeCb?: Function; param?: BackgroudParam }) {
        let { closeCb, viewcom, param } = showParam
        closeCb && viewcom.appendClosedCb(closeCb)
        viewcom.node.active = true
        this._root.addChild(viewcom.node)
        this.uiViews.push(viewcom)

        viewcom.setBackgroundParam({ ...param })
        this.showBgAni(true, viewcom)
        viewcom.show()
    }

    /**
     *  这里可能存在两个 BgView
     * @param show
     * @param curViewCom
     */
    public showBgAni(show: boolean, curViewCom: View) {
        if (curViewCom) {
            curViewCom.background = this.background
            this.setBackgroundParam(curViewCom.backgroundParam)
            this.background.node.setSiblingIndex(this.uiViews.length - 1)
        }

        show ? this.background.node.setSiblingIndex(this.uiViews.length - 1) : this.background.node.setSiblingIndex(this.uiViews.length - 2)

        let secondView = this.uiViews[this.uiViews.length - 2]
        if (!secondView) {
            show ? this.background.fadeIn() : this.background.fadeOut()
        }
    }

    /**
     * 打开和关闭播放完的回调
     * @param viewcom
     */
    public handleActCompeleted(viewcom: View) {
        if (viewcom.state == ViewState.Openged) {
            // this.background.touch = viewcom.touch
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
