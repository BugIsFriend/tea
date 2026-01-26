/**
 * 单例装饰器, 这个对象不能被销毁；
 * 要实现自己的 clear()方法；
 * new 多少次 都只用一个实例对象；
 */
export abstract class ISingleton {

    public init(...args: any[]): void { }

    public  destroy(): void { }
}

export const singletons = new Map<any, ISingleton>(); 

export function singleton<T extends new (...args: any[]) => any>(constructor: T): T {

    // Return a subclass of the original constructor so instances are compatible with T
    return class extends constructor {
        
        constructor(...args: any[]) {
            let _instance: ISingleton = singletons.get(constructor as any)
            if (_instance) {
                return _instance as any;
            }
            super(...args);
            singletons.set(constructor, this as any);
            return _instance;
        }
        
    } as T;
}
