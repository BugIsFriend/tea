/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 17:17:42
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 17:17:42
 * */

import { director, find, warn, Node,  Prefab, instantiate, UITransform, Size, View, ResolutionPolicy } from 'cc'
import { singleton } from './meta/class'
import { LoadComponent } from './component/load'
import { tip } from './ui/tip/tip'
import { ui } from './ui/ui'
import { __debug } from './debug/debug'
import { emmiter } from './emitter'
import { gain } from './tools'
@singleton
export class Tea {
   
    prefabRoot: Prefab = null

    async init() {
        this.prefabRoot = await LoadComponent.asynload<Prefab>('tea/asset/prefab/2DRoot')
        this.adjustUIView()
        await this.tip.init()
        this.ui.init()
        this.debug.init()
        this.prefabRoot.addRef() 
    }

    public get uiTransform() { 
        return gain(this.root, UITransform)
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

    adjustUIView() { 
        let ui_transform = gain(this.root, UITransform)  // 设计分辨率
        let designSize = View.instance.getDesignResolutionSize()
        
        // 为了 UI 不变形，固定宽高比小的长度； 宽度比大于高度比； 高度分辨率保持设计分辨率，宽度分辨率和屏幕一致

        // 横屏游戏
        if (screen.width > screen.height) {
            ui_transform.setContentSize(new Size(screen.width, designSize.height))
        } else { 
            ui_transform.setContentSize(new Size(designSize.width, screen.height))
        }

        let size = ui_transform.contentSize
        gain(this.ui.root, UITransform).setContentSize(size.clone())
        gain(this.tip.root, UITransform).setContentSize(size.clone())
        gain(this.debug.root, UITransform).setContentSize(size.clone())
        
        // TODO 针对 针对刘海屏的适配；屏幕中边角适配；
    }

    // tip 单例
    public get tip(){
        return  tip
    }

    // ui 单例
    public get ui() {
       return ui 
    }

    public get emitter() {
        return emmiter
    }

    // 测试模块
    public get debug() {
        return __debug
    }
}

window['tea'] = new Tea()

