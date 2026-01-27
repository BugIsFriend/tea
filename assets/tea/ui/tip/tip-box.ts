import { _decorator, Component, Label, tween, UIOpacity ,Node} from 'cc';
import { seek } from '../../meta/method';
const { ccclass } = _decorator;
export interface ITipBox { 
    title?:string   // 标题
    content:string  // 提示内容
    ok?: {
        txt?: string,
        cb?: Function,
    },
    cancel?: {
        txt?: string,
        cb?: Function,
    }
    
    close?: Function
}

@ccclass('TipBox')
export class TipBox extends Component {

    msg: ITipBox
    
    @seek(Label, 'TxtTitle') TxtTitle:Label
    @seek(Label, 'BtnOk') TxtOk:Label
    @seek(Label, 'BtnClose') TxtCancel:Label   
    @seek(Label, 'TxtContent') TxtContent: Label

    @seek(Node) BtnCancel:Node
    @seek(Node) BtnOk:Node
    @seek(Node) BtnClose:Node

    @seek(UIOpacity) opacity:UIOpacity

    show(msg: ITipBox) { 
        this.msg = msg
        this.TxtContent.string = msg.content
        if(msg.title) {  this.TxtTitle.string =  msg.title}
        if(msg.ok || msg.ok.txt)  this.TxtOk.string =  msg.ok.txt
        if(msg.cancel || msg.cancel.txt) this.TxtCancel.string = msg.cancel.txt


        this.TxtTitle.node.active = !!msg.title

        this.BtnOk.active = !!msg.ok
        this.BtnClose.active = !!msg.close
        this.BtnCancel.active = !!msg.cancel

        return  this
    }

    tapCancel() {
        this.msg.cancel?.cb?.()
        this.tapClose()
    }

    tapOk() { 
        this.msg.ok?.cb?.()
        this.tapClose()
    }

    tapClose() { 
        this.msg?.close?.()
        tween(this.opacity).to(0.3, {opacity:0}).call(()=>this.node.removeFromParent())
    }
}

