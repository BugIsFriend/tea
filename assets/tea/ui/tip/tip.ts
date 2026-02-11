/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { Node, Layers, Prefab, instantiate, tween, warn, find, UITransform,} from 'cc'
import { LoadCom } from '../../component/loadcom'
import { singleton } from '../../meta/class'
import { TipItem } from './tip-item'
import { ITipBox, TipBox } from './tip-box'
import { gain } from '../../tools'
import { Unit } from '../../unit'

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

    public show(content: ITipBox,  bubble?: number| boolean): void
    /**
     * @param content 
     * @param timeOrbubling : 
     */
    public show(content: string,  bubble?: number| boolean): void
    
    public show<T extends TipBox>(content: ITipBox | string, bubble: number| boolean):T{
       
        let tipCom:any = null
        let tipNode: Node = typeof content === 'string' ? instantiate(this.tip_prefab) : instantiate(this.tipbox_prefab)
        this.root.addChild(tipNode)
        
        if (typeof content === 'string') {
            let _tip = tipNode.getComponent(TipItem)
            tipCom = _tip
            let _bubble = typeof bubble === 'boolean' ? true : false
            let _time =  _bubble?4:bubble as number

            _tip.show(content, _time)
           if(!_bubble) this.popTipItem(true)
            this.popTip.push(_tip)
            let gap = 20
            
            let copy = [...this.popTip]
            copy.reverse().forEach((item, idx) => {
                item.node.y = idx * (item.gain(UITransform).height + gap)
            })
        } else {
            tipCom = tipNode.getComponent(TipBox)
            tipCom.show(content)
        }
        tipNode.layer = Layers.BitMask.UI_2D
        return tipCom
    }
    
    /**
     * removeTipItem
     */
    public popTipItem(immediately: boolean) {
        if (immediately) {
            if(this.popTip.length <=0) return 
            let tip_item = this.popTip.splice(this.popTip.length-1,1)[0]
            this.hide(tip_item)
        } else { 

        }
    }

    // 隐藏指定
    public hide(tip:TipItem | TipBox) { 
     if (tip.node.isValid) {
            tip.node.parent = null
        }   
    }
}

export const tip = new Tip()


