/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { asynload } from '../../load'
import { find, Node, Layers, UITransform, Prefab, instantiate, tween, AssetManager ,} from 'cc'
import { ITBox } from './tip-box'
import { tea } from '../../tea'

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
    private tip_box: Node = null
    private tip_prefab: Prefab = null
    private box_prefab: Prefab = null

    /**
     * 设置自定义 Tip 预制体
     * @param prefab 
     * @param bundle 
     */
    async initDefaultTip(prefab: string, bundle: string) {
        this.tip_prefab = await asynload<Prefab>(prefab, bundle)
        this.tip_prefab.addRef()
    }

    // 初始化Tips
    init() {
        let _root = tea.root()
        this.tip_root = find('tip_root', _root)
        if (!this.tip_root) {
            this.tip_root = new Node('tip_root')
            _root.addChild(this.tip_root)
            let uitransfor = this.tip_root.addComponent(UITransform)
            this.tip_root.layer = Layers.BitMask.UI_2D
            let size_canvas = _root.getComponent(UITransform).contentSize.clone()
            uitransfor.setContentSize(size_canvas)

            this.tip_box = new Node('tip_box')
            this.tip_box.layer = Layers.BitMask.UI_2D
            this.tip_root.addChild(this.tip_box)
        }

        
        asynload<Prefab>('1c1a1b62-5251-4020-a3bf-d61c28c1633c', AssetManager.BuiltinBundleName.MAIN).then((prefab) => { 
            this.tip_prefab = prefab
        })
    }

    /**
     * 通用 box 提示弹框
     */
    public show(box: ITBox): void

    /**
     * 
     * @param content 
     * @param bubbling 
     * @param time 
     */
    public show(content: string,  time?: number,  bubbling?: boolean ): void
    
    public show(boxOrContent: ITBox | string, time?: number,  bubbling?: boolean) {
        // normalize arguments to ITBox
        let box: ITBox
        if (typeof boxOrContent === 'string') {
            box = { content: boxOrContent }
            let tip_view = instantiate(this.tip_prefab)
            this.tip_root.addChild(tip_view)
            tip_view.layer = Layers.BitMask.UI_2D
            tween(tip_view).delay(time?time:3).removeSelf().start()
        } else {
            box = boxOrContent
        }

        // TODO: implement the actual show logic using `box` and `opts`
    }
}


export const tip = Tip.instance()


