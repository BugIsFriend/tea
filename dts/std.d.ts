interface stdInterface {
    /**
     * 随机获取一个数，平局分布
     * @param start
     * @param end
     * @param float
     * @returns
     */
    random: typeof std.random;

    /**
     * 交换数组中两个元素的位置
     * @param arr 目标数组
     * @param i 索引1
     * @param j 索引2
     */
    swap: typeof std.swap;

    /**
     * 栈数据结构，遵循后进先出（LIFO）原则
     */
    stack: typeof std.stack;

    /**
     * 队列数据结构，支持普通队列和优先队列两种模式
     * - 普通队列：先进先出（FIFO）
     * - 优先队列：根据优先级出队，支持 max（大顶堆）和 min（小顶堆）
     */
    queue: typeof std.queue;
}

declare namespace std {
        /**
         * 随机获取一个数，平局分布
         * @param start
         * @param end
         * @param float
         * @returns
         */
        function random(start?: number, end?: number, float?: boolean): number;
        /**
         * 交换数组中两个元素的位置
         * @param arr 目标数组
         * @param i 索引1
         * @param j 索引2
         */
        function swap<T>(arr: Array<T>, i: number, j: number): void;
        /**
         * 栈数据结构，遵循后进先出（LIFO）原则
         */
        class stack<T> {
            private list;
            /**
             * 创建一个栈
             * @param items 初始元素
             */
            constructor(items?: T | Array<T>);
            /**
             * 入栈：将一个或多个元素压入栈顶
             * @param items 要入栈的元素
             */
            push(items?: T | Array<T>): void;
            /**
             * 返回栈中元素数量
             */
            size(): number;
            /**
             * 返回栈顶元素（不移除）
             */
            top(): T;
            /**
             * 出栈：移除并返回栈顶元素，栈为空时返回 null
             */
            pop(): T;
            /**
             * 检查栈是否为空
             */
            empty(): boolean;
            protected topIdx(): number;
        }
        /**
         * 队列数据结构，支持普通队列和优先队列两种模式
         * - 普通队列：先进先出（FIFO）
         * - 优先队列：根据优先级出队，支持 max（大顶堆）和 min（小顶堆）
         */
        class queue<T> {
            private option;
            private list;
            /**
             * 创建一个队列
             * @param items 初始元素
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
             * @param idx 要下沉的节点索引
             */
            protected sink(idx: number): void;
            /**
             * 上浮操作（仅优先队列使用），维护堆性质
             * @param idx 要上浮的节点索引
             */
            protected swim(idx: number): void;
            /**
             * 返回队列中元素数量
             */
            size(): number;
            /**
             * 检查队列是否为空
             */
            empty(): boolean;
            /**
             * 从后向前比较队列中每个元素，比较两个元素，如果相同替换两个元素
             * @param item
             * @param equalFunc
             */
            replaceItem(item: T, equalFunc: (newItem: T, oldItem: T) => boolean): void;
            /**
             * 内部入队方法
             * @param item 要入队的元素
             */
            private _enqueue;
            /**
             * 入队：将一个或多个元素加入队列
             * @param items 要入队的元素
             */
            enqueue(items?: T | Array<T>): void;
            /**
             * 出队：移除并返回队首元素，队列为空时返回 undefined
             */
            dequeue(): T;
            /**
             * 返回队首元素（不移除），队列为空时返回 undefined
             */
            top(): T;
        }
}

export default std;
export { std };
export type { stdInterface };
