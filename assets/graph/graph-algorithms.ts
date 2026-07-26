import { min } from "../../dts/lodash";
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator } from "cc";
import { Heuristic } from "./heuristic";


const {ccclass} = _decorator

enum GNodeState { 
    visited = -1,
    unvisited = -2,
    no_parent_assigned = -3
}
abstract class  SearchAglo {
    
    graph: GraphComponent
    
    visited: Array<number> 

    route: Array<number>  = []

    sIdx: number
    tIdx: number = -1
    _found: boolean = false

    spanningTree: Array<GraphEdge> = []
    
    public found() { return this._found }

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

    constructor(graph: GraphComponent, sIdx: number, tIdx: number = -1) { 
        this.graph = graph
        this.sIdx = sIdx
        this.tIdx = tIdx
        this.visited = new Array<number>(graph.numNodes()).fill(GNodeState.visited)
        this.route = new Array<number>(graph.numNodes()).fill(GNodeState.no_parent_assigned)
    }
}

// 深度优先算法
@ccclass  
class GraphSearchDFS extends SearchAglo { 
    
    constructor(graph: GraphComponent, sIdx: number, tIdx: number = -1) { 
        super(graph, sIdx, tIdx)
        this._found = this.search()
    }

    public search() { 
        
        // 从 起点 到 起点 的哑边，没有作用；
        let dummy_edge: GraphEdge = new GraphEdge(this.sIdx, this.sIdx, 0);

        let stack = new std.stack<GraphEdge>(dummy_edge)
        
        while (!stack.empty()) {
            const next = stack.pop();
            this.route[next.to] = next.from;
            
            this.visited[next.to] = GNodeState.visited
            if (next.to == this.tIdx) { 
                return true;
            }

            if (next != dummy_edge) { 
                this.spanningTree.push(next)
            }

            let edges = this.graph.getEdges(next.from)
            for (const edge of edges) {
                if (this.visited[edge.to] == GNodeState.unvisited) { 
                    stack.push(edge)
                }
            }
        }
        return false
    }

    public getSearchTree() { 
        return this.spanningTree
    }
}

// 广度优先算法；
@ccclass
class GraphSearchBFS extends SearchAglo { 

    constructor(graph: GraphComponent, sIdx: number, tIdx: number = -1) { 
        super(graph, sIdx, tIdx)
        this._found = this.search()
    }

    search() { 
        let dummy_edge = new GraphEdge(this.sIdx, this.sIdx, 0);
        let queue = new std.queue(dummy_edge)
        
        this.visited[dummy_edge.to] = GNodeState.visited
        
        while (!queue.empty()) {
            let edge = queue.dequeue()

            this.route[edge.to] = edge.from

            if (this.tIdx == edge.to) return true

            let edges = this.graph.getEdges(edge.from);

            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];
                if (this.visited[edge.to] == GNodeState.unvisited) { 
                    queue.enqueue(edge)
                    this.visited[edge.to] = GNodeState.visited
                }
            }
        }
        return false
    }
}

/**
 * 从源头节点到目标节点的路径有很多种，选择一条最有路径
 */
@ccclass
class GraphSearchDijstra extends SearchAglo { 

    private costToThisNode: Array<number>       //保存从源点到 当前给定索引的节点的最优消耗

    private searchFrontier: Array<GraphEdge>    //记录更替，从源点到 当前索引节点最优消耗的边
    private shortestPathTree: Array<GraphEdge>  //记录已经是在SPT(最短生成树)中的边
    
    public constructor(graph: GraphComponent, sIdx: number, tIdx: number = -1) { 
        super(graph, sIdx, tIdx)
        this.costToThisNode = new Array<number>(this.graph.numNodes()).fill(0)
        this.searchFrontier = new Array<GraphEdge>(this.graph.numNodes())
        this.shortestPathTree = new Array<GraphEdge>(this.graph.numNodes())
    }

    public search() {
        let pq = new std.queue<{ idx: number, cost: number }>(null, { priority: 'min', compareKey: 'cost' })
        pq.enqueue({ idx: this.sIdx, cost: 0 })
        while (!pq.empty()) {
            let {idx} = pq.dequeue();  
            this.shortestPathTree[idx] = this.searchFrontier[idx]
            if (idx == this.tIdx) return;
            
            let edges = this.graph.getEdges(idx);
            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i];

                let newCost = this.costToThisNode[edge.from] + edge.to;

                if (this.searchFrontier[edge.to] == null) {
                    this.costToThisNode[edge.to] = edge.cost
                    pq.enqueue({ idx: edge.to, cost: edge.cost })
                    this.searchFrontier[edge.to] = edge
                } else if (newCost < this.costToThisNode[edge.to] && this.shortestPathTree[edge.to] == null) { 
                    this.costToThisNode[edge.to] = newCost
                    pq.replaceItem({ idx: edge.to, cost: newCost }, (newItem, oldItem) => newItem.idx == oldItem.idx)
                    this.searchFrontier[edge.to] = edge
                }
            }
        }
    }

    public getSPT() { 
        return this.shortestPathTree
    }

    public getCostToTarget():number{ 
        return this.getCostToNode(this.tIdx)
    }

    public getCostToNode(nIdx: number) { 
        return this.costToThisNode[nIdx]
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

@ccclass
class GraphSearchAStart extends SearchAglo { 

    private searchFrontier: Array<GraphEdge>    //记录更替，从源点到 当前索引节点最优消耗的边
    private shortestPathTree: Array<GraphEdge>  //记录已经是在SPT(最短生成树)中的边

    private gCost: Array<number>   // 开始节点，到指定节点的 边的消耗
    private fCost: Array<number>   // 开始节点，到指定节点的 总消耗(启发因子消耗 + 边的下号)

    public HeuristicCalculator:(graph:GraphComponent, nd1:number, nd2:number)=>number = Heuristic.EuclidCalculate

    public search() { 
        let pq = new std.queue<{ idx: number, cost: number }>(null, { priority: 'min', compareKey: 'idx' })
        pq.enqueue({ idx: this.sIdx, cost: 0 });
        while (!pq.empty()) {
            let nextClosestNode = pq.dequeue().idx
            this.shortestPathTree[nextClosestNode] = this.searchFrontier[nextClosestNode]
            if (nextClosestNode == this.sIdx) return 
            
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
    }

}