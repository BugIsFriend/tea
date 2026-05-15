# Tea 项目框架分析与逐文件修改方案

## 1. 项目定位

该项目是一个 **Cocos Creator 3.8.8 + TypeScript** 工程，核心手写框架位于 `assets/tea`。

关键判断依据：

- `package.json:5` 使用 Cocos Creator `3.8.8`
- `tsconfig.json:3` 继承 `temp/tsconfig.cocos.json`
- 项目目录包含典型 Creator 产物目录：`assets/`、`library/`、`temp/`、`settings/`

`assets/tea` 这一层本质上是在 Cocos 之上封装了一套轻量公共框架，主要包括：

- 全局入口：`assets/tea/tea.ts`
- UI 弹窗系统：`assets/tea/ui.ts`、`assets/tea/ui/view.ts`、`assets/tea/ui/background.ts`
- 资源加载：`assets/tea/component/load.ts`
- 事件系统：`assets/tea/emitter.ts`
- 装饰器工具：`assets/tea/meta/method.ts`
- 状态机：`assets/tea/fsm/fsm.ts`
- 本地存储：`assets/tea/storage.ts`
- 调试系统：`assets/tea/debug/debug.ts`
- 列表组件：`assets/tea/ui/list/listview.ts`

---

## 2. 当前框架结构梳理

### 2.1 运行主链路

大致运行流如下：

1. 场景脚本启动
   - `assets/scene/UnitTest.ts:18`
2. 执行若干测试逻辑
   - emitter / dayjs / storage / seek
3. 调用 `tea.init()`
   - `assets/scene/UnitTest.ts:29`
4. `Tea.init()` 加载 `2DRoot` prefab 并初始化子系统
   - `assets/tea/tea.ts:24`
5. 初始化 `tip`、`ui`、`debug`
   - `assets/tea/tea.ts:26`
6. 后续通过 `ui.load(...).show(...)` 打开各类弹窗
   - `assets/scene/UnitTest.ts:37`

### 2.2 模块职责

#### A. 全局框架入口

- 文件：`assets/tea/tea.ts`
- 职责：
  - 加载公共根节点 `2DRoot`
  - 暴露 `root`、`tip`、`ui`、`debug`
  - 挂到 `window.tea`

#### B. UI 弹窗框架

- 文件：
  - `assets/tea/ui.ts`
  - `assets/tea/ui/view.ts`
  - `assets/tea/ui/background.ts`
- 职责：
  - View 栈管理
  - 弹窗打开/关闭
  - 公共背景遮罩
  - 动画回调

#### C. 资源加载层

- 文件：`assets/tea/component/load.ts`
- 职责：
  - bundle 加载
  - resources 加载
  - remote 加载

#### D. 事件系统

- 文件：`assets/tea/emitter.ts`
- 职责：
  - on / once / off / emit
  - 延迟消息发送

#### E. 装饰器系统

- 文件：`assets/tea/meta/method.ts`
- 职责：
  - `@seek` 自动取节点/组件
  - `@subscribe` 自动订阅消息
  - `@publish` 自动派发消息

#### F. 状态机

- 文件：`assets/tea/fsm/fsm.ts`
- 职责：
  - 状态组件注册
  - 切换状态
  - 调用 `enter/execute/exit`

#### G. 存储系统

- 文件：`assets/tea/storage.ts`
- 职责：
  - localStorage 封装
  - 过期时间支持
  - 预留加密能力

#### H. 调试系统

- 文件：`assets/tea/debug/debug.ts`
- 职责：
  - 注册调试 case
  - 按键拉起调试界面

#### I. 可复用 UI 组件

- 文件：`assets/tea/ui/list/listview.ts`
- 职责：
  - 列表滚动
  - item 复用
  - 回弹/惯性

---

## 3. 项目优点

1. **框架意识明确**
   - 已经不是纯脚本堆积，而是在沉淀自己的基础设施。

2. **公共能力集中**
   - UI、加载、事件、状态机、调试都有统一入口，后续复用空间大。

