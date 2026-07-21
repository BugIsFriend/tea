

export namespace std { 

    export class stack<T> { 

        private elements: Array<T>;
        
        constructor(element?: T[]) { 
            this.elements = [];
            if (element && element.length != 0) {
                this.push(...element)
            }
        }

        public push(...element:T[]) { 
            this.elements.push(...element)
        }

        public size():number { 
          return this.elements.length
        }

        public top(): T { 
            return this.elements[this.topIdx()]
        }

        public pop(): T{ 
            if (this.empty()) throw new Error("stack is null")
            let top = this.top()
            this.elements.splice(this.topIdx(), 1)
            return top;
        }

        public empty():boolean { 
            return this.elements.length  <= 0
        }

        protected topIdx():number {
            return this.elements.length -1
        }

    }
}