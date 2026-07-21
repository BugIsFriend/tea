


namespace std { 
    export class stack<T> { 

        private list: Array<T> = [];
        
        constructor(items?: T|Array<T>) { 
            if (!items) return;
            this.push(items)
        }

        public push(items?: T|Array<T>) { 
            if (Array.isArray(items)) items.forEach(item => this.list.push(item))
            else this.list.push(items)
        }

        public size():number { 
          return this.list.length
        }

        public top(): T { 
            return this.list[this.topIdx()]
        }

        public pop(): T{ 
            if (this.empty()) { 
                console.warn(' the stack is  empty !')
                return
            }
            let top = this.top()
            this.list.splice(this.topIdx(), 1)
            return top;
        }

        public empty():boolean { 
            return this.list.length  <= 0
        }

        protected topIdx():number {
            return this.list.length -1
        }

    }
}

export { }