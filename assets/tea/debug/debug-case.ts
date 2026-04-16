
import { _decorator, Prefab, Node, instantiate, log, Label, Button, EventHandler, Input, Component } from "cc";
import { ICaseData } from "./debug";
import { seek } from "../meta/method";
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('DebugCase')
export class DebugCase extends Component { 

    type:0|1 = 1     // 0:tableItem   1: debugItem

    debugItem:ICaseData = null
    @seek(Label, 'TxtName') TxtName: Label 

    init(debugItem: ICaseData, parent: Node, type?: 0 | 1) { 
        this.type = type
        this.debugItem = debugItem
        this.node.parent = parent
        this.TxtName.string = debugItem.name
    }

    protected onLoad(): void {
        this.node.on('click', () => {
            let desc = this.debugItem.cb?.(this.debugItem)
            this.TxtName.string ??= desc
        })
    }
}