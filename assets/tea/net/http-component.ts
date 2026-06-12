/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:56   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:56 
* * */

import { Unit } from "../unit";
import { _decorator } from "cc";
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
        let _cb = (err: Error | null, data: any) => this.isValid && cb && cb(err, data)
        HttpComponent.request(url, block).then(data => _cb(null,data), err => _cb(err,null))
    }

    private handleResponse(url: HttpURL, err: Error | null, data: any) { 
        if (this.isValid) {
            // 处理响应数据，更新界面等
        } else {
            
         }

    }

    public post(url: HttpURL, cb?: (err: Error | null, data: any) => void, block?: boolean) {
        this.pushUrl(url)

        url.method = HttpMethod.POST
        let _cb = (err: Error | null, data: any) => this.isValid && cb && cb(err, data)
        return HttpComponent.request(url, block).then(data => _cb(null,data),err => _cb(err,null))
    }

    // 目前返回支持json格式的响应数据，后续可根据需要扩展其他响应类型的处理
    static async request(url: HttpURL, block?: boolean): Promise<any> {
        // block && 触发loading 组件显示；
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.open(url.method, url.getURL(), true)
            xhr.responseType = 'json'; 
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        url.eventHandler?.emit([xhr])
                        resolve(xhr.response)
                    } else {
                        reject(new Error(`HTTP ${url.method} request to ${url.getURL()} failed with status ${xhr.status}`))
                    }
                }
            }
            if (url.method === 'POST' && url.postdata != null) {
                xhr.setRequestHeader('Content-Type','application/json')
                xhr.send(JSON.stringify(url.postdata))
            } else {
                xhr.send()
            }
        })
    }
}