
import { gizmo } from "./gizmo"

type Comparator<T> = (a: T, b: T, key?:string, priority?:'great'|'small') => boolean

function greater<T>(a: T, b: T, key?:string, priority?: 'great' | 'small'): boolean {
    priority = priority || 'great' 
    if (!key) return priority == 'great' ? a > b : a < b
    else return priority == 'great' ? a[key] > b[key] : a[key] < b[key]
}
namespace std {
    export class queue<T> {
        private compare:Comparator<T> = null
        private list: Array<T> = new Array<T>(1);

        /**
         * 队列
         * @param items 构建元素
         * @param compare compare = null 就是一个先进先出队列, 非空就是优先队列
         * @returns 
         */
        constructor(items?: T|Array<T>, compare?:Comparator<T> ) { 
            if (!items) return;
            this.enqueue(items)
            this.compare = compare
        }
        
        protected sink(idx:number) {
            while (idx * 2 <= this.size()) {
                let [l, r] = [idx * 2, idx * 2 + 1]
                let target = l
                if (r <= this.size() && this.compare(this.list[r], this.list[l])) {
                    target = r
                }
                if (this.compare(this.list[target], this.list[idx])) {
                    gizmo.swap(this.list, idx, target)
                    idx = target
                } else {
                    break
                }
            }
        }

        protected swim(idx:number) {
            while (idx>1) {
                let [parent, slibing] = [Math.floor(idx / 2), idx - 1]
                let compare = this.compare || greater
                if (compare(this.list[idx], this.list[parent])) {
                    gizmo.swap(this.list, parent, idx)
                    idx = parent
                } else if (compare(this.list[slibing], this.list[parent])) {
                    gizmo.swap(this.list, slibing, parent)
                    idx = parent
                } else { 
                    break;
                }
            }
        }

        public size() {
            return this.list.length - 1
        }

        public empty(): boolean {
            return this.size() == 0
        }

        private _enqueue(item: T) { 
            this.list.push(item)
            if(!!this.compare) this.swim(this.size())
        }

        public enqueue(items?: T | Array<T>) { 
            if (Array.isArray(items))  items.forEach(item => this._enqueue(item))
            else this._enqueue(items)
        }

        public denqueue<T>(){
            if (this.empty()) { 
                console.warn(' the queue is  empty !')
                return
            }

            let item = this.list[1]
            if (!!this.compare) {
                this.list[1] = this.list[this.size()]
                this.list.pop()
                this.sink(1)
            } else { 
                this.list.splice(1,1)
            }
            return item
        }

        public top<T>() {
            if (this.empty()) { 
                console.warn(' the queue is  empty !')
                return
            }
            return this.list[1]
        }
    }
}

export { std }