# Meowpick 重构版 · 开发者视角

> 最后更新：2026-08-17

## 一句话总览

**这是一个 token 化、模块化、动效齐全、TypeScript 零错误、构建 10 秒的 uni-app 重构版。** 接手前 30 分钟读这份文档能搞清楚整个架构。

---

## 1. 完整的设计系统（src/styles/）

```
src/styles/
├── _tokens.scss      # 122 设计 tokens（颜色/间距/字号/圆角/阴影/动画/渐变）
├── _mixins.scss       # 11 个 SCSS mixins（@include pressable, glass, card, ellipsis）
├── _animations.scss   # 14 个 keyframes + 12 个公共动画类 + .mwp-placeholder
└── index.scss         # 入口（除了 _tokens.css 内部用外，SFC 里 import 它就行）
```

**所有 28+ 个 SFC 都通过 sass `additionalData`（vite.config.ts）自动注入这些 tokens 与 mixins**——所以你在 .vue 里写 `color: $text-primary-light` 直接可用。

### 核心 tokens 速记

| 类别 | 关键变量 |
|---|---|
| 颜色 | `$brand-red`, `$success`, `$warning`, `$danger-deep`, `$info` |
| 文本 | `$text-primary-light/dark`, `$text-secondary-light/dark`, `$text-tertiary-light/dark`, `$text-placeholder-light/dark` |
| 背景 | `$bg-page-light/dark`, `$bg-card-light/dark`, `$bg-muted-light/dark`, `$bg-muted-darker` |
| 间距 | `$space-1` 至 `$space-12`（4rpx 起 8 像素阶梯） |
| 圆角 | `$radius-xs`(8) → `$radius-2xl`(36)，`$radius-pill` |
| 阴影 | `$shadow-xs` → `$shadow-xl`，`$shadow-brand-sm/md/lg`（带发光） |
| 动画 | `$dur-instant`(100ms) → `$dur-slower`(600ms)；`$ease-standard/emphasized/decelerate/spring` |
| 按压 | `$press-scale-sm`(0.97), `$press-scale-md`(0.94), `$press-scale-lg`(0.92) |
| 层级 | `$z-base` → `$z-modal`（z-index 单点管理） |

### 动画公共类（直接用）

```vue
<view class="mwp-fade-up">         <!-- 上滑淡入 -->
<view class="mwp-fade-down">       <!-- 下滑淡入 -->
<view class="mwp-scale-in">        <!-- 缩放淡入 -->
<view class="mwp-bounce-in">       <!-- 弹性入场 -->
<view class="mwp-stagger-item"    <!-- stagger 列表（配合 :style 动态 delay） -->
<view class="mwp-pressable">       <!-- 任何可点击元素 -->
<view class="mwp-spinner">         <!-- 加载 spinner -->
<view class="mwp-skeleton">       <!-- 骨架 shimmer -->
<view class="mwp-heart is-active"> <!-- 心动（点赞时） -->
```

### Mixin 用法

```scss
@include pressable($press-scale-md);   // 触觉按压
@include card;                          // 卡片容器
@include ellipsis(2);                   // 2 行省略
@include text-gradient;                 // 渐变文字
```

---

## 2. 10 个公共组件（src/components/common/）

| 组件 | 用途 | 关键 API |
|---|---|---|
| `TopNavBar.vue` | 顶部导航栏 | `<TopNavBar title subtitle :show-back @back>` |
| `BackBtn.vue` | 返回按钮 | `<BackBtn color="white">` |
| `Button.vue` | 通用按钮 | `<Button tone="brand" size="lg" block loading>` |
| `StatusBadge.vue` | 状态徽标 | `<StatusBadge status="pending" pill dot>` |
| `EmptyState.vue` | 空/加载失败 | `<EmptyState title desc emoji="🐾">` |
| `SkeletonCard.vue` | 骨架屏 | `<SkeletonCard count="3">` |
| `SearchModal.vue` | 字段搜索弹窗 | `<SearchModal field="department" title>` |
| `TeacherListModal.vue` | 教师列表 | `<TeacherListModal :teachers @add @remove>` |
| `AddTeacherModal.vue` | 添加教师 | `<AddTeacherModal @confirm>` |
| `RejectModal.vue` | 拒绝理由 | `<RejectModal @confirm>` |

