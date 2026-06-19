

// 卷积核

// 均值模糊，但是有方块感(颗粒感，噪音感)
const BoxBlurCore = [
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9],
    [1/9, 1/9, 1/9]
]

// 高斯模糊，中心权重高，边沿权重低; 平滑模糊(去噪音干扰)
const GauBlur = [
    [1/16, 2/16, 1/16],
    [2/16, 4/16, 2/16],
    [1/16, 2/16, 1/16]
]

// 锐化，中心发达5倍，减去周围，边缘更加凸出
const Sharpen = [
    [0, -1,  0],
    [-1, 5, -1],
    [0, -1,  0]
]

// 浮雕(伪3D感): 模拟斜光照射的浮雕感
const Emboss = [
    [-2, -1,  0],
    [-1,  1,  1],
    [0,   1,  2]
]

/**
 * Edge: 实现边沿特效Outline: outline drawing(描边)
 * 
 * edge(边缘)：那些像素值发生显著(dramatically)变化的地方；
 *            用数学描述： 那些图片的梯度(gradient) 非常大
 * 
 * Edge Delection Approach: 计算每个像素颜色变化速率（gradient）
 *                          Fast Change  -> Edge
 *                          Slow Change  -> flat area
 * 
 * Gradient Direction：渐变方向
 *                     Horizontal Gradient:  detect vertical edges(水平方向梯度，识别的是数值方向的边)
 *                     Vertical Gradient:  detect Horizontal edges(水平方向梯度，识别的是数值方向的边)
 * */ 
// SOBEl 检测水平边缘，左侧全负，右侧全正 -> 左右色差越大，值越大； 中间列权中为2，因此中心行对水平梯度贡献更多；
const eHorizontal=[
    [-1, 0,  1],
    [-2, 0,  2],
    [-1, 0,  1]
]
// 检测垂直边缘，
const eVertical=[
    [-1, -2,  -1],
    [ 0,  0,   0],
    [ 1,  2,   1]
]

/**
 * 计算过程：分别与 eHorizontal 和 eVertical 内核卷积 -> 得到两个图案的梯度Gx,Gy -> 合并(Merge): sqr(Gx*Gx + Gy*Gy)
 *
 * 该算法局限： 对噪音非常敏感，噪音也是局部剧烈变化 -> 被无检测为边缘
 * 解决方案： 用高斯模糊去噪，再用 SOBEl -> 导致Canny算法；
 */


/*******  游戏中的特效，背后都是卷积 *******/

/**
 * ! 景深(DOF):   对焦外区域做高斯模糊， 半径=距离函数；
 * ! 动态模糊:     沿运动方向的方向性模糊卷积
 * ! 辉光(Bloom): 提取高亮区域 -> 高斯模糊 -> 累加回原图
 * ! 锐化：       锐化卷积核，增强高频细节 
 * ! 轮廓描边：    对深度/返现做Sobel -> 乘以描边颜色
 * ! SSAO环境遮掩：在法线图上的局部采样分析 
 * 
 */