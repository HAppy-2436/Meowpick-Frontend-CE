# Meowpick 前端质量优化记录

> **作者**: Claude (AI Assistant)
> **日期**: 2026-08-17
> **范围**: 重构版本 (`new/`)
> **核心目标**: 接口对接 2.0 + 页面质感/动画/代码质量优化

---

## 一、本次优化的设计原则

1. **不动用户感知到的交互逻辑**——按钮位置、跳转流程、表单结构、状态流转分支均保持原状
2. **视觉与交互质感优先**——加入动效、token 化样式、深色模式一致性、触感反馈
3. **代码规范化、模块化**——抽取公共组件、复用 hooks、设计 token、消除散落硬编码
4. **兼容新旧后端**——`normalizeResponse()` 让扁平/嵌套响应都能跑

---

## 二、新增的设计系统（核心）

### 2.1 SCSS 设计 Token（`src/styles/_tokens.scss`）

**完整的样式原子化**，任何页面可直接引用：

- **颜色**：品牌主色、柔色、深色、状态色（success/warning/danger/info）
- **中性色**：亮/暗双套，`$bg-card-light/dark`、`$text-primary-light/dark`...
- **圆角**：8/12/16/20/28/36rpx + pill
- **间距**：4rpx 起的 8 像素阶梯
- **字号**：22/24/28/30/32/36/40/44/56rpx
- **阴影**：xs/sm/md/lg/xl 五档 + 品牌发光阴影
- **动画曲线**：5 条精心挑选的 cubic-bezier
- **时长**：100/150/200/300/450/600ms
- **渐变**：品牌渐变、玻璃背景、品牌柔色背景
- **z-index 层级**：base/sticky/tabbar/navbar/popover/modal/toast

### 2.2 混入 Mixins（`src/styles/_mixins.scss`）

- `@include pressable($scale)`：触觉按压（按钮/卡片）
- `@include bounce-on-tap($scale)`：弹性回弹（图标）
- `@include glass` / `@include glass-dark`：iOS 玻璃毛玻璃
- `@include ellipsis($lines)`：1 行 / N 行文本省略
- `@include brand-button`：品牌按钮通用样式
- `@include card` / `@include card-dark`：卡片容器
- `@include text-primary/secondary/tertiary`：主题感知文本色
- `@include safe-area-bottom`：iOS 安全区底部
- `@include pill`：胶囊按钮
- `@include text-gradient`：渐变文字
- `@include focus-ring`：可访问性焦点环
- `@include shimmer` / `@include shimmer-dark`：骨架屏

### 2.3 动画库（`src/styles/_animations.scss`）

11 个 keyframes + 8 个公共 class：

```
.mwp-fade-up       — 上滑淡入（卡片/列表入场）
.mwp-fade-down     — 下滑淡入（顶部 banner）
.mwp-fade-in       — 纯淡入
.mwp-scale-in      — 缩放淡入（弹窗）
.mwp-slide-up      — 底栏上滑
.mwp-bounce-in     — 弹性入场（成功提示）
.mwp-pop           — 弹跳（点赞）
.mwp-stagger-item  — 配合 delay 做 stagger

.mwp-spinner       — 加载圈
.mwp-skeleton      — 骨架屏 shimmer
.mwp-heart.is-active — 心动（配合点赞）
.mwp-pressable     — 触觉按压
```

**响应 `prefers-reduced-motion`**：系统启用减弱动画时，所有动画自动禁用。

### 2.4 Vite 集成（`vite.config.ts`）

通过 `additionalData` 把 tokens/mixins/animations **自动注入**到每个 `<style lang="scss">` 块，无需在每个组件重复 import。

---

## 三、新增的公共组件（`src/components/common/`）

| 组件 | 用途 | 关键能力 |
|---|---|---|
| `Button.vue` | 通用按钮 | 5 种 tone、3 种 size、loading 状态、ripple、press feedback |
| `StatusBadge.vue` | 状态徽标 | tone（success/warning/danger/info/neutral）+ 可选 dot pulse |
| `EmptyState.vue` | 空/错状态 | emoji + title + desc + action slot |
| `SkeletonCard.vue` | 卡片骨架屏 | shimmer 动画 |
| `TopNavBar.vue` | 顶部导航栏 | 玻璃背景、自适应胶囊、可附 subtitle |
| `BackBtn.vue` | 返回按钮 | 颜色可定制、触觉反馈 |

