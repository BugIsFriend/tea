/*  
* @Author: myerse.lee   
* @Date: 2026-02-27 15:39:13   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-27 15:39:13   * */

import { _decorator, Prefab, Node, instantiate, log } from "cc";
import { Unit } from "../unit";
const { ccclass,property, executeInEditMode } = _decorator

@ccclass('DebugView')
@executeInEditMode
class DebugView extends Unit {

    @property(Prefab) casePrefab: Prefab = null;

    @property(Node) Category: Node = null;


    protected start(): void {
        this.Category.removeAllChildren()
        this.init()
    }
    
    public init( data?: any): void {
     
        let category = [
            { name: 'all', value: 'FSM' },
            { name: 'storage', value: 'View' },
            { name: 'flow', value: 'Background' },
        ]
        
        tea.debug.addCase({ name: 'test', group: 'all', cb: () => {
            log('test debug case')
        }})
        

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