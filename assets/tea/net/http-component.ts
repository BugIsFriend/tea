/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:56   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:56 
* * */

import { Unit } from "../unit";
import { _decorator, log } from "cc";
import { HttpMethod, HttpURL } from "./http-url";
const { ccclass, property } = _decorator;

export interface IResponseData { 
    errNo: number,
    errMsg: string,
    data: any
}

@ccclass('HttpComponent')
export class HttpComponent extends Unit {

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
        return HttpComponent.request(url, block).then(_cb, _cb)
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
        return HttpComponent.request(url, block).then(_cb, _cb)
    }

    // 目前返回支持json格式的响应数据，后续可根据需要扩展其他响应类型的处理
    static async request(url: HttpURL, block?: boolean): Promise<IResponseData> {
        // block && 触发loading 组件显示；
        return new Promise((resolve, reject) => {
            if (!!url.mock && !!url.mockData) {
                resolve({
                    errNo: null,
                    errMsg: null,
                    data: url.mockData
                })
            } else { 
                let xhr = new XMLHttpRequest()
                xhr.open(url.method, url.getURL(), true)
                xhr.responseType = 'json'; 
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