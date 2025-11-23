import { _decorator } from 'cc'

export const ViewCategory = {
    None: 0, // 自行管理
    View:200,  // 普通 View 平铺在场景上面
    PopView: 300, // 弹框 用动画 对象统一管理
    Dialog: 400,  // TODO dialog 未实现
    Toast: 500    // TODO toast 未实现
}
