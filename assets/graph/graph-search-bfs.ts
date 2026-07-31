
import { GraphComponent } from "./graph-component";
import { GraphEdge } from "./graph-element";
import { _decorator, CCInteger } from "cc";
import { Heuristic } from "./heuristic";
import { Unit } from "../tea/unit";
import { GraphSearch ,GNodeState} from "./graph-search";

const {ccclass,property} = _decorator


@ccclass('GraphSearchDFS')
class GraphSearchDFS extends GraphSearch { 
    
    public initSearch() { 
        super.initSearch()
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
