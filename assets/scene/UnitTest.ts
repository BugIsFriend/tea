import { _decorator, color, Component, log, Sprite, tween, v3, warn } from 'cc'
import { emmiter } from '../tea/emitter'
import { storage } from '../tea/storage'
import { publish, seek, subscribe } from '../tea/meta/method'
import { EDITOR } from 'cc/env'
import { UIAnimate } from '../tea/ui/ui-types'
const { ccclass,  executeInEditMode } = _decorator

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
            tea.init().then(() => this.uiTest())
        }
    }

    uiTest() {
        let dt = 3

        tea.ui.load('resources/TestPopView').show(UIAnimate.scale, null, { active: true, color: color(0, 0, 0, 200) })
        // this.scheduleOnce(() => tea.ui.load('resources/TestPopView-top').show(UIAnimate.top, null, { active: true, color: color(0, 0, 0, 200) }), dt * 1)
        // this.scheduleOnce(() => tea.ui.load('resources/TestPopView-bottom').show(UIAnimate.bottom, null, { active: true, color: color(0, 0, 0, 200) }), dt * 2)
        // this.scheduleOnce(() => tea.ui.load('resources/TestPopView-left').show(UIAnimate.left, null, { active: true, color: color(0, 0, 0, 200) }), dt * 3)
        // this.scheduleOnce(
        //     () => tea.ui.load('resources/TestPopView-right').show(UIAnimate.right, null, { active: true, color: color(0, 0, 0, 200), touchClose: true }),
        //     dt * 4
        // )

        // this.scheduleOnce(() => tea.ui.closeTop(), dt * 5)
        // this.scheduleOnce(() => tea.ui.closeTop(), dt * 6)
        // this.scheduleOnce(() => tea.ui.closeTop(), dt * 7)
        // this.scheduleOnce(() => tea.ui.closeTop(), dt * 8)
        dt+=0.5
        // this.scheduleOnce(() => tea.ui.tip.show('tip pop test 1',true), dt * 2)
        // this.scheduleOnce(() => tea.ui.tip.show('tip pop test 2'), dt * 3)
        // this.scheduleOnce(() => tea.ui.tip.show('tip pop test 3',true), dt * 4)
        // this.scheduleOnce(() => tea.ui.tip.show('tip pop test 4', true), dt * 5)
        
        

        tea.debug.show()

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


    debugViewTest() { 

        tea.debug.addCase({ name: 'test', tapCb: (data) => {
                log('debug_case '+data.name)
                return data.name
            }
        })

        var click = 0
        tea.debug.addCase({ name: 'test-showfps', tapCb: (data) => {
                log('debug_case '+data.name)
                return data.name +(click++)
            }
        })

        storage.set('test_key1', { value: 'test_1', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key2', { value: 'test_2', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key3', { value: 'test_3', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key4', { value: 'test_4', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key11', { value: 'test_11', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key12', { value: 'test_12', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key13', { value: 'test_13', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key14', { value: 'test_41', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key21', { value: 'test_21', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key22', { value: 'test_22', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key23', { value: 'test_23', expire: Date.now() + 1000 * 60 * 60 })
        storage.set('test_key24', { value: 'test_41', expire: Date.now() + 1000 * 60 * 60 })

        let group = 'Storage'
        storage.getAllKeys().forEach(key => {
            tea.debug.addCase({
                group,
                name: key,
                data: storage.getDataWithExpire(key),
                tapCb: (data) => {
                    return ''
                }
            })
        })
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
