import { _decorator, Color, color, Component, log, Node, Sprite, tween, v3, Vec2, warn } from 'cc'
import { emmiter } from '../tea/emitter'
import { storage } from '../tea/storage'
import { publish, seek, subscribe } from '../tea/decorator'
import { View } from '../tea/ui/view'
import { ui } from '../tea/ui'
const { ccclass, property, executeInEditMode } = _decorator

@ccclass('TestCode')
@executeInEditMode
export class TestCode extends Component {
    @seek([Sprite]) sprites: Sprite[]

    // @seek(View) view: View

    start() {
        this.emmiterTest()
        this.dayjsTest()
        this.storageTest()

        this.seekTest()

        ui.init()
        this.scheduleOnce(() => {
            ui.load('TestPopView').then((value) => value.show({ param: { actived: true } }))
        }, 1)
        this.scheduleOnce(() => {
            ui.closeTop()
        }, 2)
    }

    seekTest() {
        // tween(this._sprite).to(0.5, { color: Color.RED.clone() }).to(0.5, { color: Color.BLUE.clone() }).to(0.5, { color: Color.CYAN.clone() }).start()

        for (const sprite of this.sprites) {
            let scale = tween(sprite.node)
                .to(0.5, { scale: v3(0.5, 0.5, 0.5) })
                .to(0.5, { scale: v3(1, 1, 1) })
            tween(sprite.node).repeatForever(scale).start()
        }
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
        let { timer } = emmiter.delay(2).emit('code.test', 'delay 2')

        setTimeout(() => emmiter.clearDelay(timer), 1000)

        emmiter.on('code.test', this.testCode, this)

        emmiter.emit('code.test', 'testing')

        emmiter.emit('code.test', 'test 1111')

        // emmiter.emit('testSubscritbe', 'test over')
        this.triggerTestSub('hello world')

        this.triggerTestSub('hardest choice require strongest will')
    }

    testCode(msg: string) {
        log(msg)
    }

    @subscribe('testSubscritbe')
    testSubscritbe(value) {
        warn('test subscrib', value)
    }

    @publish('testSubscritbe')
    triggerTestSub(data) {
        return data
    }

    update(deltaTime: number) {}
}
