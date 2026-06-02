import { gain } from "../tools";
import { Unit } from "../unit"
import { _decorator, CCInteger,Label,Node ,Prefab, Size, size, UITransform, Color, Sprite, instantiate, EventTouch} from "cc";

const {ccclass,executeInEditMode,property} = _decorator

/**
 *  一个简单的滚轮选择组件，支持数据源和纯数字两种模式； 支持滚轮惯性滚动； 支持滚轮项渐变显示； 支持编辑器预览；
 *  使用时需要设置 content 节点，content 节点上不需要添加任何组件，组件会自动添加 UITransform 组件； content 的锚点需要设置为 (0.5, 0.5)； content 的位置会被组件控制，外部不需要控制 content 的位置；
 *  itemSize 用于设置滚轮项的大小，itemSize 的宽度会被设置到 content 上，itemSize 的高度会被设置到每个滚轮项上； 
 *  pickItemPrefab 用于设置滚轮项的预制体，如果没有设置，组件会自动创建一个包含 Label 和 Sprite 组件的节点作为滚轮项； 
 *  滚轮项的 Label 组件用于显示滚轮项的文本内容，滚轮项的 Sprite 组件用于显示滚轮项的背景颜色； 
 *  可以通过 setData 方法设置滚轮的数据源和文本显示函数；
 *  可以通过 getPicked 方法获取当前选中的数据； 
 *  可以通过 stopImmediately 方法立即停止滚轮的滚动，并且将滚轮停在最近的项上；
 *  可以通过 onTouchStart、onTouchMove、onTouchEnd 方法监听滚轮的触摸事件； 
 *  可以通过 update 方法实现滚轮的惯性滚动效果；
 */
@ccclass
@executeInEditMode
export class PickerView extends Unit {

    @property(CCInteger) sumItem: number = 10
    @property(CCInteger) startItem: number = 1

    @property(Node) content: Node = null
    @property(Prefab) pickItemPrefab: Prefab = null

    @property(Size) itemSize: Size = size(100, 40)

    itemHeight: number = 0
    minY: number = 0
    maxY: number = 0

    _speed: number = 0
    _minimumSpeed: number = 30

    data: any[] = null
    TextFn: (data:any)=>string = null
    

    protected onLoad(): void {
        this.renderData()
    }

    getPicked() {  
        this.stopImmediately()
        let idx = this.getCurIdx()
        return this.data ? this.data[idx] : (this.startItem + idx)
    }

    setData(data: any[], startIdx: number = 0, TextFn: (data:any)=>string = null) {
        this.data = data
        this.sumItem = data.length
        this.startItem = startIdx
        this.TextFn = TextFn
        this.renderData()
    }

    creatItem() { 
        let node = null
        if (!this.pickItemPrefab) {
            let node = new Node()
            let cnode = new Node()
            cnode.parent = node
            
            gain(cnode,Label)
            gain(cnode,UITransform).setContentSize(this.itemSize)
            gain(cnode, Sprite).color = Color.BLACK.clone()
            return node
        } else { 
            node = instantiate(this.pickItemPrefab)
        }
        node.setContentSize(this.itemSize)


        return node
    }