**总计约 1500 行**——可被任何页面复用。

### 组件示例

```vue
<StatusBadge tone="success" pill>已通过</StatusBadge>
<EmptyState
  title="暂无提案"
  desc="快来发起第一个吧～"
  emoji="🐾"
>
  <template #action>
    <Button tone="brand" @click="goToPropose">发起提案</Button>
  </template>
</EmptyState>
```

---

## 3. 1 个 composable（src/composables/）

`useMenuButton()` —— 取代所有页面里重复的 `uni.getMenuButtonBoundingClientRect()` 样板：

```vue
<script setup>
import { useMenuButton } from '@/composables/useMenuButton';
const { menuButtonInfo, navBarHeight, contentSpacerHeight } = useMenuButton();
</script>

<template>
  <view :style="{ height: navBarHeight + 'px' }"></view>
</template>
```

**好处**：
- 单一来源（不再散落 10+ 处 try/catch）
- 类型安全
- 容易单测

---

## 4. 4 条 API 接入路径

| 路径 | 状态 |
|---|---|
| `src/api/User.ts` | ✅ 新增（UserController.userProfileList / userProfileUpdateCreate） |
| `src/api/Proposal.ts` | ✅ 完整（filterList / rejectCreate / revokeCreate / approveCreate 加 body） |
| `src/api/response.ts` | ✅ 兼容新旧后端响应结构（扁平 ↔ 嵌套自动归一） |
| `src/utils/teacher-display.ts` | ✅ 教师字段 `string \| DtoTeacherVO` 归一化 |

**响应兼容**：前端 `res.data?.data` 与 `res.data?.proposalId` 都能跑。

---

## 5. 页面结构（5 页 + 1 主页）

```
src/pages/
├── layout/main.vue           # 入口（双栏 Tab + 状态栏主题）
├── home/                      # letter, update-log, InformationBox (folder)
├── course/                    # index, comment, proposal-detail
├── find/                      # 搜索页(folder) + choose (folder)
└── proposal/                  # list (权限感知 3Tab) + propose (3 模式)
```

**路由总数 10 条**（pages.json）。

### 关键页面说明

- **`pages/proposal/list.vue`**：**权限感知主入口**。管理员看到 3 Tab（全部提案 / 操作记录 / 我的提案），普通用户看到 2 Tab。FAB 浮动。
- **`pages/proposal/propose.vue`**：3 模式（普通提交 / `?editProposalId=` 重编辑 / `?approveProposalId=` 管理员审批）。
- **`components/profile/ProfileView.vue`**：合并"我的"+ 昵称编辑 + 30 天冷却 + 每日配额。

---

## 6. 重要重构模式（怎么写新页面）

### 模式 1：写一个 token 化的页面

```vue
<template>
  <view class="my-page" :class="themeStore.themeClass">
    <TopNavBar title="我的页面" @back="goBack" />
    <view :style="{ height: navBarHeight + 'px' }"></view>
    <!-- 内容 -->
  </view>
</template>

<script setup lang="ts">
import { useMenuButton } from '@/composables/useMenuButton';
import { useThemeStore } from '@/config';
import TopNavBar from '@/components/common/TopNavBar.vue';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();
const goBack = () => uni.navigateBack();
</script>

<style lang="scss" scoped>
@import "@/styles/index.scss";

.my-page {
  min-height: 100vh;
  background: $bg-page-light;
  padding: 0 $space-7 $space-7;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-page-dark;
  }
}
</style>
```

### 模式 2：写一个深色模式感知的卡片

