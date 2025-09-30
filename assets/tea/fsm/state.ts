/*
 * @Author: myerse.lee
 * @Date: 2025-09-30 14:04:49
 * @Modified by:   myerse.lee
 * @Modified time: 2025-09-30 14:04:49
 * */
import { _decorator, Component, Node, log } from 'cc'
const { ccclass } = _decorator

@ccclass('State')
export class State extends Component {
    protected onLoad(): void {
        log('State  init')
        this.enabled = false
    }

    public initState() {}

    enter(owner: Node) {
        log('enter', this.name)
        this.enabled = true
    }

    execute(owner: Node) {
        log('execute ', this.name)
    }

    exit(owner: Node) {
        log('exit', this.name)
        this.enabled = false
    }
}
