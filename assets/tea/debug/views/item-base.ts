import { _decorator} from "cc";
import { Unit } from "../../unit";
import { ICaseData } from "../debug";
import { DebugContainer } from "./container";
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

export function formatDisplayData(data: object) {
    if (typeof data === 'string') {
        return data
    }
    const json = JSON.stringify(data, (key, value) => key === 'expire' ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : value, 2)
    return json ?? String(data)
}