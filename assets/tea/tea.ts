/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 17:17:42
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 17:17:42
 * */

import { director, find, warn, Node, UITransform, Layers } from 'cc'

export namespace tea {
    // 初始化 视图根节点
    export function view_root(): Node {
        let tip = ''

        if (!director.getScene()) tip = 'no running scene'

        if (!find('Canvas', director.getScene())) tip = `the scene: ${director.getScene().name},  no Canvas node `

        !!tip && warn(tip)

        if (!!tip) return

        let canvas = find('Canvas', director.getScene())

        let viewroot = find('ViewRoot', canvas)
        if (!viewroot) {
            let uiNode = new Node('ViewRoot')
            canvas.addChild(uiNode)
            let uitransfor = viewroot.addComponent(UITransform)
            viewroot.layer = Layers.BitMask.UI_2D
            let size_canvas = canvas.getComponent(UITransform).contentSize
            viewroot.getComponent(UITransform).setContentSize(size_canvas)
            uitransfor.setContentSize(canvas.getComponent(UITransform).contentSize)
        }

        return viewroot
    }

    export function init() {}
}
