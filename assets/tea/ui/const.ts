import { _decorator, CCBoolean, Color, Node, Tween, tween, v3, Vec3 } from 'cc'
const { ccclass, property } = _decorator

export const ViewCategory = {
    None: 0, // 自行管理
    Window: 1, // ui 对象统一管理  默认 类型
    PopView: 2 // ui 对象统一管理
}

export enum ViewState {
    None,
    Opening,
    Openged,
    // TODO: 界面的隐藏状态
    Hide, // 隐藏不删除
    Closing, //关闭中
    Closed // 关闭且删除
}

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

let _dt = 0.2
export const ActionCreator = {}
export const ViewAction = {
    None: 0,
    Scale: 1, // 从中间缩放
    Left: 2, // 从左移到中间
    Right: 3, // 从右边移到中间
    Top: 4, // 从顶部移到中间
    Bottom: 5 //从底部移到中间
}

ActionCreator[ViewAction.Scale] = {
    big: 1.2,
    small: 1,
    show(node: Node, cb: Function): Tween<any> {
        node.setScale(Vec3.ZERO)
        let act = tween(node)
            .to(_dt + 0.05, { scale: v3(this.big, this.big, this.big) }, { easing: 'cubicIn' })
            .to(_dt, { scale: v3(this.small, this.small, this.small) })
            .call(() => cb())
        return act
    },
    close: () => {}
}

ActionCreator[ViewAction.Bottom] = {
    big: 1.2,
    small: 1,
    show(node: Node, cb: Function) {
        node.setScale(Vec3.ZERO)
        let act = tween(node)
            .to(this.dt + 0.05, { scale: v3(this.big, this.big, this.big) }, { easing: 'cubicIn' })
            .to(this.dt, { scale: v3(this.small, this.small, this.small) })
            .call(() => cb())
        return act
    },
    close: () => {}
}

ActionCreator[ViewAction.Top] = {
    dt: 0.2,
    big: 1.2,
    small: 1,
    show(node: Node, cb: Function) {},
    close: () => {}
}
ActionCreator[ViewAction.Bottom] = {
    dt: 0.2,
    big: 1.2,
    small: 1,
    show(node: Node, cb: Function) {
        node.setScale(Vec3.ZERO)
        let act = tween(node)
            .to(this.dt + 0.05, { scale: v3(this.big, this.big, this.big) }, { easing: 'cubicIn' })
            .to(this.dt, { scale: v3(this.small, this.small, this.small) })
            .call(() => cb())
        return act
    },
    close: () => {}
}
