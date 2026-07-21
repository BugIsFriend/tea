

import { swap } from "./gizmo";

type Compare<T> = (a: T, b: T) => true

export namespace std {


    export class queue<T, Compare> {
        private list: Array<T> = new Array<T>(1);

        constructor(items?: T[]) { 
            if (!items) return;
            items.forEach(item=>this.enqueue(item))
        }
        
        protected sink(idx:number) {
            while (idx < this.size()) {
                let [l, r] = [idx*2, idx*2+1]
                if (this.list[idx] < this.list[l]) {
                    swap(this.list, idx, l)
                    idx = l
                } else if (this.list[idx] < this.list[r]) {
                    swap(this.list, idx, r)
                    idx = r
                } else { 
                    break;
                }
            }
        }

        protected swim(idx:number) {
            while (idx>1) {
                let [parent, slibing] = [Math.floor(idx/2), idx-1]
                if (this.list[idx] > this.list[parent]) {
                    swap(this.list, parent, idx)
                    idx = parent
                } else if (this.list[slibing] > this.list[parent]) {
                    swap(this.list, slibing, parent)
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

        public enqueue(item: T) { 
            this.list.push(item)
            this.swim(this.size())
        }

        public denqueue() {
            if (this.empty()) return
            let item = this.list[1]
            this.list[1] = this.list[this.size()]
            this.list.pop()
            this.sink(1)
            return item
        }

        public top() {
            if (this.empty()) return
            return this.list[1]
        }


    }
}