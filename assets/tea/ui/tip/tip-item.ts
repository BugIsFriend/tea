import { _decorator, Component, Label } from 'cc';
import { seek } from '../../meta/method';
const { ccclass } = _decorator;

@ccclass('TipItem')
export class TipItem extends Component {

    @seek(Label) TxtContent:Label


    show(content: string) { 
        this.TxtContent.string = content
    }

}

