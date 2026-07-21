import { _decorator, CCBoolean, Component, log, Node, TextAsset } from 'cc';
import { GraphEdge, GraphNode, invalid_node_idx, NavGraphNode } from './graph-element';
import { extend } from '../../dts/lodash';
const { ccclass, property } = _decorator;

@ccclass('GraphComponent')
export class GraphComponent extends Component {
    
    nodes: Array<GraphNode> = [];           // 组成图的所有节点；
    edgesVec: Array<Array<GraphEdge>> = [];    // 组成

    nextNodeIndex: number = 0;

    @property(CCBoolean) bGigraph;          // 是否为有向图；
    @property(TextAsset) assetInfo:TextAsset = null   // node 和 Edge 文本信息；    

    /**
     */
    public getNode<T extends GraphNode>(idx: number): T{
        //@ts-ignore
        return this.nodes[idx];
    }

    public getEdge<T extends GraphEdge>(from:number, to:number):T{ 
        let edges = this.edgesVec[from] ||[]
        
        for (let i = 0; i < edges.length; i++) {
            const edge: GraphEdge = edges[i];
            if (edge.to == to) { 
                // @ts-ignore
                return edge;
            }
        }
        log('没有找到目标 Edge')
    }

    public getEdges(from: number) { 
        return this.edgesVec[from] || []
    }

    public getNextFreeNodeIndex() { 
        return this.nextNodeIndex;
    }

    public addNode<T extends GraphNode, E extends GraphEdge>(node: T): number {
       
        if (node.isInvalid()) { 
            console.warn('节点索引号无效')
            return
        }

        if (node.Index == this.nextNodeIndex) {
            console.warn('节点已被加入图中')
            return
        }
    
        if (node.Index < this.nodes.length) {
            this.nodes[node.Index] = node;
            return this.nextNodeIndex 
        } else { 
            this.nodes.push(node);
            this.edgesVec.push(new Array<E>())
            return this.nextNodeIndex++
        }
    }

    public removeNode(idx: number) {
        this.nodes[idx].Index = invalid_node_idx;

        if (!this.isDigraph) {
            let rEdges = this.edgesVec[idx]
            for (let i = 0; i < rEdges.length; i++) {
                const toIdx = rEdges[i].To;
                for (let j = 0; j < this.edgesVec[toIdx].length; j++) {
                    if (this.edgesVec[toIdx][j].To == idx) {
                        this.edgesVec[toIdx].splice(j, 1)
                        break;
                    }
                }
            }
            this.edgesVec[idx] = []
        } else { 
            this.cullInvalidEdges()
        }
    }

    public addEdge<E extends GraphEdge>(edge: E) {
        if (!this.nodes[edge.From].isInvalid() && !this.nodes[edge.To].isInvalid()) { 
            if (this.isUniqueEdge(edge)) { 
                this.edgesVec[edge.from].push(edge)
            }

            if (!this.bGigraph) { 
                let nEdge = new GraphEdge(edge.to, edge.From);
                this.edgesVec[nEdge.to].push(nEdge);
            }
        }
     }

    public removeEdge(from: number, to: number) {
        if (!this.bGigraph) { 
            for (let i = 0; i < this.edgesVec[to].length; i++) {
                const edges = this.edgesVec[to];
                _.remove(edges, (edge) => edge.equalTo(to,from))
            }
        }

        
        for (let i = 0; i < this.edgesVec[from].length; i++) {
            const edges = this.edgesVec[from];
            _.remove(edges, (edge) => edge.equalTo(from,to))
        }
    }

    public numNodes(): number { return this.nodes.length }

    public numberActiveNodes(): number{ 
        return this.nodes.filter(node=>!node.isInvalid()).length
    }
    
    public numEdges(): number { 
        let total = 0
        for (const edges of this.edgesVec) {
            total += edges.length;
        }
        return total;
    }

    public isDigraph() { return this.bGigraph }
    
    public isEmpty() { return this.nodes.length == 0 }

    // node 是否存在
    public isNodePresent(nIdx: number) { 
        if (nIdx >= this.nodes.length || this.nodes[nIdx].idx == invalid_node_idx) { 
            return false;
        }
        return true;
    }

    // 边是否存在
    public isEdgePresent(from: number, to: number) { 
        if (this.isNodePresent(from) && this.isNodePresent(to)) { 
            let edges = this.edgesVec[from]
            for (let i = 0; i < edges.length; i++) {
                if (edges[i].To == to) return true;
            }
        }
        return false;
    }

    // 删除/切掉无效边
    public cullInvalidEdges() { 
        for (let i = 0; i < this.edgesVec.length; i++) {
            _.remove(this.edgesVec[i], (edge) => { 
                return this.nodes[edge.From].isInvalid() || this.nodes[edge.To].isInvalid()
            })
        }
    }

    public isUniqueEdge<E extends GraphEdge>(edge: E) { 
        let edges = this.edgesVec[edge.From]
        for (let i = 0; i < edges.length; i++) {
            const tempEdge = edges[i];
            if (edge.To == tempEdge.To) { 
                return false;
            }
        }
        return true;
    }

    public setEdgeCost(from: number, to: number, newCost: number) {
        let edges = this.edgesVec[from];
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].equalTo(from, to)) { 
                edges[i].Cost = newCost;
                break;
            }    
        }
    }

    // 根据 JSON数据 构造 graph
    public load(gData: { NumNodes: number, edgesVecLike:Array<{from:number,to:number,cost?:number}> }) {
        
        let { NumNodes, edgesVecLike} = gData;
        
        for (let n = 0; n < NumNodes; ++n)
        {
            let node = new GraphNode(n);
            if (node.isInvalid())
            {
                this.addNode(node)
            }else
            {
                this.nodes.push(node)
                this.edgesVec.push([])
                ++this.nextNodeIndex;
            }
        }

        for (let i = 0; i < edgesVecLike.length; i++) {
            const {from,to,cost} = edgesVecLike[i];
            let edge = new GraphEdge(from, to, cost)
            this.addEdge(edge)
        }
        return true;
    }


    public clear() { 
        this.nextNodeIndex = 0;
        this.nodes = [];
        this.edgesVec = []
    }
}

