/*  
* @Author: myerse.lee   
* @Date: 2026-02-27 15:39:13   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-27 15:39:13   * */

import { _decorator, Prefab, Node, instantiate, log, Label, Component, Layout} from "cc";
import { Unit } from "../unit";
import { ICaseData } from "./debug";
import { gain } from "../tools";
import { DebugCase } from "./debug-case";
const { ccclass,property, executeInEditMode } = _decorator


@ccclass('DebugView')
@executeInEditMode
export class DebugView extends Unit {

    @property(Prefab) casePrefab: Prefab = null;
    @property(Prefab) LayoutPrefab: Prefab = null;

    @property(Node) Category: Node = null;
    @property(Node) DebugcaseLayouts: Node = null;

    @property(Node) Root: Node = null;

    mNodeCategory:Map<Node,Node> = new Map()


    protected start(): void {
        this.Category.removeAllChildren()
        this.DebugcaseLayouts.removeAllChildren()
        this.init()
    }
    
    public init( data?: any): void {
 
        tea.debug.addCase({ name: 'test', cb: (data) => {
                log('debug_case '+data.name)
                return data.name
            }
        })

        var click = 0
        tea.debug.addCase({ name: 'test-showfps', cb: (data) => {
                log('debug_case '+data.name)
                return data.name +(click++)
            }
        })

        tea.debug.addCase({
            group:'Storage',
            name: 'test1', cb: (data) => {
            log('debug_case '+data.name )
            return data.name
        }})
        
        tea.debug.addCase({
            group:'Storage',
            name: 'test2', cb: (data) => {
            log('debug_case '+data.name )
            return data.name
            }
        })
        
        let _data = tea.debug.data()

        let first = true
        _data.forEach((mGroup, groupId) => { 

            // 创建 组 页签，和 组 对应的容器视图
            let tabItem = this.Category.getChildByName(groupId)
            if (!tabItem) {
                tabItem = instantiate(this.casePrefab)

                let layout = instantiate(this.LayoutPrefab)
                layout.parent = this.DebugcaseLayouts
                this.mNodeCategory.set(tabItem, layout)
                
                let data: ICaseData = {
                    name: groupId,                          // 显示名字；
                    group: groupId,                         // 当前属于那一组； 0
                    cb: (data: ICaseData) => this.tapCatgeory(tabItem)
                }
                
                let comp = gain(tabItem, DebugCase)
                comp.initData(data, this.Category, 0)
                comp.setDark(first)
                layout.active = first
                first = false
            }

            // 创建 每 组对应的测试用例；
            mGroup.forEach((debugItem, key) => { 
                let node = instantiate(this.casePrefab)
                let comp = gain(node, DebugCase)
                comp.initData(debugItem, this.mNodeCategory.get(tabItem))
            })
        })
        
    }

    public tapCatgeory(tabItem:Node) { 
        this.mNodeCategory.forEach((value, key) => { 
            let click = (tabItem == key)
            value.active = click
            gain(key, DebugCase).setDark(click)
        })
        return ''
    }

    show() { 
        this.Root.active = true
    }

    hide() { 
        this.Root.active = false
    }

}