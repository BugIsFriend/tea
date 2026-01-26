/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { Node, Layers, Prefab, instantiate, tween, warn, find,} from 'cc'
import { ITBox } from './tip-box'
import { LoadCom } from '../../component/loadcom'
import { singleton } from '../../meta/class'

/**
 *  Toa管理类：
 *     1. 显示通用 Tip: 显示时长，
 *     2. 动态创建一个个性化 Tip: 可以指定 Prefab, 显示位置， 父节点； 用户可以持有该tip 实例，做一些逻辑操作；tip 特定的动画，显示后一些回调； 等等；
 *        这种玩家需要自行管理，并进行消耗
 */

@singleton
export class Tip {

    private tip_prefab: Prefab = null
    private tipbox_prefab: Prefab = null

    // 初始化Tip
    async init() {
        this.tip_prefab = await LoadCom.asynload<Prefab>('tea/asset/prefab/tip/TipItem')
        this.tipbox_prefab = await LoadCom.asynload<Prefab>('tea/asset/prefab/tip/TipBox')

        if( !this.tip_prefab ||  !this.tipbox_prefab) warn('初始资源加载事变, TipItem  TipBox ')
    }
    
    
    public get root() : Node {
        return  find('UI/tip', tea.root)
    }

    /**
     * 通用 box 提示弹框
     */
    public show(box: ITBox): void

    /**
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
            tip_view.layer = Layers.BitMask.UI_2D
            tip_view.parent = this.root
            tween(tip_view).delay(time?time:4).removeSelf().start()
        } else {
            box = boxOrContent
        }

    }
}


export const tip = new Tip()


