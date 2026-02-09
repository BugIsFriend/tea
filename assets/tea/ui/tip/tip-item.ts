import { _decorator, Component, Label, RichText } from 'cc';
import { seek } from '../../meta/method';
const { ccclass } = _decorator;

@ccclass('TipItem')
export class TipItem extends Component {

    @seek(RichText, 'TxtContent') TxtContent:RichText


    show(content: string) { 
        this.TxtContent.string = content
    }

}

