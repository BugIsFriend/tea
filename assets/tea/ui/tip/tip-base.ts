/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:46:30   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:46:30   * */

import { _decorator,  Prefab, Vec3 } from 'cc';
import { Unit } from '../../unit';
const { ccclass, property } = _decorator;

export interface ITipBox { 
    title?:string   // 标题
    content:string  // 提示内容
    ok?: {
        txt?: string,
        cb?: Function,
    },
    cancel?: {
        txt?: string,
        cb?: Function,
    }
    
    close?: Function
}

@ccclass('TipBase')
export class TipBase extends Unit {

    setPosition(position: Vec3) { 
        this.node.position = position
    }

    show(content: string|ITipBox) { }

}

