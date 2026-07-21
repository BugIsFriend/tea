
namespace gizmo {

    export function random(start: number = 0, end: number = 1, float: boolean = true) { 
        let r = start+ Math.random()*(end-start)
        return float ? r:Math.floor(r)
    }
    
    export function swap<T>(arr: Array<T>, i: number, j: number):void {
        const temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp;
    }
}

export { gizmo }