import { _decorator, Button, find, Label, Node, v3 } from "cc";
import { ICaseData, DebugItemBase } from "./debug";
import { seek } from "../meta/method";

const { ccclass, property } = _decorator;


// 定制 DebugItem界面；如果没有设置，则使用默认界面；
@ccclass('DebugItemStorage')
export class DebugItemStorage extends DebugItemBase { 

    @seek(Label,'TxtName') TxtName: Label = null

    protected start(): void {
        // this.node.on(Button.EventType.CLICK, () => {
        //     let desc = this.caseData.tapCb?.(this.caseData)
        //     // this.TxtName.string = desc ?? this.debugItem.name 
        //     // this.gain(Layout).updateLayout( )
        // })
    }

    public initData(caseData: ICaseData, container: Node): void { 
        this.caseData = caseData
        this.node.parent = find('ListView/view/content', container)
        this.node.position  = v3(20, 0, 0)
        this.container = container
        this.TxtName.string = caseData.name
    }

    public tapSave() { 
        // this.caseData.
    }

    public tapDelete() { 

    }


}