3. **组件拆分方向是对的**
   - `View`、`Background`、`ListView`、`LoadCom` 的职责边界基本清晰。

4. **开发调试便利性不错**
   - `debug`、`UnitTest`、装饰器语法、全局入口这些都降低了开发成本。

---

## 4. 当前主要问题总览

### 4.1 设计层问题

- 单例方案不统一
- 全局访问过多
- 生命周期管理偏弱
- 装饰器和事件系统耦合偏重
- 测试代码与正式代码混杂

### 4.2 代码层问题

- 存在多处高概率运行时 bug
- Promise 返回值不完整
- 共享默认对象被污染
- 事件注册/解绑不对称
- 类型保护不足

---

## 5. 高优先级潜在 Bug 清单

### Bug 1：storage 读写结构不一致  [✅ Done]

- 文件：`assets/tea/storage.ts:34`
- 文件：`assets/tea/storage.ts:85`

问题：

- `decode()` 返回的是 `obj.value`
- `get()` 却把返回值当成 `StorageValue<T>` 使用

影响：

- 过期逻辑可能完全失效
- `get()` 的返回值结构不稳定

风险等级：**P0**

### Bug 2：Emitter 有效性判断逻辑错误  [✅ Done]

- 文件：`assets/tea/emitter.ts:26`

问题：

- `if (item.context?.isValid || !isValid(item.context))`
- 这个判断会把“有效对象”也清掉

影响：

- 已注册监听可能随机失效
- 排查难度很高

风险等级：**P0**

---

### Bug 3：delay emit 参数未展开   [✅ Done]

- 文件：`assets/tea/emitter.ts:74`

问题：

- `emmiter.emit(id, param)` 传的是数组
- 正常 `emit()` 是可变参数

影响：

- 延迟触发与即时触发参数形态不一致

风险等级：**P0**

---

### Bug 4：Unit.gain 初始化对象错误   [✅ Done]

- 文件：`assets/tea/unit.ts:31`

问题：

- 新建组件后执行的是 `this.init(data)`
- 应该是新创建组件的初始化，而不是宿主对象初始化

影响：

- 新组件首次挂载逻辑失效
- 组件表现不稳定

风险等级：**P0**

---

### Bug 5：FSM owner 未赋值  [✅ Done]

- 文件：`assets/tea/fsm/fsm.ts:19`
- 文件：`assets/tea/fsm/fsm.ts:82`
- 文件：`assets/tea/fsm/fsm.ts:101`

问题：

- `owner` 定义了，但未看到初始化

影响：

- 状态组件执行 `enter/execute/exit` 时拿到的 owner 可能是 `undefined`

风险等级：**P0**

---

### Bug 6：UI.show 异步分支返回值缺失

- 文件：`assets/tea/ui.ts:102`

问题：

- `ui.show(_view, closeCb, param)` 调用后没有 return

影响：

- 外部 `await ui.load(...).show()` 行为不稳定

风险等级：**P1**

---

### Bug 7：defaultParam 被污染  [✅ Done]

- 文件：`assets/tea/ui.ts:117`

问题：

- `Object.assign(this.defaultParam, ...)` 直接修改默认配置对象

影响：

- 后一个弹窗可能继承前一个弹窗背景参数

风险等级：**P1**

---

### Bug 8：Background 事件绑定不对称     [✅ Done]

- 文件：`assets/tea/ui/background.ts:95`
- 文件：`assets/tea/ui/background.ts:97`

问题：

- `off` 用 `TOUCH_START`
- `on` 用 `TOUCH_END`

影响：

- 重复绑定
- 解绑无效
- 点击行为异常

风险等级：**P1**

---

### Bug 9：View 缺少无动画兜底完成态

- 文件：`assets/tea/ui/view.ts:115`
- 文件：`assets/tea/ui/view.ts:126`

问题：

- 状态推进依赖 `aniFunc`
- 如果动画映射缺失，状态可能停在 Opening/Closing

影响：

- 弹窗可能无法正常关闭或进入显示完成态

风险等级：**P1**

---

