/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 17:17:42
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 17:17:42
 * */

import { director, find, warn, Node, UITransform, Layers } from 'cc'
import { singleton } from './meta/class-decorator'

/**
 *  框架层代码
 */

@singleton
export class Tea {

    
    // 初始场景中初始化框架
    public init() {
        this.root()
    }

    // 初始化 root节点
    root(): Node {
        let tip = ''

        if (!director.getScene()) tip = 'no running scene'

        if (!find('Canvas', director.getScene())) tip = `the scene: ${director.getScene().name},  no Canvas node `

        !!tip && warn(tip)

        if (!!tip) return

        let canvas = find('Canvas', director.getScene())

        let _root = find('__root', canvas)
        if (!_root) {
            _root = new Node('__root')
            canvas.addChild(_root)
            _root.layer = Layers.BitMask.UI_2D
            let size_canvas = canvas.getComponent(UITransform).contentSize.clone()
            _root.addComponent(UITransform).setContentSize(size_canvas)
        }
        return _root
    }

    
}



export const tea = new Tea()
