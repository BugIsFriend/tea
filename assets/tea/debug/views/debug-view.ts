/*  
* @Author: myerse.lee   
* @Date: 2026-02-27 15:39:13   
* @Modified by:   myerse.lee   
* @Modified time: 2026-02-27 15:39:13   * */

import { _decorator, Prefab, Node, instantiate, log, Component, CCString} from "cc";
import { Unit } from "../../unit";
import { ICaseData, DebugGroupType } from "../debug";
import { gain } from "../../tools";
import { DebugItemDefault } from "./item-default";
import { DebugContainer } from "./container";
import { DebugItemBase } from "./item-base";
const { ccclass,property, executeInEditMode } = _decorator

@ccclass('DebugPrefabsCfg')
export class DebugPrefabsCfg { 
    @property(CCString) group: string = ''
    @property(Prefab) caseItem: Prefab = null;
    @property(Prefab) container: Prefab = null;
}


@ccclass('DebugView')
@executeInEditMode
export class DebugView extends Unit {


    @property(Prefab) casePrefab: Prefab = null;
    @property(Prefab) ContainerPrefab: Prefab = null;

    @property(Node) TabParent: Node = null; // 页签更节点
    @property(Node) ContainerParent: Node = null;

    @property(Node) Root: Node = null;

    @property(DebugPrefabsCfg) prefabCfg: DebugPrefabsCfg[] = []

    showGroup: DebugGroupType = 'Storage' // 显示那一组；如果没有设置，则显示第一组；

    mNodeCategory:Map<Node,Node> = new Map()

    protected start(): void {
        this.TabParent.removeAllChildren()
        this.ContainerParent.removeAllChildren()
        this.init()
    }


    initGroupTab(tabItemView:DebugItemDefault, parent:Node,show:boolean, caseData: ICaseData): void { 
        tabItemView.caseData = caseData
        tabItemView.node.parent = parent
        tabItemView.setDark(show)
        tabItemView.TxtName.string = caseData.name 
    }

    public init(data?: any): void {

        this.prefabCfg.forEach(cfg => tea.debug.registerDebugPrefab(cfg.group,  cfg.container, cfg.caseItem))

        let _data = tea.debug.data()

        _data.forEach((mGroup, groupId) => { 

            // 创建 页签  组
            let tabItem = this.TabParent.getChildByName(groupId)
            if (!tabItem) {
                let show = this.showGroup == groupId
                tabItem = instantiate(this.casePrefab)
                this.createContainerView(tabItem, groupId, show)
                
                let tabItemView = gain(tabItem, DebugItemDefault)
                this.initGroupTab(tabItemView, this.TabParent, show, {
                    name: groupId,
                    group: groupId,
                    tapCb: (data: ICaseData) => this.tapCatgeory(tabItem)
                })
            }

            // 创建 每 组对应的测试用例；
            mGroup.forEach((debugItem, key) => { 
                let debugCfg = tea.debug.getDebugPrefab(groupId) 
                let casePrefab = debugCfg?.caseItem || this.casePrefab
                let node = instantiate(casePrefab)
                let comp: DebugItemBase = node.getComponent(debugCfg?.caseItemComp || DebugItemBase) || node.addComponent(DebugItemBase)
                let container:DebugContainer = gain(this.mNodeCategory.get(tabItem), debugCfg?.containerComp || DebugContainer)
                comp.initData(debugItem, container)
            })
        })
    }

    createContainerView(tabItem: Node, groupId: string, first: boolean) { 
        let container = tea.debug.getDebugPrefab(groupId)?.container || this.ContainerPrefab
        
        let groupNode = instantiate(container)
        groupNode.parent = this.ContainerParent
        groupNode.active = first
        this.mNodeCategory.set(tabItem, groupNode)
        return groupNode
    }

    public tapCatgeory(tabItem: Node) { 
        this.mNodeCategory.forEach((value, key) => { 
            let click = (tabItem == key)
            value.active = click
            let debugItem = gain(key, DebugItemDefault)
            debugItem.setDark(click)
            click && (this.showGroup = debugItem.TxtName.string)
        })
        return this.showGroup
    }

    show(groupId?: string) { 
        this.Root.active = true
        if (!groupId || this.showGroup != groupId) return
        this.showGroup = groupId
         this.tapCatgeory(this.TabParent.getChildByName(groupId))
    }

    hide() { 
        this.Root.active = false
    }


}