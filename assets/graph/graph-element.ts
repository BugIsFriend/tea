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
}


@ccclass('NavGraphNode')
export class NavGraphNode extends GraphNode {

    @property({ type: Vec2 }) vec2: Vec2 = new Vec2();

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
    
    @property(CCFloat) cost: number = 1

    constructor(from: number, to: number, cost?:number) { 
        this.from = from;
        this.to = to;
        this.cost = cost?cost:this.cost
    }

    public get from() : number {
        return this.from
    }

    public set from(from : number) {
        this.from = from;
    }

    public get to() : number {
        return this._to
    }

    public set to(to : number) {
        this._to = to;
    }
    
    public get Cost() : number {
        return this.cost
    }

    public set Cost(cost : number) {
        this.cost = cost;
    }
    
    public equalTo(from: number, to: number) { 
        return this.from == from && this.to == to
    }
}


