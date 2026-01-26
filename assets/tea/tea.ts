/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 17:17:42
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 17:17:42
 * */

import { director, find, warn, Node, UITransform, Layers, Prefab, error, instantiate } from 'cc'
import { singleton } from './meta/class'
import { LoadCom } from './component/loadcom'
import { Tip } from './ui/tip/tip'
import { UI } from './ui'

/**
 *  框架层代码
 */

@singleton
export class Tea {
   
    prefabRoot: Prefab = null

    async init() {
        this.prefabRoot = await LoadCom.asynload<Prefab>('tea/asset/prefab/2DRoot')
        await this.tip.init()
        this.ui.init()
        this.prefabRoot.addRef() 
    }

    // 初始化 root节点
    public get root(): Node {
        let scene = director.getScene()
        if (!scene) { 
            warn( 'no running scene')
            return;
        }

        let root = find('2DRoot', scene)

        if (!root) { 
            root = instantiate(this.prefabRoot)
            scene.addChild(root)    
        }
        return root;
    }

    
    /**
     *  tip 单例
     */
    public get tip() : Tip {
        return  new Tip()
    }

    /**
     * ui 单例
     */
    public get ui():UI {
       return new UI() 
    }

   
}

window.tea = new Tea()


