import { _decorator, RichText, tween } from 'cc';
import { seek } from '../../meta/method';
import { Unit } from '../../unit';
import { TipBase } from './tip-base';
const { ccclass } = _decorator;

@ccclass('TipItem')
export class TipItem extends TipBase {

    @seek(RichText, 'TxtContent') TxtContent:RichText


    show(content: string) { 
        this.TxtContent.string = content
    }

}

