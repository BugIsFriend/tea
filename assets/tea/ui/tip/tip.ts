/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 16:48:58
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 16:48:58
 * */

import { Node, Layers, Prefab, instantiate, warn, find, UITransform, error,} from 'cc'
import { LoadCom } from '../../component/load'
import { singleton } from '../../meta/class'
import { TipItem } from './tip-item'
import { TipBox } from './tip-box'
import { ITipBox, TipBase } from './tip-base'
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

    public show(content: ITipBox, bubble?:boolean, time?:number): TipBox
   
    public show(content: string,  bubble?: boolean, time?:number): TipBox
    
    public show<T extends TipBase>(content: ITipBox | string, bubble?: number| boolean, time?:number ):T{
       
        if (!this.tip_prefab || !this.tipbox_prefab) {
            error('没有默认的 TipItem, TipBox 预制体，请检查资源是否正确加载')
            return null;
         }
        
        let tipCom:any = null
        let tipNode: Node = typeof content === 'string' ? instantiate(this.tip_prefab) : instantiate(this.tipbox_prefab)
        this.root.addChild(tipNode)
        
        if (typeof content === 'string') {
            let _tip = tipNode.getComponent(TipItem)
            tipCom = _tip
            let _time =  time?time:4 as number

            _tip.show(content)

            if (!bubble) this.popTipItem(true)
            
            this.pushTipItem(_tip)

            _tip.scheduleOnce(() => this.popTipItem(_tip), _time)

        } else {
            tipCom = tipNode.getComponent(TipBox)
            tipCom.show(content)
        }
        tipNode.layer = Layers.BitMask.UI_2D
        return tipCom
    }

    public updateLayout() {
        let gap = 20                // tip 之间的间隔
        let copy = [...this.popTip]
        copy.reverse().forEach((item, idx) => {
            item.node.y = idx * (item.gain(UITransform).height + gap)
        })
    }
    
    public pushTipItem(tip: TipItem) {
        this.popTip.push(tip)
        this.updateLayout()
    }

    public popTipItem(top: boolean | TipItem) {
        if (this.popTip.length <= 0) return 
        if (typeof top === 'boolean' && top) {
            let tip_item = this.popTip.splice(this.popTip.length - 1, 1)[0]
            this.hide(tip_item)
        } else { 
            _.remove(this.popTip, top as TipItem)
            this.hide(top as TipItem)
        }
        this.updateLayout()
    }

    // 删除 Tip 组将；
    public hide(tip:TipItem | TipBox) { 
        if (tip.node.isValid) {
            tip.node.parent = null
        }   
    }
}

export const tip = new Tip()