### Bug 10：装饰器订阅绑定到 prototype 而不是实例

- 文件：`assets/tea/meta/method.ts:109`
- 文件：`assets/tea/meta/method.ts:125`

问题：

- `oldvalue.apply(target, args)` 用的是 `target`
- 订阅注册发生在装饰器定义阶段，生命周期不清晰

影响：

- 多实例串用
- 销毁后不释放
- 上下文错乱

风险等级：**P1/P2**

---

## 6. 逐文件修改方案

下面只列建议，不直接改代码，便于后续按计划实施。

---

### 6.1 `assets/tea/storage.ts`

#### 要解决的问题

1. `decode()` 返回值结构错误
2. `get()` 依赖错误结构
3. `set()` 会直接删除传入对象的 `expire` / `encrypt` 字段，副作用偏大

#### 建议修改

1. **让 `decode()` 返回完整 `StorageValue<T>`**
   - 现在返回 `obj.value`
   - 建议改为返回完整对象 `{ value, expire, encrypt }`

2. **让 `get()` 只在读取完整结构后再判断过期**
   - 先 parse
   - 再判断 `expire`
   - 最后返回 `value`

3. **避免 `set()` 直接修改传入 data**
   - 不要 `delete data.expire`
   - 不要 `delete data.encrypt`
   - 建议通过浅拷贝组装真实存储对象

4. **明确 `remove(key, id?)` 是否也支持 id**
   - 现在 `set/get` 支持拼接 id
   - `remove` 没统一这一行为，容易调用错

#### 修改后预期收益

- 存储行为可预测
- 过期逻辑恢复正常
- 避免外部对象被偷偷篡改

---

### 6.2 `assets/tea/emitter.ts`

#### 要解决的问题

1. 监听有效性判断错误
2. delay 参数传递错误
3. `_.orderBy` 未接回结果，优先级排序可能没生效
4. `off()` 没有处理 once 队列

#### 建议修改

1. **修正 `checkEmmit()`**
   - 目标是：
     - 如果 context 是 Cocos 对象且已经失效，则移除
     - 普通对象不要误删

2. **修正 `delay()` 参数转发**
   - 改为展开参数转发

3. **修正 `on()` 中优先级排序**
   - `_.orderBy()` 返回新数组，不会原地改
   - 需要接住结果再重新写回 `msgMap`

4. **补充 `off()` 对 once 队列的清理**
   - 否则 `once()` 的监听可能残留

5. **统一命名与拼写**
   - `checkEmmit` / `emmiter` 有拼写问题
   - 不一定是功能 bug，但影响维护性

#### 修改后预期收益

- 消息系统可稳定支撑 UI、调试、业务广播
- 降低“偶发监听失效”这类最难排查问题

---

### 6.3 `assets/tea/unit.ts`

#### 要解决的问题

- `gain()` 初始化调错对象

#### 建议修改

1. **新增组件后调用新组件自己的 `init(data)`**
2. **保持已有组件不重复 init**
3. **如果希望支持所有 `Component`，建议先判断 `init` 是否存在**

#### 修改后预期收益

- `gain()` 真正变成可靠的 get-or-add 辅助方法

---

### 6.4 `assets/tea/fsm/fsm.ts`

#### 要解决的问题

1. owner 未初始化
2. `curState` 初始状态切换流程不完整
3. 状态名和组件名强绑定，运行时容易失败

#### 建议修改

1. **在 `init()` 或 `onLoad()` 中设置 `this.owner = this.node`**
2. **进入初始状态前先校验 `curState` 是否存在**
3. **如果 `curState` 为空，避免直接 `addComponent('')`**
4. **切换前后增加必要保护**
   - 当前状态不存在时不要直接调用 `exit`
   - 下一个状态组件不存在时给出明确错误

#### 修改后预期收益

- 状态机不再依赖隐式假设
- 场景节点状态切换更稳定

---

### 6.5 `assets/tea/ui.ts`

#### 要解决的问题

1. `show()` 返回值不稳定
2. 默认背景参数被污染
3. `uiViews` 生命周期依赖太隐式
4. 全局单例写法重复

