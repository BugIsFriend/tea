import { _decorator, RichText, tween } from 'cc';
import { seek } from '../../meta/method';
import { Unit } from '../../unit';
const { ccclass } = _decorator;

@ccclass('TipItem')
export class TipItem extends Unit {

    @seek(RichText, 'TxtContent') TxtContent:RichText


    show(content: string, time:number) { 
        this.TxtContent.string = content
    }


}