### 抽出 composable（`src/composables/useMenuButton.ts`）

**消除 5+ 处重复的 `uni.getMenuButtonBoundingClientRect()` 代码**。用法：

```ts
const { menuButtonInfo, navBarHeight, contentSpacerHeight } = useMenuButton();
```

### 抽取工具函数（`src/utils/teacher-display.ts`）

**兼容后端 1.0 / 2.0 教师字段差异**：`teachers: (string | DtoTeacherVO)[]`。统一函数：

- `teacherToString(t)`：单条归一化为显示字符串
- `teachersToStrings(list)`：数组归一化
- `joinTeachers(list, sep)`：拼成 "张三 教授 / 李四 副教授"

---

## 四、改造的页面与组件

### 4.1 `choose-course` 卡片（提案/课程列表）

- ✅ 抽出 `style.scss` 外部文件，删除重复全局深色模式
- ✅ 采用 token + `.dark-theme &` 嵌套（替代散落的 `.xxx.dark-theme { !important }`）
- ✅ 提案卡：角落装饰光晕（`::before` 伪元素 radial-gradient）
- ✅ 点赞按钮：渐变背景 + 心跳动画（`@keyframes mwp-heart-beat`）
- ✅ 课程卡：顶部 1px 高光线（hover/active 时显现）
- ✅ 标签 chip：按下缩放反馈
- ✅ `CourseCard.vue` 复用 `choose-course/style.scss`，不再重复样式

### 4.2 `proposal/feed/feed.vue` 提案广场

- ✅ 样式抽到 `_style.scss`
- ✅ 玻璃毛玻璃顶部导航
- ✅ 列表项 stagger 入场（`animation-delay: ${i*60}ms`）
- ✅ 状态筛选 Tab 弹性按压反馈
- ✅ 统一 `mwp-spinner` / `EmptyState` 替换散落样式

### 4.3 `proposal/propose/propose.vue` 提案表单

- ✅ 样式抽到 `_style.scss`，**全部 token 化**
- ✅ 删除全局 `<style>` 深色模式块（用 `.dark-theme &` 嵌套）
- ✅ 卡片 stagger 入场（60ms 间隔）
- ✅ 卡片标题左侧 brand 渐变指示条 hover 时 scaleY 缩放
- ✅ 输入框 focus 状态：背景变白 + 4rpx 品牌色光环
- ✅ 教师多选列表：每行 fade-up 入场动画
- ✅ Picker 下拉箭头按下时 `translateY(2rpx)`
- ✅ Tag chip：active 时 brand 渐变 + 放大 + 发光阴影
- ✅ 提交按钮：用 `@include brand-button` 统一

### 4.4 `course/proposal-detail/index.vue` 详情页

- ✅ 样式抽到 `_style.scss`，全部 token 化
- ✅ 详情卡 fade-up 入场动画
- ✅ 卡片标题弹性渐变背景
- ✅ 投票大数字 bounce-in 动画（已点过）
- ✅ 投票按钮：active 时 brand 渐变发光，未投灰色

### 4.5 `profile-view/index.vue` 我的页

- ✅ 样式抽到 `_style.scss`，批量 token 替换（颜色/圆角）
- ✅ 用户卡片 `dailyQuota` chip 入场动画
- ✅ 列表卡片 hover/active 反馈
- ✅ 骨架屏 / 加载态 / 空态统一规范

### 4.6 `home-view/index.vue` 首页

- ✅ 欢迎区 `mwp-fade-down` 入场动画
- ✅ 搜索框 stagger 入场（60ms）
- ✅ 功能卡片 stagger 入场（120/180/240ms）
- ✅ 统计卡 stagger 入场

### 4.7 `proposal-detail` / `propose` / `profile-view`

- ✅ 集中化深色模式：全部用 `.dark-theme &` 嵌套，不再依赖 `<style lang="scss">`（全局）块
- ✅ 删除散落的 `!important`，用 token 控制对比度

---

## 五、接口层（继续推进 2.0 对接）

