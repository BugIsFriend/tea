interface stdInterface {
    /**
     * 随机获取一个数，均匀分布
     *
     * ```
     *  start ─────────────────── end
     *  [start, end) 区间内等概率取值
     * ```
     *
     * @param start 随机区间的起始值（包含），默认 0
     * @param end 随机区间的结束值（不包含），默认 1
     * @param float 是否返回浮点数，true 返回浮点数，false 返回向下取整的整数，默认 true
     * @returns 区间 [start, end) 内的一个随机数
     */
    random: typeof std.random;

    /**
     * 交换数组中两个元素的位置
     *
     * ```
     *  交换前: [ A, B, C, D ]
     *               ↑  ↑
     *               i  j
     *
     *  交换后: [ A, C, B, D ]
     * ```
     *
     * @param arr 目标数组
     * @param i 索引1（要交换的第一个元素下标）
     * @param j 索引2（要交换的第二个元素下标）
     * @returns 无返回值，原地修改数组
     */
    swap: typeof std.swap;

    /**
     * 栈数据结构，遵循后进先出（LIFO）原则
     *
     * ```
     *   栈顶(top) ──┐
     *               ▼
     *     ┌─────────────┐
     *     │      C      │  ← 最后入栈，最先出栈
     *     ├─────────────┤
     *     │      B      │
     *     ├─────────────┤
     *     │      A      │
     *     └─────────────┘
     *    栈底(bottom)
     * ```
     *
     * 入栈（push）与出栈（pop）都发生在栈顶一端。
     */
    stack: typeof std.stack;

    /**
     * 队列数据结构，支持普通队列和优先队列两种模式
     * - 普通队列：先进先出（FIFO）
     * - 优先队列：根据优先级出队，支持 max（大顶堆）和 min（小顶堆）
     *
     * 普通队列（FIFO）：
     * ```
     *  出队(dequeue) ←─┐               ┌─ 入队(enqueue)
     *                   ▼               │
     *      ┌─────┬─────┬─────┬─────┐
     *      │  A  │  B  │  C  │  D  │
     *      └─────┴─────┴─────┴─────┘
     *      队首(front)          队尾(rear)
     * ```
     *
     * 优先队列（大顶堆）：
     * ```
     *                  [ 9 ]
     *                 /     \
     *              [ 7 ]   [ 5 ]
     *              /   \   /
     *            [ 3 ] [ 1 ]
     * ```
     */
    queue: typeof std.queue;
}

