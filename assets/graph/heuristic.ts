// A-start 算法启发启发因子函数

import { Vec3 } from "cc";
import { GraphComponent } from "./graph-component";

// 启发因子
export class Heuristic {

    // 欧几里距离启发因子；
    static EuclidCalculate(graph:GraphComponent, nd1:number, nd2:number) { 

        //@ts-ignore
        let pos1:Vec3 = graph.getNode(nd1).position
        //@ts-ignore
        let pos2: Vec3 = graph.getNode(nd2).position
        
        return Vec3.distance(pos1,pos2)

    }

    // 曼哈顿距离启发因子计算
    static ManhattanCalcute(graph: GraphComponent, nd1: number, nd2: number) { 
        // 计算出很坐标，纵坐标
    }
}