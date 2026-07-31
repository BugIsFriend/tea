
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator, CCInteger } from "cc";
import { GraphSearch ,GNodeState} from "./graph-search";

const {ccclass,property} = _decorator

// 广度优先算法；
@ccclass('GraphSearchBFS')
class GraphSearchBFS extends GraphSearch { 

    public initSearch() { 
        super.initSearch()
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
