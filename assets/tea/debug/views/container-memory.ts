import { _decorator, EditBox, find, Layout, ScrollView, UITransform } from 'cc'
import { DebugContainer } from './container'
const { ccclass, property } = _decorator
import { DebugItemBase, formatDisplayData } from './item-base'
import { gain } from '../../tools'
import { DebugGroupType } from '../debug-types'
import { DebugItemMemory } from './item-memory'

@ccclass('DebugContainerMemory')
export class DebugContainerMemory extends DebugContainer {
    @property(EditBox) TxtSearch: EditBox = null
    @property(EditBox) EditBoxMemoryObject: EditBox = null
    @property(EditBox) EditCode: EditBox = null
    curDebugItem: DebugItemMemory = null

    public debugItemParent() {
        return find('ListViewUrl/view/content', this.node)
    }

    public addDebugItem(item: DebugItemBase) {
        super.addDebugItem(item)

        let num = this.debugItemParent().children.length + 1
        let gap = this.debugItemParent().getComponent(Layout)?.spacingY ?? 0
        this.debugItemParent().getComponent(UITransform).height = (item.node.getComponent(UITransform).height + gap) * num
    }

    public setMemoryData(data?: object) {
        this.EditBoxMemoryObject.string = formatDisplayData(this.curDebugItem.caseData.getData())
    }

    public tapModifyMemory() {
        if (!this.curDebugItem) {
            tea.tip.show('请先选择一个 Memory 对象')
            return
        }
        try {
            let data = JSON.parse(this.EditBoxMemoryObject.string, (key, value) => key === 'expire' ? dayjs(value).valueOf() : value)
            this.curDebugItem.caseData?.setData(data)
            let code = this.curDebugItem.caseData?.runCode || ''
            if (!!this.EditCode.string) {
                code += '; ' + this.EditCode.string
            } else if (!code) {
                code = `tea.tip.show('执行提示')`
             }
            eval(code)
        } catch (error) {
            tea.tip.show('修改 Memory 对象失败，请检查输入的 JSON 数据是否正确')
        }
    }

    public tapDebugCase(caseItem: DebugItemMemory) {
        this.curDebugItem = caseItem
        this.setMemoryData(caseItem.caseData.data)
    }

    public onSearchReturn(editBox: EditBox) {
        this.filterCase(editBox.string.trim(), true)
    }

    public tapBtnFilter() {
        this.filterCase(this.TxtSearch.string.trim(), false)
    }

    public updateView(action?: 'delete' | 'tap' | string, caseItem?: DebugItemMemory) {
        switch (action) {
            case 'delete':
                if (!caseItem) return
                tea.debug.removeCase(DebugGroupType.Memory, caseItem.caseData.id)
                caseItem.node.parent = null
                if (this.curDebugItem === caseItem) {
                    this.curDebugItem = null
                    this.setMemoryData()
                }
                this.updateContentHeight()
                break
            case 'tap':
                this.debugItemParent().children.forEach((child) => {
                    let item = gain(child, DebugItemBase)
                    item?.handleTap(item === caseItem)
                })
                if (caseItem) {
                    this.tapDebugCase(caseItem)
                }
                break
        }
    }

    public clear() {
        this.curDebugItem = null
        this.setMemoryData()
    }

    private filterCase(keyword: string, exact: boolean) {
        if (!keyword) {
            this.clear()
            this.debugItemParent().children.forEach((child) => {
                gain(child, DebugItemBase)?.handleTap(false)
            })
            return
        }

        let likes: DebugItemMemory[] = []
        this.debugItemParent().children.forEach((child) => {
            let item = gain(child, DebugItemMemory)
            let name = item.caseData.name ?? ''
            let content = formatDisplayData(item.caseData.data)
            let matched = exact ? name === keyword : name.includes(keyword) || content.includes(keyword)
            item?.handleTap(false)
            if (matched) {
                exact ? likes.splice(0, 1, item) : likes.push(item)
            }
        })

        if (likes.length <= 0) {
            this.clear()
            tea.tip.show('没有找到匹配 Memory 对象')
            return
        }

        let target = likes[0]
        this.updateView('tap', target)
        let idx = this.debugItemParent().children.indexOf(target.node)
        let total = this.debugItemParent().children.length
        if (idx >= 0 && total > 0) {
            let listview = find('ListViewUrl', this.node).getComponent(ScrollView)
            listview?.scrollToPercentVertical(1 - idx / total, 0.5, true)
        }
        tea.tip.show('找到匹配 Memory 对象')
    }

    private updateContentHeight() {
        let content = this.debugItemParent()
        let count = content.children.length
        let gap = content.getComponent(Layout)?.spacingY ?? 0
        let sample = content.children[0]?.getComponent(UITransform)
        content.getComponent(UITransform).height = sample ? (sample.height + gap) * count : 0
    }
}