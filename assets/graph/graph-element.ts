import { _decorator, CCFloat, CCInteger, Vec2, Vec3} from 'cc';
const { ccclass, property } = _decorator;

export const invalid_node_idx = -1;

@ccclass('GraphNode')
export class GraphNode {
    @property(CCInteger) idx: number = invalid_node_idx;

    constructor(idx: number) {
        this.idx = idx;
    }

    public get Index(): number {
        return this.idx;
    }

    public set Index(idx: number) {
        this.idx = idx;
    }

    // 判断是无效节点
    public isInvalid() { 
        return this.idx == invalid_node_idx
    }

    data: object = null;
    getData<T>(): T { 
        //@ts-ignore
        return this.data
    }
}

@ccclass('GraphEdge')
export class GraphEdge { 

    @property(CCInteger) _from:number = invalid_node_idx
    @property(CCInteger) _to: number = invalid_node_idx
    
    @property(CCFloat) _cost: number = 1

    constructor(from: number, to: number, cost?: number) { 
        this.from = from;
        this.to = to;
        this._cost = cost?cost:this._cost
    }

    public get from() : number {
        return this._from
    }

    public set from(from : number) {
        this._from = from;
    }

    public get to() : number {
        return this._to
    }

    public set to(to : number) {
        this._to = to;
    }
    
    public get cost() : number {
        return this._cost
    }

    public set cost(cost : number) {
        this._cost = cost;
    }
    
    public equalTo(from: number, to: number) { 
        return this.from == from && this.to == to
    }
}


