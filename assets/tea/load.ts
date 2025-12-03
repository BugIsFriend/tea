/**
 * author myerse.lee
 * created: 2024-09-25 17:10:15
 */
import { Asset, AssetManager, assetManager, resources, warn } from 'cc'

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
 * @param bundleName?: bundleName名不存在机会将 url 第一个路径解释为 bundle, 如果 不存在 bundle 将尝试从 resource获取资源
 * @returns
 */
export function asynload<T extends Asset>(url: string, bundleName?: string): Promise<T| null>  {
    return new Promise<T>((resolve, reject) => {
        let _path = url
        if (!bundleName) { 
            let sidx = url.indexOf('/')
            bundleName = url.substring(0,sidx)
            _path =  url.substring(sidx+1)
        }
        let tarBundle = assetManager.getBundle(bundleName)
        if (!!tarBundle) {
            let asset: T = tarBundle.get<T>(_path)
            if (asset) resolve(asset)
            else getAsset<T>(url, tarBundle, resolve, reject)
        } else {
            assetManager.loadBundle(bundleName, (error, bundle: AssetManager.Bundle) => {
                if (!!error) {
                    warn(`Fail: 获取 ${bundleName} bundle 失败， 尝试从 resource bundle 获取目标资源`)
                    bundle = resources
                    _path = url
                }
                getAsset<T>(_path, bundle, resolve, reject)
            })
        }
    })
}
