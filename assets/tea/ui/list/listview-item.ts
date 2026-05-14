/**
 * author: myerse.lee
 * created: 2024-09-25 17:10:15
 */
import { _decorator, CCInteger, Enum } from 'cc'
const { ccclass, property } = _decorator

@ccclass('ItemData')
export class ItemData {}

export enum MoveDirection {
    None = 0,
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4
}



export const ItemLayout = Enum({
    Center: 0,
    Left: 1,
    Right: 2,
    Top: 3,
    Bottom: 4
})

@ccclass('ItemParam')
export class ItemParam {
    @property({ type: CCInteger, tooltip: '左边距', visible: false }) left: number = 0
    @property({ type: CCInteger, tooltip: '右边距', visible: false }) right: number = 0
    @property({ type: CCInteger, tooltip: '上边距', visible: false }) top: number = 0
    @property({ type: CCInteger, tooltip: '下边距', visible: false }) bottom: number = 0

    @property({ type: CCInteger, tooltip: '每个item的间隔' }) gap: number = 0
    @property({ type: CCInteger, tooltip: '编辑器中显示数量' }) count: number = 0
    @property({ type: ItemLayout, tooltip: 'item布局' }) layout: number = 0
    @property({ type: [ItemData], tooltip: '编辑器中显示数量', visible: false }) dataList: ItemData[] = []

    init() {
        this.dataList = new Array(this.count)
    }
}