#### 建议修改

1. **修复异步 `show()` 分支 return**
   - 加载 view 后直接返回真正的 `show()` 结果

2. **避免污染 `defaultParam`**
   - 不要对默认对象 `Object.assign`
   - 应该合成新对象

3. **补足 view 重复 show 的语义**
   - 已存在 view 时，是重新打开、置顶还是忽略，要统一

4. **梳理 `uiViews` 与背景层的关系**
   - 当前背景动画逻辑依赖 active 状态和 sibling index，容易在边界条件出错

5. **统一单例出口**
   - 文件末尾已有 `export const ui = new UI()`
   - 那 `Tea.ui` 就不该继续 `new UI()`

#### 修改后预期收益

- 弹窗系统行为更稳定
- 减少弹窗叠层和背景错乱问题

---

### 6.6 `assets/tea/ui/view.ts`

#### 要解决的问题

1. 无动画时状态无法闭环
2. 回调触发依赖较强

#### 建议修改

1. **给 `show()` / `close()` 增加无动画兜底**
   - 没有动画函数时也要直接推进到完成态

2. **确认 `appendShowedCb` / `appendClosedCb` 是否需要一次性回调语义**
   - 当前是累积数组，重复 show/close 可能重复触发

3. **检查 `EventHandler.emit([customEventData])` 是否符合你的使用约定**
   - 如果后续要给更多参数，需要统一约定

#### 修改后预期收益

- View 生命周期完整
- 动画配置遗漏不再导致逻辑卡死

---

### 6.7 `assets/tea/ui/background.ts`

#### 要解决的问题

1. 事件注册/解绑不对称
2. 硬编码 UUID 加载 spriteFrame
3. 触摸关闭逻辑容易串行为

#### 建议修改

1. **统一 `on/off` 事件类型**
2. **检查 `_onTouch` 状态机是否覆盖 touch/touchClose 的全部组合**
3. **避免硬编码资源 UUID**
   - 改成可配置资源路径或直接序列化字段
4. **明确 `touch` 与 `touchClose` 的职责**
   - 是触发 handler，还是关闭 view，还是两者都做，需要固定规则

#### 修改后预期收益

- 背景点击行为可预测
- 资源迁移时更不容易失效

---

### 6.8 `assets/tea/meta/method.ts`

#### 要解决的问题

1. `@subscribe` / `@publish` 绑定上下文错误
2. 装饰器订阅生命周期不可控
3. `seek` 结果缓存需要更明确的释放约定

#### 建议修改

1. **把 `apply(target, args)` 改成基于实例 `this` 执行**
2. **不要在装饰器定义阶段直接全局订阅**
   - 建议改成实例初始化后注册，销毁时解绑
3. **给 `unlinkProperty()` 配套统一调用点**
   - 比如 `onDestroy()` 中统一清理
4. **`seek` 对数组节点匹配建议从“名字包含前缀”改成更明确规则**
   - 当前约定比较隐式，后续维护容易踩坑

#### 修改后预期收益

- 装饰器从“语法糖”变成“可靠工具”
- 避免实例串线和内存泄漏

---

### 6.9 `assets/tea/tea.ts`

#### 要解决的问题

1. 单例方式不统一
2. `window.tea` 与导出实例并存
3. root 初始化依赖 prefabRoot 已完成加载

#### 建议修改

1. **统一全局入口方案**
   - 二选一：
     - `export const tea = new Tea()`
     - 或严格类单例 `Tea.instance`
2. **`tip` / `ui` getter 不要每次 `new`**
3. **如果 `root` 可能在 `init()` 前访问，需要加保护**
   - 否则 `prefabRoot` 为空时会直接 instantiate 失败

#### 修改后预期收益

- 降低框架理解成本
- 入口对象生命周期更明确

---

### 6.10 `assets/tea/debug/debug.ts`

#### 要解决的问题

1. debug 功能可能泄漏到正式环境
2. 调试视图异步加载与 show 生命周期不完全受控

