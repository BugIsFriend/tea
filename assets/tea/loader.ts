/**
 * author myerse.lee
 * created: 2024-09-25 17:10:15
 */
import { Asset, AssetManager, assetManager, warn } from 'cc'

/**
 * 获取资源
 * @param url 资源路径
 * @param bundle 资源包
 * @param resolve 成功回调
 * @param reject 失败回调
 */
function getAsset<T extends Asset>(url: string, bundle: AssetManager.Bundle, resolve?: Function, reject?: Function) {
    bundle.load<T>(url, (error: any, assest: T) => {
        if (!error) {
            resolve(assest)
        } else {
            reject(null)
            warn(`load assest:  ${url} fail `, error)
        }
    })
}

/**
 * 异步加载资源
 * @param url
 * @param bundleName
 * @returns
 */
export function asyncLoad<T extends Asset>(url: string, bundleName: string = 'resources'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let tarBundle = assetManager.getBundle(bundleName)
        if (!!tarBundle) {
            let asset: T = tarBundle.get<T>(url)
            if (asset) resolve(asset)
            else getAsset<T>(url, tarBundle, resolve, reject)
        } else {
            assetManager.loadBundle(bundleName, (error, bundle: AssetManager.Bundle) => {
                if (!!error) {
                    getAsset<T>(url, bundle, resolve, reject)
                } else {
                    reject(null)
                    warn(`load bundle: ${bundleName} error`, error)
                }
            })
        }
    })
}
