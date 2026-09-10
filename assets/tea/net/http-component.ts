/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:56   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:56 
* * */

import { Unit } from "../unit";
import { _decorator, log, Node } from "cc";
import { HttpMethod, HttpURL } from "./http-url";
const { ccclass, property } = _decorator;

export interface IResponseData { 
    errNo: number,
    errMsg: string,
    data: any
}

@ccclass('HttpComponent')
export class HttpComponent extends Unit {

    static xmlHttpRequestingMap: Map<string, XMLHttpRequest> = new Map()

    @property({ type: [HttpURL] }) urls: HttpURL[] = []
    
    onLoad() {  }

    public pushUrl(url: HttpURL) {
        if(_.find(this.urls, item => item.getURL() === url.getURL())) return
        this.urls.push(url)
    }

    public get(url: HttpURL, cb?: (err: Error | null, data: any) => void, block?: boolean) {
        this.pushUrl(url)
        url.method = HttpMethod.GET
        let _cb = (response: IResponseData) => { 
            if (this.isValid) { 
                let err = null
                if (response.errNo || response.errMsg) { 
                    err = {
                        errNo: response.errNo,
                        errMsg: response.errMsg
                    }
                }
                cb?.(err, response.data)
            }
        }
        return HttpComponent.request(url, { block }).then(_cb, _cb)
    }

    public post(url: HttpURL, cb?: (err: Error | null, data: any) => void, block?: boolean) {
        this.pushUrl(url)
        url.method = HttpMethod.POST
        let _cb = (response: IResponseData) => { 
            if (this.isValid) { 
                let err = null
                if (response.errNo || response.errMsg) { 
                    err = {
                        errNo: response.errNo,
                        errMsg: response.errMsg
                    }
                }
                cb?.(err, response.data)
            }
        }
        return HttpComponent.request(url, { block }).then(_cb, _cb)
    }

    public stopRequest(url: HttpURL) {
        let url_str = url.getURL()
        let xhr = HttpComponent.xmlHttpRequestingMap.get(url_str)
        xhr?.abort()
        HttpComponent.xmlHttpRequestingMap.delete(url_str)

    }

    // 目前返回支持json格式的响应数据，后续可根据需要扩展其他响应类型的处理
    static async request(url: HttpURL, option: {block?: boolean,node?:Node}): Promise<IResponseData> {

        if (option.block) {
            // todo: 触发loading组件显示
        }

        return new Promise((resolve, reject) => {
            if (!!url.mock && !!url.mockData) {
                resolve({
                    errNo: null,
                    errMsg: null,
                    data: url.mockData
                })
            } else { 
                let xhr = new XMLHttpRequest()
                HttpComponent.xmlHttpRequestingMap.set(url.getURL(), xhr)
                xhr.open(url.method, url.getURL(), true)
                xhr.responseType = url.responseType as XMLHttpRequestResponseType
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            url.eventHandler?.emit([xhr.response])
                            resolve(xhr.response)
                        } else {
                            log(`HTTP ${url.method} request to ${url.getURL()} failed with status ${xhr.status}`)
                            reject(xhr.response)
                        }
                    }
                    
                    if (option.block) {
                        // todo: 关闭loading组件显示
                    }
                }
                if (url.method === 'POST' && url.postdata != null) {
                    xhr.setRequestHeader('Content-Type','application/json')
                    xhr.send(JSON.stringify(url.postdata))
                } else {
                    xhr.send()
                }
            }
        })
    }
}