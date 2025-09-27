# 添加全局变量

## [Y] 引入 dayjs

## lodash 库为例

    1. 编译单个文件 lodash.js 将其拷贝到 assets/lib 文件下
       用lodash-cli 导出需要的库文件  例如：lodash exports=global -o ./dist/lodash.js
    2. 将 lodash.js 设置问插件
    3. 将所有的 lodash 所有的 d.ts 文件拷贝到 dts 文件下；
    4. 添加一个lodash.d.ts 文件 声明全局变量 [参考] https://ts.xcatliu.com/basics/declaration-files.html
    5. 在tsconfig.json 增加搜索   "types": ["./dts/lodash","./dts/lodash.d.ts"]
