/*  
* @Author: myerse.lee   
* @Date: 2026-04-01 18:46:30   
* @Modified by:   myerse.lee   
* @Modified time: 2026-04-01 18:46:30   * */

import { _decorator, Component, Node, Prefab } from 'cc';
import { LoadCom } from '../../component/load';
const { ccclass, property } = _decorator;


@ccclass('TipGroup')
export class TipGroup extends Component {


    @property(Prefab) ItermPrefab: Prefab

   
    async setItemPrefab(path: string) { 
        let prefab = await LoadCom.asynload<Prefab>(path)
        if (!!prefab) { 
            this.ItermPrefab = prefab
        }
    }

    setPosition() { 

    }


    update(deltaTime: number) {
        
    }
}

