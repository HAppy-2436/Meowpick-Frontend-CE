<div align="center">

# 🐱 Meowpick 选课猫 · CE 版

**华东师范大学选课猫小程序 · 前端重构版（Community Edition）**

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![uni-app](https://img.shields.io/badge/uni--app-Vue3-2b9939)](https://uniapp.dcloud.net.cn/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-2-ffd859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/License-GPL--2.0-blue)](#-开源许可)

</div>

---

> **关于本仓库 / 官方来源**
>
> 本项目源自华东师范大学学生团队 **Boyuan-IT-Club** 的官方项目
> [`Boyuan-IT-Club/Meowpick-Frontend`](https://github.com/Boyuan-IT-Club/Meowpick-Frontend)。
> 本仓库为 **选课猫 CE（Community Edition）重构版**，在官方项目基础上对架构、设计系统与交互进行系统性重构，
> 与官方团队为**出处关系**，并非替代或隶属关系。原项目与本重构版均基于 **GPL-2.0** 许可开源。

---

## 📖 项目定位

本仓库是选课猫微信小程序**前端**的 CE（Community Edition）重构版，由个人维护，聚焦于**前端层面的重构**：代码架构整理、设计 Token 系统、深色模式适配与交互统一。

它不涉及产品定位、后端服务与运营决策；所承载的业务功能与官方项目一致，本仓库只是以新的前端结构重新实现它们。

---

## ✨ 功能模块（前端实现）

以下为前端已实现的页面 / 模块：

- 🔍 **课程搜索** — 模糊联想、搜索历史、猜你想搜；支持按 **校区 / 院系 / 分类** 多维筛选
- 📚 **课程详情** — 课程信息、任课教师、课程评价列表，一键发布吐槽
- 🏷️ **标签化评价** — 表情标签 + 文字评论（最多 4 个标签），快速表达态度
- 🗳️ **提案广场** — 发起提案、点赞/投票、按状态与维度筛选，直接跳转搜索词
- ✅ **管理员工作台** — 提案审批（通过 / 拒绝 / 撤回）与操作记录时间线
- 👤 **个人中心** — 我的评论与提案历史、昵称修改、反馈入口
- 🌗 **深色模式** — 全量色彩 Token 适配，一键切换浅色/深色
- 🎨 **设计 Token 系统** — 210 个 token + 31 个 mixin + 13 个 keyframe，主题色集中管理、可校验

---

## 🛠 技术栈

| 分类 | 选型 |
|------|------|
| 框架 | uni-app（Vue 3 + `<script setup>` + TypeScript） |
| 构建 | Vite + `@dcloudio/vite-plugin-uni` |
| 样式 | SCSS 设计 Token 系统 + NutUI（旧版「原始版」皮肤另用 Tailwind CSS） |
| 状态 | Pinia + `pinia-plugin-unistorage`（持久化） |
| 请求 | Axios（`uni.request` 适配器） |
| API 类型 | `swagger-typescript-api` 从 `src/swagger.json` 自动生成 |
| 质量 | `vue-tsc` 类型检查 + ESLint + Prettier + commitlint |
| 包管理 | **yarn（禁止使用 npm）** |

> 后端 API：`https://api.meowpick.eagle233.top`（可在 `.env` 中通过 `VITE_SERVER_HOST_PORT` 覆盖）

---

## 🚀 快速开始

**环境要求**：Node.js >= 20（见 `.nvmrc`）、yarn 1.x、微信开发者工具。

```bash
yarn install            # 安装依赖
yarn dev:mp-weixin      # 开发编译 → dist/dev/mp-weixin
```

用微信开发者工具导入 `dist/dev/mp-weixin` 即可预览。

> 开发 / 构建命令会自动先执行 `yarn api` 生成 API 客户端（`src/api` 为生成产物，已 gitignore，请勿手动修改）。

生产构建：

```bash
yarn build:mp-weixin    # → dist/build/mp-weixin
```

---

## 📜 常用命令

| 命令 | 说明 |
|------|------|
| `yarn dev:mp-weixin` | 开发模式（自动生成 API） |
| `yarn build:mp-weixin` | 生产构建（自动生成 API） |
| `yarn api` | 从 `src/swagger.json` 生成 API 客户端 |
| `yarn type-check` | `vue-tsc` 全量类型检查 |
| `yarn lint` / `yarn lint:fix` | ESLint 检查 / 自动修复 |
| `yarn theme:gen` / `yarn theme:check` | 生成 / 校验主题色 Token |
| `yarn release` | 版本发布（release-it + CHANGELOG） |

**CI**：推送 `v*.*.*` tag 时触发 `.github/workflows/upgrade.yml`，执行 `install → api → type-check → lint → build:mp-weixin → 上传`。

---

## 📁 目录结构

```
Meowpick-Frontend-CE/
├── src/
│   ├── api/               # swagger-typescript-api 生成（勿手改）
│   ├── components/        # 全局组件（自动导入，文件名 PascalCase）
│   │   ├── home/          # 首页 HomeView
│   │   ├── find/          # 搜索 FindView
│   │   ├── profile/       # 个人中心 ProfileView / UpdateLogTimeline
│   │   ├── course/        # 课程详情头部与评论
│   │   ├── choose/        # 课程卡片选择器
│   │   ├── proposal/      # 提案日志聚合/原始视图
│   │   ├── feedback/      # 反馈弹窗
│   │   └── common/        # 通用组件（MwpButton / 弹窗 / 空态 / 骨架屏…）
│   ├── composables/       # useCourse / useChoose / useFind / useMenuButton 等
│   ├── config/            # Pinia store + Axios 客户端
│   ├── pages/             # 页面（模块/页面.vue 扁平式）
│   ├── styles/            # 设计 Token / mixin / 动画
│   ├── utils/             # 工具函数、常量、类型
│   ├── pages.json         # 路由与窗口配置
│   ├── manifest.json      # 小程序配置
│   └── swagger.json       # API 契约（唯一事实来源）
├── templates/             # API 代码生成模板
├── scripts/               # 主题生成 / 上传等脚本
├── docs/                  # 详细文档
└── .github/workflows/     # CI
```

---

## 🎨 设计规范

- **品牌色**：`#B20035`　**暗色品牌色**：`#FF4D6A`
- **品牌渐变**：`linear-gradient(135deg, #b20035, #ff4d6a)`
- **页面背景**：`#f6f6f6`

约定：

- 颜色一律使用 Token（如 `$brand-red`、`$bg-card-light`），**禁止硬编码色值**
- 可点击元素统一用通用组件 `<MwpButton>` 或 `<view class="mwp-pressable">`，**不使用原生 `<button>`**（需要 `open-type` 时除外）
- 所有样式需同时适配 **暗色模式**（`themeStore.themeClass` + `.dark-theme &` 嵌套）

---

## 📚 文档索引

| 文档 | 内容 |
|------|------|
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | 页面路由、跳转关系、交互清单 |
| [`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md) | 设计语言与视觉规范 |
| [`docs/DEV_GUIDE.md`](docs/DEV_GUIDE.md) | 开发指南 |
| [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) | 后端对接说明 |
| [`MAINTENANCE.md`](MAINTENANCE.md) | 维护手册：逻辑说明、踩坑记录 |
| [`CHANGELOG.md`](CHANGELOG.md) | 版本更新日志 |

---

## 🤝 参与贡献

1. 从 `main` 切出功能分支（如 `feat/xxx`）
2. 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)（提交前由 commitlint 校验）
3. 提交 PR 前请确保 `yarn type-check` 通过

---

## 🙏 致谢

本项目源自华东师范大学学生团队 **Boyuan-IT-Club** 的官方项目
[`Boyuan-IT-Club/Meowpick-Frontend`](https://github.com/Boyuan-IT-Club/Meowpick-Frontend)。
感谢原团队在选课猫小程序上的设计与开发工作；本 CE 重构版在其基础上重写了架构、设计 Token 系统与交互，并沿用其开源许可。

---

## 📄 开源许可

本项目基于 **GPL-2.0** 许可开源，详见 [LICENSE](LICENSE)。

原始项目版权归华东师范大学 **Boyuan-IT-Club** 团队所有；本 CE 重构版在 GPL-2.0 条款下衍生并分发，保留原有版权与许可声明。
