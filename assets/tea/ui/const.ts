export const ViewCategory = {
    None: 0, // 自行管理
    Window: 1, // ui 对象统一管理  默认 类型
    PopView: 2 // ui 对象统一管理
}

export enum ViewState {
    None,
    Opening,
    Openged,
    Closing,
    Closed
}

export const ViewAction = {
    None: 0,
    Scale: 1, // 从中间缩放
    Left: 2, // 从左移到中间
    Right: 3, // 从右边移到中间
    Top: 4, // 从顶部移到中间
    Bottom: 5 //从底部移到中间
}
