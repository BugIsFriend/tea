import { _decorator, Component, log, Node } from 'cc'
import { emmiter } from '../tea/emitter'
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('TestCode')
@executeInEditMode
export class TestCode extends Component {
    start() {
        let { timer } = emmiter.delay(2).emit('code.test', 'delay')

        setTimeout(() => {
            emmiter.offDelay(timer)
        }, 1000)

        emmiter.on('code.test', this.testCode, this)

        emmiter.emit('code.test', 'testing')

        emmiter.emit('code.test', 'test over')

        let arr = _.orderBy([{ id: 1 }, { id: 12 }, { id: 2 }, { id: 55 }], ['id'], ['asc'])
        console.log(arr)

        arr = _.orderBy([{ id: 1 }, { id: 12 }, { id: 2 }, { id: 55 }], ['id'], ['desc'])
        console.log(arr)
    }

    testCode(msg: string) {
        log(msg)
    }

    update(deltaTime: number) {}
}