```scss
.my-card {
  background: $bg-card-light;
  border-radius: $radius-lg;
  padding: $space-7;
  box-shadow: $shadow-card;
  transition: background-color $dur-medium $ease-standard,
              box-shadow $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
    box-shadow: $shadow-sm-dark;
  }
}
```

### 模式 3：写一个错落入场动画列表

```vue
<view
  v-for="(item, idx) in list"
  :key="item.id"
  class="my-card mwp-stagger-item"
  :style="{ animationDelay: `${Math.min(idx * 50, 400)}ms` }"
>
  {{ item.name }}
</view>
```

### 模式 4：用一个 token 化按钮

```vue
<view class="my-btn mwp-pressable" :class="{ 'is-disabled': disabled }" @click="action">
  <text>{{ label }}</text>
</view>
```

```scss
.my-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: $radius-pill;
  background: $gradient-brand;
  color: $pure-white;
  font-weight: $weight-semibold;
  transition: all $dur-fast $ease-emphasized;
  
  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}
```

---

## 7. 暗色模式（最重要）

**所有交互元素必须支持暗色模式**。这是项目最核心的"质感"之一。

**3 个必要步骤**：

1. **容器加 `:class="themeStore.themeClass"`**（会自动加 `light-theme` 或 `dark-theme`）
2. **所有 token 颜色**用 `$text-primary-light`、`$bg-card-light` 等带 light/dark 后缀的
3. **硬编码颜色 → token**

```scss
.your-element {
  background: $bg-card-light;       // 亮色背景
  color: $text-primary-light;      // 亮色文字
  
  .dark-theme & {
    background: $bg-card-dark;       // 暗色背景
    color: $text-primary-dark;
  }
}
```

**注意**：`<style scoped>` 内 `.dark-theme` 嵌套**只能在父类作用域内**。如果你把 `.dark-theme` 写在最顶层，会覆盖整个组件。

---

## 8. 动效（最有趣的部分）

### 关键帧速查

```scss
animation: mwp-fade-up 360ms $ease-decelerate both;        // 卡片入场
animation: mwp-scale-in 280ms $ease-spring both;          // 弹窗入场
animation: mwp-bounce-in 480ms $ease-spring 240ms both;   // FAB 弹性入场
animation: mwp-heart-beat 480ms $ease-spring;             // 点赞反馈
animation: mwp-spin 800ms linear infinite;                 // 加载圈
animation: mwp-pulse 2s ease infinite;                    // 状态点
```

### 响应 prefers-reduced-motion
**每个文件都加了** 用户系统设置减弱动画时自动停止

```scss
@media (prefers-reduced-motion: reduce) {
  .my-card, .my-fab { animation: none; transition: none; }
}
```

---

## 9. 常见错误 & 解决

### ❌ "Cannot find module '@/api/...'"

```bash
# 原因：autodimport 没注册
# 解决：检查 vite.config.ts 中 AutoImport 的 dirs 是否包含 src/api
```

### ❌ 暗色模式不生效

- 检查 `<view class="..." :class="themeStore.themeClass">` 是否带上 themeClass
- 检查 tokens 文件是否正确 import 到 SFC（vite.config.ts `additionalData`）
- 检查 sass 块是否在 `.dark-theme & { ... }` 嵌套内

### ❌ 按钮按下去没反馈

- 必须用 `<view class="mwp-pressable">` 而非 `<button>`
- 小程序 `<button>` 默认样式无法覆盖

### ❌ 推荐减少动效没生效

```scss
/* 错误：缺少动画属性名 */
@media (prefers-reduced-motion: reduce) { .x { animation: none; } }

/* 正确：列出所有动画 */
@media (prefers-reduced-motion: reduce) {
  .x, .y, .z { animation: none; transition: none; }
}
```

### ❌ "onMounted is not exported from '@dcloudio/uni-app'"

`onMounted/onUnmounted` 是 **vue** 的，不是 uni-app 的。

```ts
import { onMounted, onUnmounted } from 'vue';  // ← 正确
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';  // ← 正确
```

