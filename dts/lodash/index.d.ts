/// <reference path="./common/common.d.ts" />
/// <reference path="./common/array.d.ts" />
/// <reference path="./common/collection.d.ts" />
/// <reference path="./common/date.d.ts" />
/// <reference path="./common/function.d.ts" />
/// <reference path="./common/lang.d.ts" />
/// <reference path="./common/math.d.ts" />
/// <reference path="./common/number.d.ts" />
/// <reference path="./common/object.d.ts" />
/// <reference path="./common/seq.d.ts" />
/// <reference path="./common/string.d.ts" />
/// <reference path="./common/util.d.ts" />

export = lodash
export as namespace lodash

declare const lodash: lodash.LoDashStatic
declare namespace lodash {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface -- (This will be augmented)
    interface LoDashStatic {}
}
// declare const _: LoDashStatic
// interface LoDashStatic {}
