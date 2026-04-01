/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:56   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:56   * */

import { Unit } from "../unit";
import { _decorator } from "cc";
const { ccclass } = _decorator;


@ccclass('HttpComponent') 
export class HttpComponent extends Unit { 

    public async get(url: string, data?: any): Promise<any> {
        return this.request('GET', url, data)
    }

    public async post(url: string, data?: any): Promise<any> {
        return this.request('POST', url, data)
    }

    private async request(method: string, url: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.open(method, url, true)
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText)
                    } else {
                        reject(new Error(`HTTP ${method} request to ${url} failed with status ${xhr.status}`))
                    }
                }
            }
            if (method === 'POST' && data) {
                xhr.setRequestHeader('Content-Type',                'application/json')
                xhr.send(JSON.stringify(data))
            } else {
                xhr.send()
            }
        })
    }
}