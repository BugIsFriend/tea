

/**
 * 单例装饰器
 * new 多少次 都只用一个实例对象；
 */
export function singleton<T extends new (...args: any[]) => any>(constructor: T): T {
    let instance: InstanceType<T> | null = null;

    // Return a subclass of the original constructor so instances are compatible with T
    return class extends constructor {

        
        constructor(...args: any[]) {
            if (instance) {
                return instance as any;
            }
            super(...args);
            instance = this as InstanceType<T>;
        }
    } as T;
}
