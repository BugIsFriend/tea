import { _decorator, Component, Node, Prefab } from 'cc';
import { asynload } from '../../load';
const { ccclass, property } = _decorator;


@ccclass('TipGroup')
export class TipGroup extends Component {


    @property(Prefab) ItermPrefab: Prefab

   
    async setItemPrefab(path: string) { 
        let prefab = await asynload<Prefab>(path)
        if (!!prefab) { 
            this.ItermPrefab = prefab
        }
    }

    setPosition() { 

    }


    update(deltaTime: number) {
        
    }
}