    renderData() { 
        this.startItem = this.startItem < 0 ? 0 : this.startItem
        this.content.removeAllChildren()
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this)  
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)   

        let width = gain(this.content, UITransform).width

        for (let i = 0; i < this.sumItem; i++) {
            let item = this.creatItem()
            let label = item.getComponentInChildren(Label)
            if (this.data && this.data.length > 0) {
                label.string = this.TextFn ? this.TextFn(this.data[i]) : this.data[i].toString()
            } else { 
                label.string = (this.startItem + i).toString()
            }
            this.content.addChild(item)
            width = item.width
            item.x = 0
            this.itemHeight = item.height
        }

        gain(this.content, UITransform).width = width
        this.minY = this.itemHeight/2
        this.maxY = this.itemHeight*(this.sumItem - 0.5)
        this.content.y = this.minY +this.startItem * this.itemHeight
        
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)  
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)

        this.updateItemOpacity()
    }

    validY(y: number) {
        if (y > this.minY && y < this.maxY) {
            return y
        } else { 
            return 0
        }
    }

    stopImmediately() {
        let tarY = this.calculateTarY(0)
        this.content.y = tarY
        this._speed = 0
        this.updateItemOpacity()
    }

    _stime: number = -1
    onTouchStart(event: EventTouch) {
        this._speed = 0
        this._stime = new Date().getTime()      
    }

    onTouchMove(event: EventTouch) {
        let delta = event.getDelta()
        let y = this.content.y + delta.y
        if (this.validY(y) != 0) {
           this.content.y += delta.y
        }
        this.updateItemOpacity()
    }

    onTouchEnd(event: EventTouch) {
        if(this.validY(this.content.y) != 0) {
            if (this.content.y < this.minY) {
                this.content.y = this.minY
            } else if (this.content.y > this.maxY) {
                this.content.y = this.maxY
            }
            // 算出速度；速度衰减； 实现减速效果； 被除数不能为 0
            let deltaTime = (new Date().getTime() - this._stime) / 1000

            // 开启多点触控，可能导致 deltaTime 小于等于 0 被除数为 NAN 问题；
            if (deltaTime <= 0) {
                    this.stopImmediately()
            } else { 
            
                let dt_y = (event.getLocation().y - event.getStartLocation().y)
           
                this._speed = dt_y / deltaTime
                if ( Math.abs(dt_y) < 100) {
                    this._speed =  Math.sin(this._speed)*20  //Math.min(this._speed, 40)
                }

                if (Math.abs(this._speed) < this._minimumSpeed) { 
                    this.stopImmediately()
                }

            }
        }
        this._stime = -1
    }


    getCurIdx(sign: number=0) {
        let idx = Math.floor(this.content.y / this.itemHeight)
        if (sign == 0) { 

        }else if (sign > 0 && this.content.y % this.itemHeight > this.itemHeight/2) {
            idx += 1
        } else if (sign < 0 && this.content.y % this.itemHeight < this.itemHeight/2) {
            idx -= 1
        }
        return this.clamp(idx, 0, this.sumItem-1)
    }

    calculateTarY(sign: number) { 
        let idx = this.getCurIdx(sign)
        return this.minY + idx * this.itemHeight
    }

    // 更新所有项的透明度；

    colors:Color[] = [new Color().fromHEX('#C7C7C7'), new Color().fromHEX('#3D3D3D')]
    updateItemOpacity() {
        let sum = this.content.children.length
        let cIdx = this.getCurIdx()
        for (let i = 0; i < sum; i++) {
            let item = this.content.children[i]
            let distance =  Math.abs(i - cIdx)
            let precent = Math.pow(1 - distance / sum, 10)
            if (i == cIdx) {
                precent = 1
                item.getComponentInChildren(Label).color = this.colors[1]
            } else { 
                item.getComponentInChildren(Label).color = this.colors[0]
                if (Math.abs(distance) == 1) {
                    precent = 0.61
                } else { 
                    precent = 0
                }
            }
            let color =  gain(item, Sprite).color
            gain(item, Sprite).color= new Color(color.r,color.g,color.b, precent * 255)
        }
    }

    approximateEqual(a: number, b: number, epsilon: number = 0.01): boolean {
        return Math.abs(a - b) < epsilon;
    }


    clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, Math.abs(value)));
    }

    _lastUpdate:boolean = false
    update(dt: number) {
        if (this._speed != 0) {
            this._lastUpdate = true
            if (this.validY(this.content.y) == 0) {
                if (this.content.y < this.minY) {
                    this.content.y = this.minY
                } else if (this.content.y > this.maxY) {
                    this.content.y = this.maxY
                }
                this._speed = 0
                this.updateItemOpacity()
                return
            }

            this.content.y += this._speed * dt
            

            let sign = this._speed > 0 ? 1 : -1
            this._speed = sign * this.clamp(this._speed * 0.95, this._minimumSpeed, 1000);

            if (Math.abs(this._speed) <= this._minimumSpeed) {
                let tarY = this.calculateTarY(sign)
                if (this.approximateEqual(this.content.y, tarY, 1)) {
                    this.content.y = tarY
                    this._speed = 0
                }
            }
            this.updateItemOpacity()
        } else { 
            if (this._lastUpdate) { 
                this._lastUpdate = false
                this.updateItemOpacity()
            }
        }
    }
}
