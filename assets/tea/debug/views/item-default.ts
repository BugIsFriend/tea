import { _decorator, Button, Color, Label, Layout, Node, Sprite, } from "cc";
import { ICaseData } from "../debug";
const { ccclass} = _decorator
import { seek } from "../../meta/method";
import { DebugContainer } from "./container";
import { DebugItemBase } from "./item-base";


@ccclass('DebugItemDefault')
export class DebugItemDefault extends DebugItemBase { 
    
    @seek(Label, 'TxtName') TxtName: Label 

    initData(caseData: ICaseData, container?: DebugContainer): void { 
        super.initData(caseData, container)
        this.TxtName.string = caseData.name 
    }

    setDark(dark:boolean) { 
        this.getComponent(Sprite).color = dark ? Color.WHITE.clone():new Color(150, 150, 150)
    }

    protected start(): void {
        this.node.on(Button.EventType.CLICK, () => {
            let desc = this.caseData.tapCb?.(this.caseData)
            this.TxtName.string = desc ?? this.caseData.name ?? this.caseData.group 
            this.gain(Layout).updateLayout( )
        })
    }
}