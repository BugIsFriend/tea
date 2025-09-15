export interface IEmitter {
    id: string
    handler: Function
    context: object
    priority?: number
}

export class Emitter {
    private static _instance: Emitter
    private msgMap = new Map<string, Array<IEmitter>>()
    private msgOnce = new Array<IEmitter>()

    static instance() {
        if (!Emitter._instance) Emitter._instance = new Emitter()
        return Emitter._instance
    }

    /**
     * 触发事件
     * @param id
     * @param params
     */
    public emit(id: string, ...params: any) {
        this.msgOnce.forEach((item) => item.handler.apply(item.context, params))
        this.msgOnce = this.msgOnce.filter((item) => item.id != id)

        let handlers = this.msgMap.get(id)
        handlers?.forEach((item) => item.handler.apply(item.context, params))
    }

    /**
     * 延迟发送消息
     * @param dt: 延迟时间间隔
     * @returns emit: (id:string, param)=> {timer: any }
     */
    public delay(dt: number): { emit: (id: string, ...param: any) => { timer: any } } {
        return {
            emit: function (id: string, ...param: any) {
                let timer = null
                new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        resolve(true)
                        Emitter.instance().emit(id, param)
                    }, dt * 1000)
                })
                return { timer }
            }
        }
    }

    /**
     * 清理延迟发送的消息
     * @param timer
     */
    public offDelay(timer: any) {
        clearTimeout(timer)
    }

    /**
     * 监听一次事件
     */
    public once(id: string, handler: Function, context: object) {
        if (!id || !handler || !context) {
            console.error('QMsg: Once Msg', ` id: ${id}`)
            return
        }
        this.msgOnce.push({ id, handler, context })
    }

    /**
     * 监听事件
     * @param id
     * @param handler
     * @param context
     * @param priority
     * @returns
     */
    public on(id: string, handler: Function, context: object, priority?: number) {
        if (!id || !handler || !context) {
            console.error('QMsg: On Msg', ` id: ${id}  handler: ${handler.name}    context: ${context}`)
            return
        }

        if (!this.msgMap.has(id)) this.msgMap.set(id, new Array<IEmitter>())

        let handlers = this.msgMap.get(id)

        let tarIdx = handlers.findIndex((item) => item.handler == handler && item.context == context)
        if (tarIdx == -1) {
            if (!priority) priority = 0
            handlers.push({ id, handler, context, priority })
            _.orderBy(handlers, ['priority'], ['desc'])
        }

        if (tarIdx != -1) console.warn(`reapeat on event ${id}`)
    }

    /**
     * @param target:{id?: string; context?: object}  删除指定监听器
     */
    public off(target: { id?: string; context?: object }) {
        if (!!target?.id && !!target.context) {
            // 删除摸个对象摸个事件
            let tarHandlers = this.msgMap.get(target.id) || []
            _.remove(tarHandlers, (emmitees) => emmitees.context == target.context)
        } else if (!!target.context) {
            for (const [key, handlers] of this.msgMap) {
                _.remove(handlers || [], (item) => item.context != target.context)
            }
        }
    }

    /**
     * 销毁所有对象
     */
    public destory() {
        Emitter._instance = null
    }
}

export const emmiter: Emitter = Emitter.instance()
