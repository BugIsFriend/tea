import { _decorator, RichText, size, tween, UIOpacity, UITransform } from 'cc';
import { seek, seekt } from '../../meta/method';
import { TipBase } from './tip-base';
const { ccclass } = _decorator;

@ccclass('TipItem')
export class TipItem extends TipBase {

    @seekt([UITransform, UIOpacity]) BgNode: [UITransform, UIOpacity]
    @seekt([UITransform, UIOpacity,RichText]) TxtContent: [UITransform, UIOpacity,RichText]


    show(content: string) { 
        this.BgNode[1].opacity = 0
        this.TxtContent[1].opacity = 0

        this.TxtContent[2].string = content
        this.scheduleOnce(() => {
            this.BgNode[1].opacity = 150
            this.TxtContent[1].opacity = 255
            
            let h = this.BgNode[0].contentSize.height
            let s = size(this.TxtContent[0].width+50,h)
            this.BgNode[0].setContentSize(s)
        }, 0)     
    }

}

