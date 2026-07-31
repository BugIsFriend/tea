
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator, CCInteger } from "cc";
import { Heuristic } from "./heuristic";
import { GraphSearch ,GNodeState} from "./graph-search";

const {ccclass,property} = _decorator


@ccclass('GraphSearchAStart')
export class GraphSearchAStart extends GraphSearch { 

    _found: boolean = false

    private searchFrontier: Array<GraphEdge>    //记录更替，从源点到 当前索引节点最优消耗的边
    private shortestPathTree: Array<GraphEdge>  //记录已经是在SPT(最短生成树)中的边

    private gCost: Array<number>   // 开始节点，到指定节点的 边的消耗
    private fCost: Array<number>   // 开始节点，到指定节点的 总消耗(启发因子消耗 + 边的下号)

    public HeuristicCalculator: (graph: GraphComponent, nd1: number, nd2: number) => number = Heuristic.EuclidCalculate
    

    protected start(): void {
        if (this.doSearch) { 
            this.search()
        }
    }

    public initSearch(): void {
        super.initSearch()
    }

    public search() { 
        let pq = new std.queue<{ idx: number, cost: number }>(null, { priority: 'min', compareKey: 'idx' })
        pq.enqueue({ idx: this.sIdx, cost: 0 });
        while (!pq.empty()) {
            let nextClosestNode = pq.dequeue().idx
            this.shortestPathTree[nextClosestNode] = this.searchFrontier[nextClosestNode]
            if (nextClosestNode == this.sIdx) return true;
            
            let edges = this.graph.getEdges(nextClosestNode)
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                let to = edge.to
                
                let hCost =  this.HeuristicCalculator(this.graph, this.tIdx, to) //就按目标点，到当前点的 启发消耗
                let gCost = this.gCost[nextClosestNode] + edge.cost  //就按目标点，到当前点的消耗

                if (!this.searchFrontier[to]) {
                    this.fCost[to] = hCost + gCost
                    this.gCost[to] = gCost
                    pq.enqueue({ idx:to, cost: this.fCost[to] })
                    this.searchFrontier[to] = edge
                } else if ( (this.fCost[to] > hCost + gCost) && !this.shortestPathTree[to]) { 
                    this.fCost[to] = hCost + gCost
                    this.gCost[to] = gCost
                    pq.replaceItem({ idx: to, cost: this.fCost[to]}, (newItem,oldItem)=>newItem.idx == oldItem.idx)
                    this.searchFrontier[to] = edge
                }
            }
        }
        return false
    }

}