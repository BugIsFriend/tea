/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { Node, Layers, Prefab, instantiate, tween, warn, find,} from 'cc'
// import { ITipBox } from './tip-box'
import { LoadCom } from '../../component/loadcom'
import { singleton } from '../../meta/class'
import { TipItem } from './tip-item'
import { ITipBox, TipBox } from './tip-box'



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

    private popTip:TipItem[] = []

    // 初始化Tip
    async init() {
        this.tip_prefab = await LoadCom.asynload<Prefab>('tea/asset/prefab/tip/TipItem')
        this.tipbox_prefab = await LoadCom.asynload<Prefab>('tea/asset/prefab/tip/TipBox')

        if( !this.tip_prefab ||  !this.tipbox_prefab) warn('初始资源加载事变, TipItem  TipBox ')
    }
    
    public get root() : Node {
        return  find('Canvas/tip/tips', tea.root)
    }

    public popTipItem() { 
        
    }

    public show(box: ITipBox): void
    /**
     * @param content 
     * @param timeOrbubling : 
     */
    public show(content: string,  timeOrbubbling: number| boolean): void
    
    public show<T extends TipItem | TipBox>(boxOrContent: ITipBox | string, timeOrbubbling: number| boolean = 4):T{
       
        let tipNode: Node = null
        let tipCom:any = null
        if (typeof boxOrContent === 'string') {
            tipNode= instantiate(this.tip_prefab)
            tipNode.parent = this.root
            tipCom = tipNode.getComponent(TipItem)
            tipCom.show(boxOrContent)
            let bubble = typeof timeOrbubbling === 'boolean' ? true : false
        
            if (bubble) {
                // TODO 冒泡泡 Tip
            } else { 
                tween(tipNode).delay(timeOrbubbling as number).removeSelf().start()
            }
        } else {
            tipNode = instantiate(this.tipbox_prefab)
            tipNode.parent = this.root
            tipCom = tipNode.getComponent(TipBox)
            tipCom.show(boxOrContent)
        }
        tipNode.layer = Layers.BitMask.UI_2D
        return tipCom
    }

    // 隐藏指定
    public hide(tip:TipItem | TipBox) { 
        if (tip.node.isValid) {
            tip.node.parent = null
        }
    }
}




export const tip = new Tip()


