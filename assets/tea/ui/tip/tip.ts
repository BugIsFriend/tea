/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { asyncload } from '../../load'
import { tea } from '../../tea'
import { find, Node, Layers, UITransform, Prefab, instantiate } from 'cc'

/**
 *  Toa管理类：
 *     1. 显示通用 Tip: 显示时长，
 *     2. 动态创建一个个性化 Tip: 可以指定 Prefab, 显示位置， 父节点； 用户可以持有该tip 实例，做一些逻辑操作；tip 特定的动画，显示后一些回调； 等等；
 *        这种玩家需要自行管理，并进行消耗
 */

class Tip {
    static _instance: Tip = null
    static instance() {
        if (!Tip._instance) Tip._instance = new Tip()
        return Tip._instance
    }
    private tip_root: Node = null
    private tip_prefab: Prefab = null
    private box_prefab: Prefab = null

    /**
     * 设置自定义 Tip 预制体
     * @param prefab 
     * @param bundle 
     */
    async initDefaultTip(prefab: string, bundle: string) {
        this.tip_prefab = await asyncload<Prefab>(prefab, bundle)
        this.tip_prefab.addRef()
    }

    // 初始化Tips
    init() {
        let view_root = tea.view_root()
        this.tip_root = find('tip_root', view_root)
        if (!this.tip_root) {
            this.tip_root = new Node('tip_root')
            view_root.addChild(this.tip_root)
            let uitransfor = this.tip_root.addComponent(UITransform)
            this.tip_root.layer = Layers.BitMask.UI_2D
            let size_canvas = view_root.getComponent(UITransform).contentSize
            this.tip_root.getComponent(UITransform).setContentSize(size_canvas)
            uitransfor.setContentSize(view_root.getComponent(UITransform).contentSize)
        }
    }

    /**
     * 通用 box 提示弹框
     */
    public show(box: ITBox): void
    public show(content: string,  push?: boolean, time?: number ): void
    
    public show(boxOrContent: ITBox | string,  push?: boolean, time?: number) {
        // normalize arguments to ITBox
        let box: ITBox
        if (typeof boxOrContent === 'string') {
            box = { content: boxOrContent }
            // opts.push / opts.time can be used here if needed
        } else {
            box = boxOrContent
        }

        // TODO: implement the actual show logic using `box` and `opts`
    }
}

interface ITBox { 
    title?:string   // 标题
    content:string  // 提示内容
    ok?: {
        txt?: string,
        cb?: Function,
    },
    cancel?: {
        txt?: string,
        cb?: Function,
    }   
}

const toast = Tip.instance()
