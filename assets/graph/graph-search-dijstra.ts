
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator, CCInteger } from "cc";
import { Heuristic } from "./heuristic";
import { Unit } from "../tea/unit";
import { GraphSearch ,GNodeState} from "./graph-search";

const {ccclass,property} = _decorator

/**
 * 从源头节点到目标节点的路径有很多种，选择一条最有路径
 */
@ccclass('GraphSearchDijstra')
class GraphSearchDijstra extends GraphSearch { 

    _found: boolean = false

    private gCost: Array<number>       //保存从源点到 当前给定索引的节点的最优消耗

    private searchFrontier: Array<GraphEdge>    //记录更替，从源点到 当前索引节点最优消耗的边
    private shortestPathTree: Array<GraphEdge>  //记录已经是在SPT(最短生成树)中的边
    
    public initSearch() { 
        super.initSearch()
        this.gCost = new Array<number>(this.graph.numNodes()).fill(0)
        this.searchFrontier = new Array<GraphEdge>(this.graph.numNodes())
        this.shortestPathTree = new Array<GraphEdge>(this.graph.numNodes())
        this._found = this.search()
    }

    public search() {
        let pq = new std.queue<{ idx: number, cost: number }>(null, { priority: 'min', compareKey: 'cost' })
        pq.enqueue({ idx: this.sIdx, cost: 0 })
        while (!pq.empty()) {
            let {idx} = pq.dequeue();  
            this.shortestPathTree[idx] = this.searchFrontier[idx]
            if (idx == this.tIdx) return true;
            
            let edges = this.graph.getEdges(idx);
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];

                let newCost = this.gCost[edge.from] + edge.to;

                if (this.searchFrontier[edge.to] == null) {
                    this.gCost[edge.to] = edge.cost
                    pq.enqueue({ idx: edge.to, cost: edge.cost })
                    this.searchFrontier[edge.to] = edge
                } else if (newCost < this.gCost[edge.to] && this.shortestPathTree[edge.to] == null) { 
                    this.gCost[edge.to] = newCost
                    pq.replaceItem({ idx: edge.to, cost: newCost }, (newItem, oldItem) => newItem.idx == oldItem.idx)
                    this.searchFrontier[edge.to] = edge
                }
            }
        }
        return false
    }

    public getSPT() { 
        return this.shortestPathTree
    }

    public getCostToTarget():number{ 
        return this.getCostToNode(this.tIdx)
    }

    public getCostToNode(nIdx: number) { 
        return this.gCost[nIdx]
    }
    
    public getPathToTarget() { 
        let path = []
        if (!this.found || this.tIdx < 0) return 

        let preIdx = this.tIdx
        path.unshift(preIdx)

        while (preIdx != this.sIdx && this.shortestPathTree[preIdx] != null) {
            preIdx = this.shortestPathTree[preIdx].from
            path.unshift(preIdx) 
        }
        return path
    }
}