#### 建议修改

1. **给 debug 系统增加环境开关**
   - 仅开发环境启用按键监听
2. **避免重复加载过程中多次 show**
   - 增加 loading 状态或 Promise 缓存
3. **梳理 case/group/flow 的数据结构一致性**
   - `Map<Group, DebugDatas>` 和 `Map<KeyType, ICaseData[]>` 语义还可以再清晰些

#### 修改后预期收益

- debug 系统更安全
- 不影响正式运行

---

### 6.11 `assets/tea/component/load.ts`

#### 要解决的问题

1. `asynload()` 命名与标准英文不一致
2. bundle fallback 太宽松
3. 错误处理和日志策略需要更统一

#### 建议修改

1. **统一命名风格**
   - ` ` 建议改为更标准的异步命名
2. **明确 bundle 加载失败后的 fallback 规则**
   - 不是所有 bundle 失败都应该自动回退到 `resources`
3. **补上远程 bundle 的未实现边界说明**
   - 当前 remote bundle 只是预留接口，最好避免误用

#### 修改后预期收益

- 资源加载策略更透明
- 减少“加载失败但被 fallback 掩盖”的问题

---

### 6.12 `assets/tea/ui/list/listview.ts`

#### 要解决的问题

1. 逻辑复杂度高，边界风险大
2. 回弹、复用、惯性、cursor 更新容易相互影响
3. 生命周期与节点销毁需要更仔细

#### 建议修改

1. **优先补测试而不是马上大改**
2. **重点验证场景**
   - 空数据
   - 单条数据
   - 超长列表
   - 快速滑动
   - 动态替换 `dataList`
   - 横向/纵向
3. **梳理 `cursor.min/max` 与 item 回收条件**
4. **检查 `itemPool.alloc()` 后的节点状态复原是否完整**
   - 位置、scale、active、事件等
5. **考虑拆分“滚动计算”和“item 渲染复用”逻辑**
   - 当前一个类承担太多职责

#### 修改后预期收益

- 降低后续 UI 列表类 bug 频率
- 便于扩展分页、异步渲染等能力

---

## 7. 推荐落地顺序

### 第一阶段：先修基础正确性（P0）

1. `assets/tea/storage.ts`
2. `assets/tea/emitter.ts`
3. `assets/tea/unit.ts`
4. `assets/tea/fsm/fsm.ts`

目标：

- 先让底层能力“行为正确”
- 避免上层 UI/业务排错时被底层假问题干扰

### 第二阶段：修 UI 主链路（P1）

1. `assets/tea/ui.ts`
2. `assets/tea/ui/view.ts`
3. `assets/tea/ui/background.ts`

目标：

- 让弹窗系统稳定可控

### 第三阶段：修框架一致性（P1/P2）

1. `assets/tea/tea.ts`
2. `assets/tea/meta/method.ts`
3. `assets/tea/debug/debug.ts`
4. `assets/tea/component/load.ts`

目标：

- 统一单例、生命周期、订阅机制

### 第四阶段：处理复杂组件（P2）

1. `assets/tea/ui/list/listview.ts`

目标：

- 通过测试和局部重构，稳住复杂组件

---

## 8. 推荐的复查方式

后续你每次复查时，可以按这个顺序看：

1. **先看基础层是否已改**
   - `storage.ts`
   - `emitter.ts`
   - `unit.ts`
   - `fsm.ts`

2. **再看 UI 主链路是否已稳定**
   - `ui.ts`
   - `view.ts`
   - `background.ts`

3. **最后看框架治理项**
   - `tea.ts`
   - `meta/method.ts`
   - `debug.ts`
   - `listview.ts`

建议每改完一个文件，就补一次最小场景验证，不要全部改完再一起测。

---

## 9. 一句话结论

这个项目已经有一套可用的 Cocos 公共框架雏形，但当前更像“第一版工程化尝试”：方向是对的，结构也已经成型，接下来最值得做的不是继续加功能，而是优先修掉基础层的正确性问题，再收敛单例、生命周期和 UI 栈行为。
