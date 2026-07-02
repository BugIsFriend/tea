/*  
* @Author: myerse.lee  
* @Date: 2026-06-03 10:46:33   
* @Modified by:   myerse.lee   
* @Modified time: 2026-06-03 10:46:33   
* */
import { _decorator, Button, Color, Label, Sprite, v3 } from "cc";
import { seek } from "../../meta/method";
import { DebugContainer } from "./container";
import { DebugItemBase } from "./item-base";
import { ICaseData, ICaseDataMemory } from "../debug-types";

const { ccclass, property } = _decorator;


// 定制 DebugItem界面；如果没有设置，则使用默认界面；
@ccclass('DebugItemMemory')
export class DebugItemMemory extends DebugItemBase { 

    caseData: ICaseDataMemory
    @seek(Label) TxtName: Label = null


    protected start(): void {
        this.node.on(Button.EventType.CLICK, this.tap, this)
    }

    public initData(caseData: ICaseDataMemory, container?: DebugContainer): void { 
        super.initData(caseData, container)
        this.node.position  = v3(20, 0, 0)
        this.TxtName.string = caseData.name + '       '
        
    }

    handleTap(tap:boolean) { 
        this.node.getComponent(Sprite).color = tap ? Color.fromHEX(new Color(), '#65FC00') : Color.WHITE.clone()
    }

    public tap() { 
        this.container.tapDebugCase(this)
        this.container.updateView('tap', this)
    }

    public tapDelete() { 
        this.container.updateView('delete', this)
    }


}