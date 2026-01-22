/**
 * author myerse.lee
 * created: 2024-09-25 17:10:15
 */
import {Component, Asset, AssetManager, assetManager, resources, warn ,_decorator} from 'cc'
const { ccclass } = _decorator;

@ccclass('LoadCom')
export class LoadCom extends Component {
    
    /**
     * 获取资源,失败返回 null
     * @param url 资源路径
     * @param bundle 资源包
     * @param resolve 成功回调
     */
    static getAsset<T extends Asset>(url: string, bundle: AssetManager.Bundle, success?:(asset: T) => void, fail?:(err) => void) {
        bundle.load<T>(url, (err: any, assest: T) => err ? (fail?.(err)) : (success?.( assest)))
    }

    static parsePath(url: string): { bundleName: string; path: string, isRemote?: boolean, version?: string } {
        let _path = url.split('/')
        let bundle_name = _path[0]
        let path = _path.slice(1).join('/')
        let isRemote = bundle_name.startsWith('remote_') 
        let version = ''    

        if (isRemote) {
            // path = 'http://xxxx/' + url                  // TODO: 远程资源包处理 添加http 服务器地址；
            // version = bundle_version.get(bundle_name)    // TODO: 获取远程包的版本号, 启动后通过http 获取 remote_bundle_version.json 文件；获取version 信息；
        }
        return { bundleName: bundle_name, path, isRemote, version}
    }
    
    // 加载失返回null,自行判断资源有效性
    public static async asynload<T extends Asset>(url: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            LoadCom.load<T>(url, (asset: T) => {
                resolve(asset)
            }, (err) => {
                warn(`加载资源失败: ${url} , 失败原因: ${err}`)
                resolve(null)
            })
        })
    }


    /**
     * @param url: bundle_xx/xx/xx/xxx         本地资源包资源加载；
     *             remoteBundle_xx/xx/../xxx   需要添加添加http服务器；bundle 可能来自不同项目；
     *             http(s)://xx/../xxx        直接远程资源加载
     */
    public static load<T extends Asset>(url: string, success?:(asset: T) => void, fail?:(err) => void): void {
        if (url == null || url.length == 0) throw new Error("Invalid URL");

        // 处理远程资源加载
        if (url.startsWith('http://') || url.startsWith('https://')) { 
            assetManager.loadRemote<T>(url, (err: any, assest: T) => err ? (fail?.(err)) : (success?.(assest)))
            return;
        }

        let { bundleName, path, isRemote, version } = LoadCom.parsePath(url)
        let tarBundle = assetManager.getBundle(bundleName)
        if (!!tarBundle) {
            LoadCom.getAsset<T>(path, tarBundle, success, fail)
        } else {
            let options = {}
            if (isRemote) options = { version: version }
            assetManager.loadBundle(bundleName, options, (error, bundle: AssetManager.Bundle) => {
                if (!!error) {
                    bundle = resources
                    warn(`Fail: 获取 ${bundleName} bundle 失败， 尝试从 resource bundle 获取目标资源`)
                }
                LoadCom.getAsset<T>(path, bundle, success, fail)
            })
        }
    }


}