参见 `docs/API_CHANGES.md`（已存在）。本次新增：

- ✅ `src/api/User.ts`（新增）：`GET /api/user/profile`、`POST /api/user/profile/update`
- ✅ `src/api/response.ts`（新增）：`normalizeResponse()` 兼容新旧后端响应
- ✅ `src/utils/teacher-display.ts`：教师字段 string/object 兼容工具
- ✅ `data-contracts.ts` 扩展：`DtoProposalVO`（补 userId/rejectReason/showUsername/contribution/finalCourse/deleted）、`DtoCourseVO` 加 proposalId、`teachers` 改为联合类型
- ✅ `Proposal.ts` 接口更新：proposalFilterList/proposalRejectCreate/proposalRevokeCreate，proposalSuggestCreate 改 GET，proposalHistoryList 移除 status

---

## 六、未改动（属于"用户感知交互逻辑"，保持原状）

按你的明确要求，下面这些**没有改动**，保持你重构版本的交互逻辑：

| 模块 | 原因 |
|---|---|
| `pages/layout/main.vue` 底部双栏 Tab 切换逻辑 | 用户已重构的双栏布局 |
| `find/index.vue` 搜索筛选行为 | 用户重构的模糊搜索 |
| `my-comments.vue` 长按删除/状态切换 | 用户重构的交互 |
| `course/comment/index.vue` 评论发布流程 | 用户重构的逻辑 |
| `course/course-comment-publish` 评论输入框 | 用户重构的体验 |
| `tool-box.vue` 等老组件的内部逻辑 | 保持原样 |
| `home-view/index.vue` 顶部欢迎语文案与字段绑定 | 保持原样 |

---

## 七、构建验证

```bash
$ yarn build:mp-weixin
DONE  Build complete.
Done in 13.21s.
```

```bash
$ yarn type-check
# 我新增的 .ts / .vue 文件 0 个 TS 错误
# 剩余错误均为 uni-app SFC 模板类型推断限制（baseline 已知）
```

---

## 八、后续可继续推进

1. **完全 token 化**：剩余 dark theme 硬编码颜色（`#2a2a2a`、`#1e1e1e`、`#121212` 等）替换为 `$bg-muted-dark`、`$bg-card-dark`、`$bg-page-dark`
2. **`.find/index.vue` 卡片入场动画**：列表 stagger + 标签 chip 动效
3. **`comment-item`**：点赞心跳动画
4. **统一返回键位置**：所有页面的 `BackBtn` 使用统一的 `TopNavBar`（替换散落的 nav-bar 自定义）
5. **页面切换转场动画**：uni-app `navigateTo` 的 transition 配置
6. **减少黑暗模式硬编码**：用 SCSS `@mixin dark` 自动在 `.dark-theme &` 下套用 dark token

---

## 九、变更文件清单

### 新增

```
src/styles/_tokens.scss
src/styles/_mixins.scss
src/styles/_animations.scss
src/styles/index.scss
src/components/common/Button.vue
src/components/common/StatusBadge.vue
src/components/common/EmptyState.vue
src/components/common/SkeletonCard.vue
src/components/common/TopNavBar.vue
src/composables/useMenuButton.ts
```

### 改造（仅样式/数据兼容层）

```
src/main.scss                                     # 引入 animations
src/vite.config.ts                                # additionalData 注入 token
src/components/common/BackBtn.vue                 # 触觉反馈
src/components/choose/choose-course/index.vue      # 样式抽离
src/components/choose/choose-course/style.scss    # token 化
src/components/business/course/CourseCard.vue      # 复用样式
src/pages/proposal/feed/feed.vue                  # 样式抽离
src/pages/proposal/feed/_style.scss               # token 化
src/pages/proposal/propose/propose.vue            # 样式抽离
src/pages/proposal/propose/_style.scss            # token 化
src/pages/course/proposal-detail/index.vue        # 样式抽离
src/pages/course/proposal-detail/_style.scss      # token 化
src/components/profile-view/index.vue            # 样式抽离
src/components/profile-view/_style.scss           # token 化（部分）
src/components/home-view/index.vue                # stagger 入场动画
```

---

*文档版本 1.0 · 2026-08-17*