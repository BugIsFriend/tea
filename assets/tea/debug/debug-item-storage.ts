import { _decorator, Button, Color, find, Label, Node, Sprite, v3 } from "cc";
import { ICaseData } from "./debug";
import { seek } from "../meta/method";
import { DebugContainer } from "./debug-container";
import { DebugItemBase } from "./debug-item-base";

const { ccclass, property } = _decorator;


// 定制 DebugItem界面；如果没有设置，则使用默认界面；
@ccclass('DebugItemStorage')
export class DebugItemStorage extends DebugItemBase { 

    @seek(Label,'TxtName') TxtName: Label = null

    protected start(): void {
        this.node.on(Button.EventType.CLICK, this.tap, this)
    }

    public initData(caseData: ICaseData, container?: DebugContainer): void { 
        super.initData(caseData, container)
        this.node.position  = v3(20, 0, 0)
        this.TxtName.string = caseData.name+'       '
    }

    handleTap(tap:boolean) { 
        this.node.getComponent(Sprite).color = tap ? Color.fromHEX(new Color(), '#65FC00') : Color.WHITE.clone()
    }

    public tap() { 
        this.container.tapDebugCase(this)
        this.container.updateView('tap', this)
    }

    public tapSave() { 
        this.container.updateView('save', this)
    }

    public tapDelete() { 
        this.container.updateView('delete', this)
    }


}