declare namespace std {
        /**
         * 随机获取一个数，均匀分布
         *
         * ```
         *  start ─────────────────── end
         *  [start, end) 区间内等概率取值
         * ```
         *
         * @param start 随机区间的起始值（包含），默认 0
         * @param end 随机区间的结束值（不包含），默认 1
         * @param float 是否返回浮点数，true 返回浮点数，false 返回向下取整的整数，默认 true
         * @returns 区间 [start, end) 内的一个随机数
         */
        function random(start?: number, end?: number, float?: boolean): number;
        /**
         * 交换数组中两个元素的位置
         *
         * ```
         *  交换前: [ A, B, C, D ]
         *               ↑  ↑
         *               i  j
         *
         *  交换后: [ A, C, B, D ]
         * ```
         *
         * @param arr 目标数组
         * @param i 索引1（要交换的第一个元素下标）
         * @param j 索引2（要交换的第二个元素下标）
         * @returns 无返回值，原地修改数组
         */
        function swap<T>(arr: Array<T>, i: number, j: number): void;
        /**
         * 栈数据结构，遵循后进先出（LIFO）原则
         *
         * ```
         *   栈顶(top) ──┐
         *               ▼
         *     ┌─────────────┐
         *     │      C      │  ← 最后入栈，最先出栈
         *     ├─────────────┤
         *     │      B      │
         *     ├─────────────┤
         *     │      A      │
         *     └─────────────┘
         *    栈底(bottom)
         * ```
         *
         * 入栈（push）与出栈（pop）都发生在栈顶一端。
         */
        class stack<T> {
            private list;
            /**
             * 创建一个栈
             * @param items 初始元素，可以是单个元素或元素数组，会按顺序压入栈中
             */
            constructor(items?: T | Array<T>);
            /**
             * 入栈：将一个或多个元素压入栈顶
             *
             * ```
             *   push(C):  [ A, B ]  ──►  [ A, B, C ]
             *                                 ↑
             *                               栈顶
             * ```
             *
             * @param items 要入栈的元素，可以是单个元素或元素数组
             * @returns 无返回值
             */
            push(items?: T | Array<T>): void;
            /**
             * 返回栈中元素数量
             * @returns 栈中元素的个数
             */
            size(): number;
            /**
             * 返回栈顶元素（不移除）
             * @returns 栈顶元素；栈为空时返回 undefined
             */
            top(): T;
            /**
             * 出栈：移除并返回栈顶元素
             *
             * ```
             *   pop():  [ A, B, C ]  ──►  [ A, B ]  返回 C
             *                ↑
             *              栈顶
             * ```
             *
             * @returns 被移除的栈顶元素；栈为空时返回 null
             */
            pop(): T;
            /**
             * 检查栈是否为空
             * @returns 栈为空返回 true，否则返回 false
             */
            empty(): boolean;
            /**
             * 返回栈顶元素的索引（内部方法）
             * @returns 栈顶元素在底层数组中的下标
             */
            protected topIdx(): number;
        }
        /**
         * 队列数据结构，支持普通队列和优先队列两种模式
         * - 普通队列：先进先出（FIFO）
         * - 优先队列：根据优先级出队，支持 max（大顶堆）和 min（小顶堆）
         *
         * 普通队列（FIFO）：
         * ```
         *  出队(dequeue) ←─┐               ┌─ 入队(enqueue)
         *                   ▼               │
         *      ┌─────┬─────┬─────┬─────┐
         *      │  A  │  B  │  C  │  D  │
         *      └─────┴─────┴─────┴─────┘
         *      队首(front)          队尾(rear)
         * ```
         *
         * 优先队列（大顶堆）：
         * ```
         *                  [ 9 ]
         *                 /     \
         *              [ 7 ]   [ 5 ]
         *              /   \   /
         *            [ 3 ] [ 1 ]
         * ```
         */
        class queue<T> {
            private option;
            private list;
            /**
             * 创建一个队列
             * @param items 初始元素，可以是单个元素或元素数组
             * @param option 配置项，传入则创建优先队列，不传则创建普通队列（FIFO）
             * @param option.priority 优先队列类型：'max' 大顶堆（默认），'min' 小顶堆
             * @param option.compareKey 比较时使用的对象属性名
             */
            constructor(items?: T | Array<T>, option?: {
                priority?: 'max' | 'min';
                compareKey?: string;
            });
            /**
             * 下沉操作（仅优先队列使用），维护堆性质
             *
             * ```
             *           [ 1 ]          ← 不满足堆性质，向下调整
             *           /   \
             *        [ 7 ] [ 5 ]      ← 与较大的子节点交换
             *
             *  下沉后： [ 7 ]
             *           /   \
             *        [ 1 ] [ 5 ]
             * ```
             *
             * @param idx 要下沉的节点索引
             */
            protected sink(idx: number): void;
            /**
             * 上浮操作（仅优先队列使用），维护堆性质
             *
             * ```
             *              [ 7 ]
             *              /   \
             *           [ 9 ] [ 5 ]   ← 新插入的 9 大于父节点 7，向上调整
             *
             *  上浮后：  [ 9 ]
             *              /   \
             *           [ 7 ] [ 5 ]
             * ```
             *
             * @param idx 要上浮的节点索引
             */
            protected swim(idx: number): void;
            /**
             * 返回队列中元素数量
             * @returns 队列中元素的个数
             */
            size(): number;
            /**
             * 检查队列是否为空
             * @returns 队列为空返回 true，否则返回 false
             */
            empty(): boolean;
            checkEnqueue(item: T, equalFunc: (newItem: T, oldItem: T) => boolean): boolean;
            /**
             * 从后向前比较队列中每个元素，若存在与给定元素「相等」的元素则替换它
             * @param item 新元素，用于替换队列中判定为相等的旧元素
             * @param equalFunc 相等判定函数，返回 true 表示两个元素视为相等
             */
            replaceItem(item: T, equalFunc: (newItem: T, oldItem: T) => boolean): boolean;
            /**
             * 内部入队方法（由 enqueue 调用）
             * @param item 要入队的元素
             */
            private _enqueue;
            /**
             * 入队：将一个或多个元素加入队列
             *
             * ```
             *   enqueue(E):  [ A, B, C, D ]  ──►  [ A, B, C, D, E ]
             *                                             ↑
             *                                           队尾
             * ```
             *
             * @param items 要入队的元素，可以是单个元素或元素数组
             */
            enqueue(items?: T | Array<T>): void;
            /**
             * 出队：移除并返回队首元素
             *
             * ```
             *   dequeue():  [ A, B, C, D ]  ──►  [ B, C, D ]  返回 A
             *                 ↑
             *               队首
             * ```
             *
             * @returns 被移除的队首元素；队列为空时返回 undefined
             */
            dequeue(): T;
            /**
             * 返回队首元素（不移除）
             * @returns 队首元素；队列为空时返回 undefined
             */
            top(): T;
        }
}

export default std;
export { std };
export type { stdInterface };
