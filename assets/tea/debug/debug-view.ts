/*  
* @Author: myerse.lee   
* @Date: 2026-02-27 15:39:13   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-27 15:39:13   * */

import { _decorator, Prefab, Node, instantiate } from "cc";
import { Unit } from "../unit";
import { seek } from "../meta/method";
const { ccclass,property } = _decorator

@ccclass('DebugView')
class DebugView extends Unit {

    @property(Prefab) casePrefab: Prefab = null;

    @seek(Node) Category: Node
    
    public init( data?: any): void {
     
        let category = [
            { name: 'all', value: 'FSM' },
            { name: 'storage', value: 'View' },
            { name: 'flow', value: 'Background' },
        ]

        category.forEach((item) => {
            let node = this.Category.getChildByName(item.value)
            if (!node) {
                node = instantiate(this.casePrefab)
                node.name = item.value
                node.parent = this.Category 
            }
        })
        
    }

}