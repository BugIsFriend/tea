import { Unit } from "../unit";



enum eVisibility { 
    Position = 1 << 1,       // 显示位置；
    
    BoundingBox = 1<<3,    // 包围盒；
}

/**
 * 测试阶段显示，节点，位置，包围盒；动态追踪物体位置
 * 显示指定向量；
 */
export class Visibility extends Unit { 


}