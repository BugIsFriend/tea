interface stdInterface {
    random: typeof std.random;
    swap: typeof std.swap;
    stack: typeof std.stack;
    queue: typeof std.queue;
}

declare namespace std {
        function random(start?: number, end?: number, float?: boolean): number;
        function swap<T>(arr: Array<T>, i: number, j: number): void;
        class stack<T> {
            private list;
            constructor(items?: T | Array<T>);
            push(items?: T | Array<T>): void;
            size(): number;
            top(): T;
            pop(): T;
            empty(): boolean;
            protected topIdx(): number;
        }
        class queue<T> {
            private option;
            private list;
            /**
             * 队列
             * @param items 构建元素
             * @param compare compare = null 普通队列, 非空就是优先队列
             * @returns
             */
            constructor(items?: T | Array<T>, option?: {
                priority?: 'max' | 'min';
                compareKey?: string;
            });
            protected sink(idx: number): void;
            protected swim(idx: number): void;
            size(): number;
            empty(): boolean;
            private _enqueue;
            enqueue(items?: T | Array<T>): void;
            denqueue(): T;
            top(): T;
        }
}

export default std;
export { std };
export type { stdInterface };
