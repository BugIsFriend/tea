
import { std } from "../std/stack";
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator } from "cc";

const {ccclass} = _decorator

enum GNodeState { 
    visited,
    unvisited,
    no_parent_assigned
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
        super( graph, sIdx, tIdx )
    }

    public search() { 
        
        // 从 起点 到 起点 的哑边，没有作用；
        let dummy_edge: GraphEdge = new GraphEdge(this.sIdx, this.sIdx, 0);

        let stack: std.stack<GraphEdge> = new std.stack<GraphEdge>([dummy_edge])
        
        while (!stack.empty()) {
            const next = stack.top();
            stack.top();
            this.route[next.To] = next.From;
            
            this.visited[next.To] = GNodeState.visited
            if (next.To == this.tIdx) { 
                return true;
            }

            if (next != dummy_edge) { 
                this.spanningTree.push(next)
            }

            let edges = this.graph.getEdges(next.from)
            for (const edge of edges) {
                if (this.visited[edge.To] == GNodeState.unvisited) { 
                    stack.push(edge)
                }
            }
        }
        return true
    }

    public getSearchTree() { 
        return this.spanningTree
    }
}


// 广度优先算法；
@ccclass
class GraphSearchBFS extends SearchAglo { 

}
