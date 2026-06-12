/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:32   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:32   
* * */

import { _decorator, EventHandler,Enum, CCFloat, CCInteger, CCString, CCBoolean } from "cc";
import { PREVIEW } from "cc/env";
const { ccclass, property } = _decorator;


export enum HttpMethod {
    GET = 'GET',
    POST = 'POST', 
    // PUT = 'PUT',
    // DELETE = 'DELETE'
}

@ccclass('HttpURL')
export class HttpURL {

    @property({type: Enum(HttpMethod)}) method: HttpMethod = HttpMethod.GET

    @property({type: CCFloat, tooltip: '请求超时时间，单位秒，-1表示不设置超时'})  timeout: number = -1 

    @property({type: CCInteger, tooltip: '重复次数, 0表示不重复, -1表示无限重复, 其他正整数表示重复次数'}) repeat: number = 0 

    @property({tooltip: '测试环境URL'}) url_test: string = ''

    @property({tooltip: '生产环境URL'}) url_prod: string = ''

    @property  mock: boolean = false
    
    @property({visible() { return this.mock },multiline:true, editorOnly:true, tooltip: '模拟数据,输入 JSON 字符传'}) mockData: string = ''
    
    @property({type: EventHandler, tooltip: '事件处理器'}) eventHandler: EventHandler = null

    public path: string = ''

    public params: Record<string, string> = {}

    public postdata: any = null

    public getURL(): string {
        return PREVIEW ? this.url_test : this.url_prod
    }

    public static parseParts(url: string) {
        let source = url || ''
        let hash = ''
        const hashIndex = source.indexOf('#')
        if (hashIndex >= 0) {
            hash = source.slice(hashIndex)
            source = source.slice(0, hashIndex)
        }

        let query = ''
        const queryIndex = source.indexOf('?')
        if (queryIndex >= 0) {
            query = source.slice(queryIndex + 1)
            source = source.slice(0, queryIndex)
        }

        let origin = ''
        let path = source || '/'
        const absoluteMatch = source.match(/^([a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^/]+)(\/.*)?$/)
        if (absoluteMatch) {
            origin = absoluteMatch[1]
            path = absoluteMatch[2] || '/'
        }

        if (!path) path = '/'
        if (!path.startsWith('/')) path = `/${path}`

        return { origin, path, query, hash }
    }

    private parseParams(query: string): Record<string, string> {
        const params: Record<string, string> = {}
        if (!query) return params

        query.split('&').forEach((item) => {
            if (!item) return
            const [rawKey, ...rest] = item.split('=')
            const key = decodeURIComponent(rawKey || '')
            const value = decodeURIComponent(rest.join('=') || '')
            if (key) params[key] = value
        })
        return params
    }

    private stringifyParams(params: Record<string, string>): string {
        return Object.keys(params)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key] ?? '')}`)
            .join('&')
    }

    public parseURL(url: string = this.getURL()) {
        const { path, query } = HttpURL.parseParts(url)
        this.path = path
        this.params = this.parseParams(query)
        return { path: this.path, params: this.params }
    }

    public setParam(key: string, value: string, url: string = this.getURL()): string {
        const parts = HttpURL.parseParts(url)
        const params = this.parseParams(parts.query)
        params[key] = value

        const query = this.stringifyParams(params)
        const nextURL = `${parts.origin}${parts.path}${query ? `?${query}` : ''}${parts.hash}`

        if (PREVIEW) {
            this.url_test = nextURL
        } else {
            this.url_prod = nextURL
        }

        this.path = parts.path
        this.params = params
        return nextURL
    }

}