import { _decorator, Component, log, Node } from 'cc'
import { emmiter } from '../tea/emitter'
import { storage } from '../tea/storage'
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('TestCode')
@executeInEditMode
export class TestCode extends Component {
    start() {
        this.emmiterTest()
        this.dayjsTest()
        this.storageTest()
    }

    storageTest() {
        let day = dayjs(Date.now())
        storage.set('123', { a: 2, b: 3 }, day.add(3, 's'))

        this.scheduleOnce(() => {
            console.log('storage test 4s later ', storage.get('123'))
        }, 4)
    }

    dayjsTest() {
        let day = dayjs('1990-02-03')

        console.log('---- day ', day.format('YY+MM+DD'))

        day = day.add(2, 'day')

        console.log('---- day+2 ', day.format('YY+MM+DD'), day.valueOf())
    }

    emmiterTest() {
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
