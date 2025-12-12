import { _decorator, Component, Node, isValid,error, AudioClip, director} from 'cc';
const { ccclass, property } = _decorator;


export enum SoundRole {
    Default,
    Tips,
    Role1,
    Role2,
    Role3
}

export enum SoundState {
    Invalide,
    Loading,
    Cancel,
    Loaded
}

export class SoundEntity{
    id:number = -1;
    path:string="";
    role:SoundRole=SoundRole.Default;
    state:SoundState = SoundState.Invalide;
    isMusic:boolean = false;
    playStartTime:number = 0;
}

@ccclass('Sound')
export class Sound extends Component {

    entities:SoundEntity[] = [];
    public basePath:string=null;


    private _bLoaded:boolean = false;

    onLoad () {
        this._bLoaded = true
    }


    static addSoundCom(node: Node):Sound { 
        let sound_com: Sound = node.getComponent(Sound);
        if (!sound_com) {
            sound_com = node.addComponent(Sound);
        }
        return sound_com
    }

    static playEffectRoleWithNode(role:SoundRole, node:Node, path:string, callback:Function=null, isLoop:boolean=false) {
        if(!isValid(node)){
            error("loadWithNode node has invalide,do not load");
            return;
        }
        let sound_com: Sound = node.getComponent(Sound);
        if (!sound_com) {
            sound_com = node.addComponent(Sound);
        }
        sound_com.playEffectRole(role,path,callback,isLoop);
    }

    static playEffectWithNode(node:Node, path:string, callback:Function=null,isLoop:boolean=false) {
        if(!isValid(node)){
            error("loadWithNode node has invalide,do not load");
            return;
        }
        let sound_com: Sound = node.getComponent(Sound);
        if (!sound_com) {
            sound_com = node.addComponent(Sound);
        }
        return sound_com.playEffect(path,callback,isLoop);
    }

    onDestroy() {
        for(let i = this.entities.length-1;i>=0;i--)
        {
            this.stopSound(this.entities[i]);
        }
    }

    //播放BGM
    playMusic(path,isLoop, cb?: any) {
        // if(!Global.Instance.bgMusic){
        //     return null;
        // }
        return this.playBase(path,cb,isLoop,SoundRole.Default,true);
    }

    pauseMusic(): void{
        // cc.audioEngine.pauseMusic()
    }
    
    resumeMusic(): void{
        // cc.audioEngine.resumeMusic()
    }

    pauseEffect(entity:SoundEntity) {
        if(entity.id > -1){
            console.log("pause sound:",entity.id)
            // cc.audioEngine.pause(entity.id)
        }
    }
    
    pauseEffectByPath(path:string){
        for(let i = this.entities.length-1;i>=0;i--){
            if(path == this.entities[i].path) {
                this.pauseEffect(this.entities[i]);
            }
        }
    }

    resumeEffect(entity:SoundEntity) {
        if(entity.id > -1) {
            console.log("resume sound:",entity.id)
            // cc.audioEngine.resume(entity.id)
        }
    }

    resumeEffectByPath(path:string){
        for(let i = this.entities.length-1;i>=0;i--){
            if(path == this.entities[i].path) {
                this.resumeEffect(this.entities[i]);
            }
        }
    }

    pauseAll() {
        console.log("pause all",this.entities,this.node)
        for(let entity of this.entities){
            this.pauseEffect(entity)
        }
    }

    resumeAll() {
        console.log("resume all",this.entities,this.node)
        for(let entity of this.entities){
            this.resumeEffect(entity)
        }
    }

    //播放音效
    playEffect(path,callback:Function=null,isLoop:boolean=false){
       return this.playEffectRole(SoundRole.Default,path,callback,isLoop);
    }

    //播放指定角色音
    playEffectRole(role:SoundRole, path,callback:Function=null,isLoop:boolean=false) {
        if(role != SoundRole.Default){
            Sound.stopSceneEffectsByRole(role)
        }
        
        return this.playBase(path,callback,isLoop,role,false);
    }

    //播放指定角色音 如果有当前角色音正在播放则不播放
    playEffectRoleUnique(role:SoundRole, path,callback:Function=null,isLoop:boolean=false) {
        if(role != SoundRole.Default){
            if(!Sound.sceneHasEffectByRole(role)){
                return this.playBase(path,callback,isLoop,role,false);
            }
        }
        return null
    }

    private playBase( path,callback:Function,isLoop:boolean,role:SoundRole,isMusic:boolean) {

        if(!this._bLoaded) {
            console.error('Sound调用方法不对，没有onload就播放!',path)
            callback&&callback()
            return null
        }

        let entity = new SoundEntity;
        entity.path = path;
        entity.role = role;
        entity.isMusic = isMusic;
        this.entities.push(entity);
        entity.state = SoundState.Loading;



        // LoadComponent.loadWithNode(this.node,path, AudioClip,(err: Error, audio: AudioClip) => {
        //     err && console.log(err);
        //     //加载错误依然尝试执行回调
        //     if(err&&entity.state != SoundState.Cancel&&isValid(this.node)) {
        //         callback&&callback();
        //     }
        //     if(err || entity.state == SoundState.Cancel )
        //     {
        //         if(isValid(this.node)) {
        //             this.deleteEntity(entity)
        //         }
        //         return;
        //     }


            
        //     entity.state = SoundState.Loaded;
        //     // 播放之前 添加时间戳 (部分安卓机型 io慢 会导致 play和stop同时调用)
        //     entity.playStartTime = new Date().getTime()
        //     if(isMusic){
        //         // entity.id = cc.audioEngine.playMusic(audio, isLoop);
        //     }else{
        //         // entity.id = cc.audioEngine.playEffect(audio, isLoop);
        //     }
            
        //     if(entity.id == -1){
        //         // 音频播放失败 直接返回
        //         if(isValid(this,true)) {
        //             this.deleteEntity(entity)
        //             callback&&callback();
        //         }
        //     } else {
        //         // cc.audioEngine.setFinishCallback(entity.id, () => {
        //         //     if(isValid(this,true)) {
        //         //         this.deleteEntity(entity)
        //         //         callback&&callback();
        //         //     }
        //         // });
        //     }
        // });
        return entity;
    }

