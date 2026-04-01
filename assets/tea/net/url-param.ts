/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:45:32   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:45:32   * */

import { _decorator, EventHandler } from "cc";
const { ccclass, property } = _decorator;


export enum MethodType {
    GET = 'GET',
    POST = 'POST'
}

@ccclass
export class URLParam {
    
    @property(EventHandler) eventHandler: EventHandler = null

    @property({type: MethodType}) method: MethodType = MethodType.GET

}           