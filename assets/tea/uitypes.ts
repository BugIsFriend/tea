import { _decorator, Color, CCBoolean, ITweenOption, Node, Tween, tween, UITransform, v3, Vec3 } from 'cc'
const { ccclass, property } = _decorator
import { ui } from './ui'
import { enum2Map } from './tools'
const _dt = 0.2

var Animates = {
    none: function (node: Node, show: boolean) {
        return tween(node)
    },

    scale: function (node: Node, show: boolean, dt: number = _dt): Tween<any> {
        let [big, small] = show ? [1.2, 1] : [1.2, 0]
        show && node.setScale(Vec3.ZERO)
        return tween(node)
            .to(dt, { scale: v3(big, big, big) }, ease)
            .to(dt, { scale: v3(small, small, small) })
    },

    bottom: function (node: Node, show: boolean, dt: number = _dt) {
        let y = -ui.root.getComponent(UITransform).contentSize.height
        let tPos = new Vec3(0, y, 0)
        if (show) {
            node.setPosition(new Vec3(0, y, 0))
            tPos = new Vec3(0, 0, 0)
        }
        return tween(node).to(dt, { position: tPos }, ease)
    },

    top: function (node: Node, show: boolean, dt: number = _dt) {
        let y = ui.root.getComponent(UITransform).contentSize.height
        let tPos = new Vec3(0, y, 0)
        if (show) {
            node.setPosition(new Vec3(0, y, 0))
            tPos = new Vec3(0, 0, 0)
        }
        return tween(node).to(dt, { position: tPos }, ease)
    },

    left: function (node: Node, show: boolean, dt: number = _dt) {
        let l = -ui.root.getComponent(UITransform).contentSize.width
        let tPos = new Vec3(l, 0, 0)
        if (show) {
            node.setPosition(tPos)
            tPos = new Vec3(0, 0, 0)
        }
        return tween(node).to(dt, { position: tPos }, ease)
    },

    right: function (node: Node, show: boolean, dt: number = _dt) {
        let r = ui.root.getComponent(UITransform).contentSize.width
        let tPos = new Vec3(r, 0, 0)
        if (show) {
            node.setPosition(tPos)
            tPos = v3(0, 0, 0)
        }
        return tween(node).to(dt, { position: tPos }, ease)
    }
}

export enum UIAnimate {
    none,
    scale, // 从中间缩放
    bottom, // 从左移到中间
    top, // 从顶部移到中间
    left, // 从右边移动中间
    right // 从右边移到中间
}

const ease: ITweenOption = { easing: 'sineIn' }
const animateFuncs = [Animates.none, Animates.scale, Animates.bottom, Animates.top, Animates.left, Animates.right]
export const NumberAnimateMap = enum2Map(UIAnimate, 'number', animateFuncs) // 映射

@ccclass('BackgroudParam')
export class BackgroudParam {
    constructor(param?: BackgroudParam) {
        this.color = param?.color || this.color
        this.active = param?.active
        this.touch = param?.touch
        this.touchClose = false
        this.intercept = param?.intercept
    }

    //是否激活
    @property(CCBoolean) active?: boolean // 控制显示

    //能否触摸
    @property(CCBoolean) touch?: boolean //能否触摸

    // TODO 该功能还未实现
    @property(CCBoolean) touchClose?: boolean //点击关闭

    //拦截触摸事件
    @property(CCBoolean) intercept?: boolean

    @property(Color) color?: Color = new Color(0, 0, 0, 128)
}
