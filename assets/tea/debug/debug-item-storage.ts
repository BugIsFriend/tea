import { _decorator, Button, find, Label, Node, v3 } from "cc";
import { ICaseData, DebugItemBase } from "./debug";
import { seek } from "../meta/method";
import { DebugContainer } from "./debug-container";

const { ccclass, property } = _decorator;


// 定制 DebugItem界面；如果没有设置，则使用默认界面；
@ccclass('DebugItemStorage')
export class DebugItemStorage extends DebugItemBase { 

    @seek(Label,'TxtName') TxtName: Label = null

    protected start(): void {


    }

    public initData(caseData: ICaseData, container?: DebugContainer): void { 
        super.initData(caseData, container)
        this.node.position  = v3(20, 0, 0)
        this.TxtName.string = caseData.name+'       '
    }

    public tap() { 
        this.container.tapDebugCase(this)
    }

    public tapSave() { 
        
    }

    public tapDelete() { 

    }


}