
export function swap<T>(arr: Array<T>, i: number, j: number) {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp; 
}