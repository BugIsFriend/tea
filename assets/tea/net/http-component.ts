/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:56   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:56   * */

import { Unit } from "../unit";
import { _decorator } from "cc";
import { HttpMethod, HttpURL } from "./http-url";
const { ccclass ,property} = _decorator;

@ccclass('HttpComponent')
export class HttpComponent extends Unit {

    @property({ type: [HttpURL] }) urls: HttpURL[] = []
    
    onLoad() { 
        // 发起请求；
    }

    public get(url: HttpURL, cb?: (err: Error | null, data: any) => void) {
        url.method = HttpMethod.GET
        let _cb = (err: Error | null, data: any) => this.isValid && cb && cb(err, data)
        HttpComponent.request(url).then(data => _cb(null,data), err => _cb(err,null))
    }

    public post(url: HttpURL, cb?: (err: Error | null, data: any) => void) {
        url.method = HttpMethod.POST
        let _cb = (err: Error | null, data: any) => this.isValid && cb && cb(err, data)
        return HttpComponent.request(url).then(data => _cb(null,data),err => _cb(err,null))
    }

    static async request(url: HttpURL): Promise<any> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.open(url.method, url.getURL(), true)
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText)
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