import { _decorator, Component, log, Node } from 'cc'
import { emmiter } from '../tea/emitter'
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('TestCode')
@executeInEditMode
export class TestCode extends Component {
    start() {}

    testEmmiter() {
        let { timer } = emmiter.delay(2).emit('code.test', 'delay')

        setTimeout(() => emmiter.offDelay(timer), 1000)

        emmiter.on('code.test', this.testCode, this)

        emmiter.emit('code.test', 'testing')

        emmiter.emit('code.test', 'test over')
    }

    testCode(msg: string) {
        log(msg)
    }

    update(deltaTime: number) {}
}
