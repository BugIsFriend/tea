/**
 * author myerse.lee
 * created: 2024-09-25 17:10:15
 */
import {Component, Asset, AssetManager, assetManager, resources, warn ,_decorator} from 'cc'
const { ccclass } = _decorator;

@ccclass('LoadCom')
export class LoadCom extends Component {
    
    /**
     * 获取资源,获取失败返回 null
     * @param url 资源路径
     * @param bundle 资源包
     * @param resolve 成功回调
     */
    static getAsset<T extends Asset>(url: string, bundle: AssetManager.Bundle, resolve?: Function) {
        bundle.load<T>(url, (error: any, assest: T) => resolve(!error?assest:null))
    }


    static parsePath(url: string): { bundleName: string; path: string } {
        let _path = url.split('/')
        let bundleName = _path[0]
        let path = _path.slice(1).join('/')
        return { bundleName, path }
    }

    /**
     * 获取资源,获取失败返回 null
     * @param url
     * @param bundleName?: bundleName名不存在机会将 url 第一个路径解释为 bundle, 如果 不存在 bundle 将尝试从 resource获取资源
     * @returns
     */
    static async asynload<T extends Asset>(url: string): Promise<T | null> {
        return new Promise<T>((resolve) => {
            let { bundleName, path } = LoadCom.parsePath(url)
            let tarBundle = assetManager.getBundle(bundleName)
            if (!!tarBundle) {
                LoadCom.getAsset<T>(path, tarBundle, resolve)
            } else {
                assetManager.loadBundle(bundleName, (error, bundle: AssetManager.Bundle) => {
                    if (!!error) {
                        warn(`Fail: 获取 ${bundleName} bundle 失败， 尝试从 resource bundle 获取目标资源`)
                        bundle = resources
                    }
                    LoadCom.getAsset<T>(path, bundle, resolve)
                })
            }
        })
    }

}

