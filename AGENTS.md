# Meowpick 选课猫 Frontend (new/)

## 工作目录

**所有操作必须在 `new/` 目录下执行**，不是根目录的 `Meowpick-Frontend/`（那是旧版）。

```bash
cd new
```

## Key Commands

```bash
yarn install              # Install dependencies
yarn api                  # Regenerate API types from src/swagger.json
yarn dev:mp-weixin        # Dev build (outputs to dist/dev/mp-weixin)
yarn build:mp-weixin      # Production build for WeChat Mini Program
yarn type-check           # vue-tsc type checking
yarn release              # Bump version + generate CHANGELOG (release-it)
```

CI build pipeline: `cd new && yarn install && yarn api && yarn type-check && yarn lint && yarn build:mp-weixin`

## Tech Stack

- **Framework**: uni-app (DCloud) with Vue 3 + TypeScript
- **Build tool**: Vite + @dcloudio/vite-plugin-uni
- **Package manager**: yarn (lockfile is yarn.lock, NOT package-lock.json)
- **Styling**: SCSS + NutUI + token 设计系统（210 token + 31 mixin + 13 keyframe）；旧版「原始版」皮肤另用 Tailwind CSS
- **State**: Pinia + pinia-plugin-unistorage (for persistence)
- **API client**: Axios (with uniapp-axios-adapter)
- **后端**: `https://api.meowpick.eagle233.top`

## Project Structure & Architecture

```
new/
├── src/
│   ├── api/              # Auto-generated from swagger.json (DO NOT edit manually)
│   ├── components/       # Vue components (auto-imported globally)
│   ├── composables/      # Vue composables (useMenuButton etc.)
│   ├── config/           # Store (Pinia), utils (http, pubsub), constants
│   ├── pages/            # Page components (course, find, home, layout, proposal)
│   ├── styles/           # Design tokens, mixins, animations
│   ├── utils/            # Utility functions
│   └── swagger.json      # API contract (source of truth for api generation)
```

- **API Code Generation**: `yarn api` reads `src/swagger.json` and outputs modular TypeScript API clients to `src/api/`. After updating `swagger.json`, always re-run `yarn api` before making API-related changes.
  - `src/api/http-client.ts` contains the Axios-based HTTP client with interceptors.
  - `src/api/data-contracts.ts` contains TypeScript interfaces for API responses.
- **State Management**: Pinia stores live in `src/config/store/` (`theme.ts`, `skin.ts`, `token.ts`) and use `pinia-plugin-unistorage` for persistence.
- **Routing**: Pages live under `src/pages/<module>/<page>.vue`; a `skin` store (`skin.ts`) switches between the new skin (`/pages/layout/main`) and the bundled legacy skin (`/original/pages/home/home`).
- **Data Flow**: Declarative filtering — pages hold an in-memory list plus selected filter tags, and filtering is applied client-side before rendering.
- **Component Auto-imports**: Components in `src/components/` and NutUI components are auto-imported via `@uni-helper/vite-plugin-uni-components`. Do not manually import them.
- **API/Vue Auto-imports**: `vue` (ref, computed), `uni-app` lifecycle hooks (onLoad, onShow), `pinia`, `src/config/index.*`, `src/icons/index.*` and `src/api/*.ts` are auto-imported via `unplugin-auto-import`. Do not manually import them.

## Naming Conventions

- **页面**：`src/pages/<模块>/<页面>.vue`（扁平式），纯静态数据可放模块内同名 `.ts`
- **组件**：文件名用 PascalCase（`MwpButton.vue`、`FeedbackModal.vue`）
- **样式**：外置样式与文件同名，通过 `<style lang="scss" scoped src="./<同名>.scss" />` 引用
- **composable**：统一放 `src/composables/`，命名 `useXxx.ts`
- **store**：`src/config/store/` 下小写文件名（`theme.ts`、`skin.ts`）

## Rules

- **禁止手动构建**：用户后台跑 `yarn dev:mp-weixin`，代码改动自动热更新。不要运行 `yarn build:mp-weixin`，除非用户明确要求
- **不硬编码颜色**：用 token（`$brand-red`、`$bg-card-light` 等）
- **不用 `<button>`**：用通用组件 `<MwpButton>` 或 `<view class="mwp-pressable">`（小程序 button 默认样式无法覆盖）。唯一例外：需要 `open-type`（如 `chooseAvatar`）时必须用原生 `<button>`
- **必须支持暗色模式**：通过 `themeStore.themeClass` + `.dark-theme &` 嵌套
- **API 层自动生成**：`src/api/` 由 `yarn api` 生成，不要手动编辑
- **Vite .env 缓存**：修改 `.env` 后必须重启 dev server

## Code Style

- ESLint + Prettier (see `.eslintrc.js`)
- Pre-commit hook runs commit-msg lint (conventional commits format)
- Globals declared for mini-program environment: `uni`, `wx`, `UniNamespace`, `uniCloud`, `tt`, `getCurrentPages`
- Path alias: `@` maps to `./src`

## WeChat Mini Program Specifics

- Entry point configured in `project.miniapp.json` and `app.miniapp.json`
- Dev output: `dist/dev/mp-weixin/` — open with WeChat DevTools
- Prod output: `dist/build/mp-weixin/`
- Type definitions for wx API: `@types/wechat-miniprogram`
