import { _decorator, Color, color, Component, log, Node, Sprite, tween, v3, warn } from 'cc'
import { emmiter } from '../tea/emitter'
import { storage } from '../tea/storage'
import { publish, seek, subscribe } from '../tea/meta/method'
import { ui } from '../tea/ui'
import { EDITOR } from 'cc/env'
import { UIAnimate } from '../tea/uitypes'
import { tip } from '../tea/ui/tip/tip'
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

        console.log('sss', typeof UIAnimate.bottom)
        if (!EDITOR) {
            this.uiTest()
        }
    }

    uiTest() {
        let dt = 0.5
        ui.init()
        tip.init()

        ui.load('TestPopView').show(UIAnimate.scale, null, { active: true, color: color(0, 0, 0, 128) })
        this.scheduleOnce(() => ui.load('TestPopView-top').show(UIAnimate.top, null, { active: true, color: color(0, 0, 0, 128) }), dt * 1)
        this.scheduleOnce(() => ui.load('TestPopView-bottom').show(UIAnimate.bottom, null, { active: true, color: color(0, 255, 0, 10) }), dt * 2)
        this.scheduleOnce(() => ui.load('TestPopView-left').show(UIAnimate.left, null, { active: true, color: color(0, 0, 0, 128) }), dt * 3)
        this.scheduleOnce(
            () => ui.load('TestPopView-right').show(UIAnimate.right, null, { active: true, color: color(0, 0, 0, 128), touchClose: true }),
            dt * 4
        )
        // this.scheduleOnce(() => ui.closeTop(), dt * 5)
        // this.scheduleOnce(() => ui.closeTop(), dt * 6)
        // this.scheduleOnce(() => ui.closeTop(), dt * 7)
        // this.scheduleOnce(() => ui.closeTop(), dt * 8)
        this.scheduleOnce(() => tip.show('tip pop test 1'), dt * 2)
        this.scheduleOnce(() => tip.show('tip pop test 2'), dt * 3)
        this.scheduleOnce(() => tip.show('tip pop test 3'), dt * 4)
        this.scheduleOnce(() => tip.show('tip pop test 4'), dt * 5)

        
    }

    seekTest() {
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
        warn('test subscrib: ', value)
    }

    @publish('testSubscritbe')
    triggerTestSub(data) {
        return data
    }

    update(deltaTime: number) {}
}
