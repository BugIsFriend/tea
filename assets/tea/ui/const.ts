import { _decorator, CCBoolean, Color } from 'cc'
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
    // TODO: 待实现
    Hide, // 隐藏不删除
    Closing, //关闭中
    Closed // 关闭且删除
}

export const ViewAction = {
    None: 0,
    Scale: 1, // 从中间缩放
    Left: 2, // 从左移到中间
    Right: 3, // 从右边移到中间
    Top: 4, // 从顶部移到中间
    Bottom: 5 //从底部移到中间
}

@ccclass('BackgroudParam')
export class BackgroudParam {
    constructor(param?: BackgroudParam) {
        this.color = param?.color || this.color
        this.actived = param?.actived
        this.toucheable = param?.toucheable
        this.intercept = param?.intercept
    }

    /**
     * 是否激活
     */
    @property(CCBoolean) actived?: boolean // 激活
    /**
     * 能否触摸
     */
    @property(CCBoolean) toucheable?: boolean //触摸
    /**
     * 拦截触摸事件
     */
    @property(CCBoolean) intercept?: boolean

    @property(Color) color?: Color = new Color(0, 0, 0, 128)
}
