/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 17:17:42
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 17:17:42
 * */

import { director, find, warn, Node, UITransform, Layers, Prefab, error, instantiate } from 'cc'
import { singleton } from './meta/class'
import { init } from '../../dts/lodash/fp'
import { LoadCom } from './component/loadcom'

/**
 *  框架层代码
 */

@singleton
export class Tea {
   
    prefabRoot: Prefab = null

    async init() {
        this.prefabRoot = await LoadCom.asynload<Prefab>('tea/prefab/2DRoot')
        if (!this.prefabRoot) {
            error('加载 2DRoot 预制体失败')
        } else {
            this.prefabRoot.addRef()
         }   
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

    public get ui_root(): Node {
        return find('UI/view', this.root)
    }

    public get tip_root(): Node {
        return find('UI/tip', this.root)
    }


    
}



export const tea = new Tea()
