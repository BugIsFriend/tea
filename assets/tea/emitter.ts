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
    public emitter(id: string, ...params: any) {
        this.msgOnce.forEach((item) => item.handler.apply(item.context, params))
        this.msgOnce = this.msgOnce.filter((item) => item.id != id)

        let handlers = this.msgMap.get(id)
        handlers?.forEach((item) => item.handler.apply(item.context, params))
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
     * @param id:T  取消监听某个事件
     * @param context:object
     */
    public off<T>(id: T, context?: object) {
        if (typeof id == 'string') {
            // 删除摸个对象摸个事件
            let tarHandlers = this.msgMap.get(id) || []
            _.remove(tarHandlers, (emmitees) => emmitees.context == context)
        } else if (typeof id == 'object') {
            for (const [key, handlers] of this.msgMap) {
                if (handlers.findIndex((item) => item.context == id) != -1) {
                    _.remove(handlers, (item) => item.context != id)
                }
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
