import { _decorator} from "cc";
import { Unit } from "../unit";
import { ICaseData } from "./debug";
import { DebugContainer } from "./debug-container";
const { ccclass } = _decorator;
@ccclass('DebugItemBase')
export class DebugItemBase extends Unit { 


    caseData: ICaseData
    container: DebugContainer

    initData(caseData: ICaseData, container?: DebugContainer): void { 
        this.caseData = caseData
        this.container = container
        container?.addDebugItem(this)
    }

    handleTap(tap:boolean) { }
}