---

## 10. 继续开发的 5 个方向

| 优先级 | 任务 | 估算 |
|---|---|---|
| 🔴 | 后端 2.0 上线后跑联调 | - |
| 🟡 | 缓存 mechanism（`useRequest` composable）| 半天 |
| 🟡 | SkeletonCard 多形态（卡片 / 列表 / 表单） | 半天 |
| 🟢 | 暗色模式主题切换加平滑过渡 | 2 小时 |

---

## 11. 关键文件清单

### 必读
- `src/styles/_tokens.scss` —— 完整设计令牌
- `src/styles/_animations.scss` —— 动效库
- `src/components/common/TopNavBar.vue` —— 最佳实践范本
- `src/pages/proposal/list.vue` —— 权限感知页面范本
- `src/composables/useMenuButton.ts` —— composable 范本

### 文档
- `docs/PROJECT_OVERVIEW.md` —— 页面路由、跳转关系、交互清单
- `docs/DESIGN_LANGUAGE.md` —— 设计语言与视觉规范
- `docs/BACKEND_INTEGRATION.md` —— 后端对接说明

### 关键配置
- `vite.config.ts` —— `additionalData` 注入 tokens（核心）
- `src/styles/_mixins.scss` —— 11 个 mixin
- `src/api/response.ts` —— 新旧后端响应兼容
- `src/utils/teacher-display.ts` —— 教师字段归一化

---

## 12. 质量目标

| 指标 | 数值 | 状态 |
|---|---|---|
| `yarn build:mp-weixin` 成功 | 10s | ✅ |
| 源码 0 个 TS 错误 | ✅ | ✅ |
| 0 硬编码颜色（除小程序 API） | 99% | ✅ |
| 暗色模式覆盖 | 28 个文件 | ✅ |
| 通用组件 | 10 个 | ✅ |
| 动效 keyframes | 14 | ✅ |
| 设计 tokens | 122 | ✅ |
| SCSS mixins | 11 | ✅ |
| 路由数 | 10 | ✅ |

---

## 13. 已知限制

- **feature/proposal 编译失败**（依赖缺失的 `Changelog` 模块）—— 这意味着我们不能直接基于他们的代码 merge，**必须搞清楚它依赖什么 API 才能复活**
- 后端 2.0 还没上线，部分 `proposalFilterList` 等接口当前还是占位
- 字体大小是专门为小程序设计的（rpx），**直接跑 web 端会因单位换算不一致有偏差**

---

## 14. 维护守则

1. **永远不要硬编码颜色** — 用 token
2. **永远不要写 `<button>`** — 用 `<view class="mwp-pressable">`
3. **永远不要忘 dark theme** — 每个容器和文字都要写
4. **永远不要忘 text-align** — 文字元素必须显式声明
5. **永远不要直接读 menuButtonInfo** — 用 `useMenuButton()`
6. **永远不要复制 useMenuButton 样板** — 用 composable
7. **永远不要在 SFC 里 `@use "as *"`** — vite 的 sass 1.x 限制，用 `@import`
8. **永远不要忘掉 placeholder-class="mwp-placeholder"** — input/textarea 都需要
9. **永远不要把状态文案到处写** — 用 `STATUS_LABELS` 常量
10. **永远不要在 SFC 里直接 `@use` + 后面跟其他规则** — 会编译错误

---

## 15. 最后的提醒

**这是一份你自己主导的代码重构。** 增添新功能时，记得遵循这些模式。如果发现 token 不够用、动画不够用、组件不够用——**先扩 tokens / animations / common/，不要在单个文件里硬编码**。

这份代码体现的核心思想是：**让设计系统作为约束，让每个组件都从中受益**。这样无论你或其他开发者在 3 个月后回头看，所有的红色都是同一个红，所有的间距都是同一个间距，所有的动效呼吸节奏都是 220ms。

保持这种一致性，就是这个项目代码质量的核心竞争力。