    stopAll(){
        for(let i = this.entities.length-1;i>=0;i--){
            this.stopSound(this.entities[i]);
        }
    }

    stopAllWithOutBgm(){
        for(let i = this.entities.length-1;i>=0;i--){
            if(!this.entities[i].isMusic){
                this.stopSound(this.entities[i]);
            }
        }
    }

    //停止播放音频
    stopSound(entity: SoundEntity) {
        if (!isValid(entity)) return 
        
        if(entity.state == SoundState.Loading)
        {
            entity.state = SoundState.Cancel;
        }else if(entity.state == SoundState.Loaded){
            // if(entity.isMusic ){
            //     cc.audioEngine.isMusicPlaying() && cc.audioEngine.stopMusic();
            // }else{
            //     cc.audioEngine.stopEffect(entity.id);
            // }
            if(isValid(this)){
                this.deleteEntity(entity);
            }            
        }
    }

    stopSoundByRole(role){
        for(let i = this.entities.length-1;i>=0;i--){
            if(role == this.entities[i].role) {
                this.stopSound(this.entities[i]);
            }
        }
    }

    stopSoundByPath(path) {
        for(let i = this.entities.length-1;i>=0;i--){
            if(path == this.entities[i].path) {
                this.stopSound(this.entities[i]);
            }
        }
    }

    //如果当前正在播放这个文件 则不播放
    playEffectUnique(path,callback:Function=null,isLoop:boolean=false) {
        if(Sound.sceneHasEffectByPath(path)) {
            return;
        }
        return this.playEffect(path,callback,isLoop);
    }

    //如果当前正在播放这个文件 则停掉当前播放的再重新播放
    playEffectReplace(path,callback:Function=null,isLoop:boolean=false) {
        Sound.stopSceneEffectsByPath(path)
        return this.playEffect(path,callback,isLoop);
    }


    private getEntityByRole(role:SoundRole){
        let rets = [];
        for(let i = this.entities.length-1;i>=0;i--){
            if(role == this.entities[i].role) {
                rets.push(role)
            }
        }
        return rets;
    }

    private getEntityByPath(path:string) {
        let index = this.entities.findIndex((item)=>{
            return item.path == path;
        })
        if(index > -1)
        {
            return this.entities[index]
        }else{
            return null;
        }
    }

    private deleteEntity(entity:SoundEntity) {
        if(!entity) return;
        entity.state = SoundState.Invalide;
        
        let index = this.entities.indexOf(entity);
        if(index > -1)
        {
            this.entities.splice(index,1);
        }
    }

    static stopSceneEffectsByPath(path) {
        let scene = director.getScene()
        if(!isValid(scene)) {
            return;
        }
    
        // MultiUtils.recursiveNode(scene,(node:cc.Node)=>{
        //     if(!isValid(node)){
        //         return
        //     }
        //     if(scene != node) {
        //         let sound_com = node.getComponent(Sound);
        //         if(!sound_com) {
        //             return
        //         }
        //         let entity = sound_com.getEntityByPath(path);
        //         if(entity)
        //         {
        //             sound_com.stopSound(entity);
        //         }
        //     }
        // })
    }

    static stopSceneEffectsByRole(role) {
        let scene = director.getScene()
        if(!isValid(scene)) {
            return;
        }
        

        // MultiUtils.recursiveNode(scene,(node:cc.Node)=>{
        //     if(!isValid(node)){
        //         return
        //     }
        //     if(scene != node) {
        //         let sound_com = node.getComponent(Sound);
        //         if(!sound_com) {
        //             return
        //         }
        //         sound_com.stopSoundByRole(role);
        //     }
            
        // })
    }

    static sceneHasEffectByPath(path) {
        let ret = false;

        let scene = director.getScene()
        if(!isValid(scene)) {
            return false;
        }
        let Sounds = scene.getComponentsInChildren(Sound)
        for(let Sound of Sounds) {
            let entity = Sound.getEntityByPath(path);
            if(entity) {
                ret = true;
                break
            }
        }

        return ret;
    }

    static sceneHasEffectByRole(role) {
        let ret = false;

        let scene = director.getScene()
        if(!isValid(scene)) {
            return false;
        }
        let Sounds = scene.getComponentsInChildren(Sound)
        for(let Sound of Sounds) {
            let entities = Sound.getEntityByRole(role);
            if(entities.length>0) {
                ret = true;
                break
            }
        }

        return ret;
    }
    
}

