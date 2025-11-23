import { Component, js, warn, error, isValid } from 'cc'

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

    private _onceemmit: boolean = false

    static instance() {
        if (!Emitter._instance) Emitter._instance = new Emitter()
        return Emitter._instance
    }

    /**
     * 如果context is Component|Node & context.isValid 则自动清除所有与该对象的有关的事件监听；
     * @param item
     * @returns
     */
    private checkEmmit(item: IEmitter) {
        let success = true
         // @ts-ignore
        if (!item.context.isValid || !isValid(item.context) ) {
            success = false
            this.off({ context: item.context })
            // @ts-ignore
            warn(`object:${item.context.name} is invalid, clear all ${item.id} callbacks`)
        }

        return success
    }

    /**
     * 触发事件
     * @param id
     * @param params
     */
    public emit(id: string, ...params: any) {
        let handlers = this.msgMap.get(id)
        handlers?.forEach((item) => {
            if (this.checkEmmit(item)) item.handler.apply(item.context, params)
        })

        this.msgOnce.forEach((item) => {
            if (item.id == id && this.checkEmmit(item)) {
                item.handler.apply(item.context, params)
                this._onceemmit = true
            }
        })

        if (this._onceemmit) {
            this._onceemmit = false
            this.msgOnce = this.msgOnce.filter((item) => item.id != id)
        }
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
                        emmiter.emit(id, param)
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
    public clearDelay(timer: any) {
        clearTimeout(timer)
    }

    /**
     * 监听一次事件
     */
    public once(id: string, handler: Function, context: object) {
        if (!id || !handler || !context) {
            error('QMsg: Once Msg', ` id: ${id}`)
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
     * @returns this    emmiter.on(id0,func0,this0).on(id1,func1,this1)
     */
    public on(id: string, handler: Function, context: object, priority?: number) {
        if (!id || !handler || !context) {
            error('QMsg: On Msg', ` id: ${id}  handler: ${handler.name}    context: ${context}`)
            return
        }

        if (!this.msgMap.has(id)) this.msgMap.set(id, new Array<IEmitter>())

        let handlers = this.msgMap.get(id)

        let target = _.find(handlers, (item) => item.handler == handler && item.context == context)
        // 防止多次监听
        if (!target) {
            if (!priority) priority = 0
            handlers.push({ id, handler, context, priority })
            _.orderBy(handlers, ['priority'], ['desc'])
        }

        !!target && warn(`reapeat on event ${id}`)
        return this
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
                _.remove(handlers || [], (item) => item.context == target.context)
            }
        }
    }

    /**
     * 清除所有监听；
     */
    public clearAll() {
        this.msgMap = new Map<string, Array<IEmitter>>()
        this.msgOnce = new Array<IEmitter>()
    }
}

export const emmiter: Emitter = Emitter.instance()
