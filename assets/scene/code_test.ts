import { _decorator, Component, log, Node } from 'cc'
import { Emitter } from '../tea/emitter'
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('TestCode')
@executeInEditMode
export class TestCode extends Component {
    start() {
        Emitter.instance().on('code.test', this.testCode, this)

        Emitter.instance().emitter('code.test', 'testing')

        setTimeout(() => Emitter.instance().emitter('code.test', 'test start'), 200)
        Emitter.instance().emitter('code.test', 'test over')

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
