
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator, CCBoolean, CCInteger, CCString, Label } from "cc";
import { Unit } from "../tea/unit";

const {ccclass,property,requireComponent} = _decorator

export enum GNodeState { 
    visited = -1,
    unvisited = -2,
    no_parent_assigned = -3
}

@ccclass
@requireComponent(GraphComponent)
export abstract class GraphSearch extends Unit {
    @property({type:CCInteger, tooltip: "起始节点索引"}) sIdx: number      
    @property({type:CCInteger, tooltip: "目标节点索引"}) tIdx: number = -1

    @property(CCBoolean) doSearch: boolean = false
    
    @property({visible(){ return this.doSearch}}) stRoute:string = ""

    _found: boolean = false    
    visited: Array<number> 
    route: Array<number>  = []


    spanningTree: Array<GraphEdge> = []
    
    public found() { return this._found }

    public get graph(){ return this.getComponent(GraphComponent)}

    protected onLoad(): void {
        if (!!this.sIdx && this.tIdx != -1) { 

        }
    }

    public getPathToTarget() { 
        let path = []
        if (!this.found || this.tIdx < 0) return 

        let preIdx = this.tIdx
        path.unshift(preIdx)

        while (preIdx != this.sIdx) {
            preIdx = this.route[preIdx]
            path.unshift(preIdx) 
        }
        return path
    }


    initSearch() { 
        this.visited = new Array<number>(this.graph.numNodes()).fill(GNodeState.visited)
        this.route = new Array<number>(this.graph.numNodes()).fill(GNodeState.no_parent_assigned)

    }
}

// 深度优先算法
