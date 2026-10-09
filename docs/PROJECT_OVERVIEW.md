# Meowpick 选课猫 — 完整项目梳理

> 自动扫描生成 · 2026-08-25

---

## 一、项目概览

**Meowpick 选课猫** — 华东师范大学社团自主研发的教师课程评价共享微信小程序。

- **技术栈**: uni-app + Vue 3 + TypeScript + Vite
- **样式**: SCSS 设计 Token 系统 + Tailwind CSS + NutUI
- **状态管理**: Pinia + pinia-plugin-unistorage（持久化）
- **API**: Axios + 自动生成 TypeScript 客户端（swagger-typescript-api）
- **包管理**: yarn

---

## 二、页面路由与跳转

### 页面清单（11个页面）

| # | 页面 | 路径 | 描述 |
|---|------|------|------|
| 1 | 主布局（Tab容器） | `pages/layout/main` | Swiper 双栏布局：首页 + 我的 |
| 2 | 首页 | `components/home/HomeView`（嵌入 Tab 0） | 欢迎语、Logo、搜索入口、功能卡片、统计 |
| 3 | 我的 | `components/profile/ProfileView`（嵌入 Tab 1） | 头像、昵称、更多菜单、筛选列表、FAB |
| 4 | 搜索/发现 | `pages/find/index` | 可折叠搜索头、模糊建议、历史、筛选、结果列表 |
| 5 | 课程详情 | `pages/course/detail` | 课程信息 + 评论列表 + FAB 写评论 |
| 6 | 发布评论 | `pages/course/comment` | 选标签 + 文字（140字）+ 提交 |
| 7 | 致用户信 | `pages/home/letter` | 静态内容页 |
| 8 | 更新日志 | `pages/profile/update-log` | 版本时间线 |
| 9 | 提案表单 | `pages/proposal/propose` | 三模式：新增提案 / 管理员审批 / 重新编辑 |
| 10 | 提案广场 | `pages/proposal/list` | 搜索 + 校区/院系/分类/状态筛选 + 管理操作 |
| 11 | 提案详情 | `pages/proposal/proposal-detail` | 提案信息 + 支持/投票 + 管理员审批 |
| 12 | 提案日志 | `pages/proposal/log` | 聚合/原始两种视图（管理员） |

### 导航图

```
┌──────────────────────────────────────────────────┐
│                 pages/layout/main                  │
│  ┌─────────────┐         ┌─────────────┐          │
│  │  Tab 0:      │  swipe  │  Tab 1:      │          │
│  │  HomeView    │ ◄─────► │ ProfileView  │          │
│  └──────┬──────┘         └──┬──┬──┬────┘          │
└─────────┼───────────────────┼──┼──┼────────────────┘
          │                   │  │  │
          ▼                   │  │  │
  find/index                  │  │  │
  ?mode=add-comment           │  │  │
   ├─► course/detail          │  │  │
   ├─► course/comment         │  │  │
   ├─► course/proposal-detail │  │  │
   └─► proposal/propose       │  │  │
                              │  │  │
  home/letter  ◄──────────────┤  │  │
  home/update-log ◄───────────┤  │  │
                              │  │  │
  proposal/list ◄─────────────┘  │  │
   ├─► course/proposal-detail    │  │
   ├─► course/detail（查看课程）   │  │
   └─► proposal/propose          │  │
      ?approveProposalId=        │  │
      ?editProposalId=           │  │
                                 │  │
  proposal/propose ◄─────────────┘  │
                                    │
  course/detail ◄───────────────────┘
   └─► course/comment
```

### 各页面跳转详情

#### 1. 首页 (HomeView)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击搜索框 | `find/index` | — |
| 点击"致用户的一封信" | `home/letter` | — |
| 点击"提案广场" | `proposal/list` | — |
| 点击"我要反馈" | 打开 FeedbackModal | — |

#### 2. 我的 (ProfileView)
| 触发 | 目标 | 参数 |
|------|------|------|
| ⋯菜单→提案广场 | `proposal/list` | — |
| ⋯菜单→更新日志 | `home/update-log` | — |
| 点击评论卡片 | `course/detail` | `?id={commentId}` |
| 点击提案卡片 | `course/proposal-detail` | `?data={json}` |
| FAB+（吐槽筛选） | `find/index` | `?mode=add-comment` |
| FAB+（提案筛选） | `proposal/propose` | — |
| 长按提案→修改 | `proposal/propose` | `?editProposalId={id}` |

#### 3. 搜索页 (FindView)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击课程结果 | `course/detail` | `?id={courseId}` |
| 点击课程结果(add-comment模式) | `course/comment` | `?data={json}` |
| 点击提案结果 | `course/proposal-detail` | `?data={json}` |
| 点击"亲自提案新课程" | `proposal/propose` | — |

#### 4. 提案广场 (proposal/list)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击提案卡片 | `course/proposal-detail` | `?id={proposalId}` |
| 点击"查看课程" | `course/detail` | `?id={courseId}` |
| 管理员点"通过" | `proposal/propose` | `?approveProposalId={id}` |
| FAB / 空态按钮 | `proposal/propose` | — |

---

## 三、交互反馈清单

### Toast 提示

| 页面 | 提示内容 | 触发条件 |
|------|---------|---------|
| 搜索页 | "功能正在开发中" | 点击排序按钮（综合/热度/时间） |
| 课程详情 | "支持成功" / "支持失败" | 投票操作 |
| 评论页 | "最多选择4个标签" | 选超过4个标签 |
| 评论页 | "请选择标签或填写内容" | 空内容提交 |
| 评论页 | "发布成功" / "发布失败" | 提交结果 |
| 提案表单 | "请输入课程名称" 等 | 表单校验 |
| 提案表单 | "提交成功，等待管理员审核" | 新增提案成功 |
| 提案表单 | "已通过" / "通过失败" | 管理员审批 |
| 提案表单 | "今日提交已达上限(N)" | 配额用尽 |
| 提案广场 | "已拒绝" / "拒绝失败" | 管理员拒绝 |
| 提案广场 | "已撤回" / "撤回失败" | 管理员撤回 |
| 我的 | "已删除" / "删除失败" | 长按删除提案 |
| 我的 | "昵称不能为空" 等 | 昵称修改校验 |
| 我的 | "功能正在开发中" | 长按评论→修改 |

### Modal 弹窗

| 组件 | 用途 | 所在页面 |
|------|------|---------|
| MwpConfirmDialog | 居中确认弹窗（破坏性操作确认） | 全局 |
| MwpActionSheet | 底部操作面板 | 我的、提案表单 |
| RejectModal | 管理员填写拒绝理由（200字） | 提案广场、提案详情 |
| NicknameDialog | 设置/修改昵称（15字、30天冷却） | 提案表单、我的 |
| FeedbackModal | 反馈联系方式（QQ群/邮箱） | 首页 |
| 引导弹窗（样式见 `styles/_guide.scss`） | 首次使用 / 迁移欢迎 / 头像引导 | 首页、我的 |

### ActionSheet 操作面板

| 页面 | 选项 | 触发 |
|------|------|------|
| 我的 | ["新增吐槽", "新增提案"] | FAB+（全部筛选时） |
| 我的(提案0票) | ["修改", "删除"] | 长按提案卡片 |
| 我的(提案有票) | ["查看详情", "修改(清空票数)", "删除"] | 长按提案卡片 |
| 我的(评论) | ["查看详情", "修改", "删除"] | 长按评论卡片 |

### Loading 状态

| 类型 | 位置 |
|------|------|
| 页面级 spinner | 搜索中、加载中 |
| 按钮文字替换 | "发布中..."、"提交中..."、"通过提案" |
| uni.showLoading | 昵称修改 "提交中" |
| SkeletonCard | 提案广场加载骨架屏 |

---

## 四、组件清单（27个 .vue + 10个 .ts）

### 公共组件 (common/)

| 组件 | 用途 |
|------|------|
| MwpButton | 通用按钮（6 tone / 3 size / block / loading / `#icon` 插槽） |
| MwpConfirmDialog | 居中确认弹窗（破坏性操作） |
| MwpActionSheet | 底部操作面板（支持下滑关闭） |
| MwpStatusOverlay | 全局 loading / 成功 / 失败浮层宿主 |
| MwpScrollView | 统一滚动容器（含下拉刷新） |
| MwpIcon | 图标（lucide，mask + currentColor） |
| PlusIcon | 加号图标 |
| TopNavBar | 顶部导航栏 |
| BackBtn | 返回按钮 |
| StatusBadge | 状态徽标 |
| EmptyState | 空 / 错误状态 |
| SkeletonCard | 骨架屏 |
| NicknameDialog | 昵称设置弹窗 |
| RejectModal | 拒绝理由弹窗 |

### 业务组件

| 组件 | 路径 | 用途 |
|------|------|------|
| CourseCard | choose/ | 统一课程卡片（提案卡 / 教师行共用） |
| ChooseCourse | choose/ | 搜索结果卡片（含标签） |
| CourseHeader | course/ | 课程详情头部（可展开） |
| CourseCommentList | course/ | 评论列表（分页 / 点赞 / 撤回） |
| CourseCommentBox | course/ | 单条评论卡片 |
| FindView | find/ | 搜索页完整实现 |
| FeedbackModal | feedback/ | 反馈弹窗 |
| HomeView | home/ | 首页完整实现 |
| ProfileView | profile/ | 我的页完整实现 |
| PublishInfoTrack | profile/ | 教师 / 院系信息行（五五开布局） |
| UpdateLogTimeline | profile/ | 更新日志时间线 |
| ProposalLogGroups / ProposalLogRaw | proposal/ | 提案日志聚合视图 / 原始视图 |

### Composables

| 名称 | 文件 | 用途 |
|------|------|------|
| useStatus / statusCore | composables/ | 全局 loading / 成功 / 失败状态机 |
| useMenuButton | composables/ | 胶囊按钮位置计算 |
| useViewport / useScreenScale | composables/ | 视口尺寸与响应式缩放 |
| useScrollDirection / useSwipeDownClose | composables/ | 滚动方向 / 下滑关闭手势 |
| useChoose | composables/ | 搜索结果（课程 + 教师）分页与筛选 |
| useCourse | composables/ | 课程详情 |
| useCourseComment | composables/ | 评论列表（分页 / 点赞 / 撤回） |
| useFind | composables/ | 搜索输入 + 建议（useInput / useSuggest） |

---

## 五、状态管理（Pinia Stores）

| Store | ID | 持久化 | 状态 | 用途 |
|-------|-----|--------|------|------|
| Token | token-store | ✅ | token, userId | JWT 认证 |
| Theme | theme-store | ✅ | mode (light/dark) | 深色模式切换 |
| Course | course-store | ✅ | course (DtoCourseVO) | 当前课程数据 |
| Route | route-index-listener | ❌ | url | 当前路由路径 |

### 本地存储 Keys

| Key | 用途 |
|-----|------|
| `hasReadLetter` | 是否已读致用户信（隐藏NEW标记） |
| `searchHistory` | 搜索历史（最多50条） |
| `find_page_state` | 搜索页状态恢复 |
| `meowpick_guide_seen` | 首页引导已看 |
| `meowpick_profile_guide_seen` | 我的页引导已看 |
| `userInfo` | 用户信息缓存 |

---

## 六、API 层（9个模块 · 30个端点）

### 端点覆盖率：100%（swagger.json 全部22路径已覆盖）

### Auth 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| authSignInCreate | POST | /api/auth/sign_in | ❌ |
| authIsAdminList | GET | /api/auth/is_admin | ✅ |
| authGrantAdminCreate | POST | /api/auth/grant_admin | ✅ |

### Comment 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| commentAddCreate | POST | /api/comment/add | ✅ |
| commentHistoryCreate | POST | /api/comment/history | ✅ |
| commentQueryList | GET | /api/comment/query | ✅ |
| searchTotalList | GET | /api/search/total | ✅ |

### Course 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| courseCampusesList | GET | /api/course/campuses | ✅ |
| courseCategoriesList | GET | /api/course/categories | ✅ |
| courseDepartsList | GET | /api/course/departs | ✅ |
| courseDetail | GET | /api/course/{courseId} | ✅ |
| searchCreate | POST | /api/search | ✅ |

### Like 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| likeCreate | POST | /api/like/{likeId} | ✅ |

### Proposal 模块（核心）
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| proposalAddCreate | POST | /api/proposal/add | ✅ |
| proposalDetail | GET | /api/proposal/{id} | ✅ |
| proposalDeleteCreate | POST | /api/proposal/{id}/delete | ✅ |
| proposalUpdateCreate | POST | /api/proposal/{id}/update | ✅ |
| proposalApproveCreate | POST | /api/proposal/{id}/approve | ✅ |
| proposalRejectCreate | POST | /api/proposal/{id}/reject | ✅ |
| proposalRevokeCreate | POST | /api/proposal/{id}/revoke | ✅ |
| proposalListList | GET | /api/proposal/list | ✅ |
| proposalHistoryList | GET | /api/proposal/history | ✅ |
| proposalSuggestList | GET | /api/proposal/suggest | ✅ |
| proposalSuggestCreate | POST | /api/proposal/suggest | ✅ |
| proposalFieldSuggestionsList | GET | /api/proposal/field-suggestions | ✅ |
| proposalFilterList | GET | /api/proposal/filter | ✅ |

### Search 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| searchRecentList | GET | /api/search/recent | ✅ |
| searchSuggestList | GET | /api/search/suggest | ✅ |

### Teacher 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| teacherAddCreate | POST | /api/teacher/add | ✅ |
| teacherSuggestList | GET | /api/teacher/suggest | ✅ |

### ChangeLog 模块
| 方法 | HTTP | 路径 | 认证 |
|------|------|------|------|
| changelogListCreate | POST | /api/changelog/list | ✅ |
| changelogProposalGroupedList | GET | /api/changelog/proposal/grouped | ✅ |
| changelogProposalTimelineList | GET | /api/changelog/proposal/timeline | ✅ |

### 核心 DTO 一览

| DTO | 关键字段 |
|-----|---------|
| DtoCourseVO | id, name, code, category, department, teachers[], campuses[] |
| DtoCommentVO | id, userId, courseId, content, tags[], likeCnt, createdAt |
| DtoProposalVO | id, title, content, status, course, finalCourse, likeCnt, rejectReason |
| DtoProposalCourseVO | id, name, code, category, department, teachers[], campuses[] |
| DtoTeacherVO | id, name, title, department |
| DtoCreateProposalReq | course, content, title |
| DtoToggleProposalReq | proposalID, finalCourse |
| DtoRejectProposalReq | proposalId, reason |
| DtoRevokeProposalReq | actionType (approve/reject) |

### 数据兼容层

`normalizeResponse()` 自动适配新旧后端响应格式：
- 旧后端：`{ code, msg, data: { ... } }`（嵌套）
- 新后端2.0：`{ code, msg, proposalId, ... }`（扁平）→ 自动包装为嵌套格式

---

## 七、跨页面通信模式

| 模式 | 机制 | 用例 |
|------|------|------|
| 事件总线 | `uni.$emit / uni.$on` | 提案提交成功 → 列表页刷新 (`proposalListShouldRefresh`) |
| PubSub | 自定义 PubSub 类 | 课程详情滚动到底部 → 评论列表加载下一页 (`comment-next`) |
| URL参数 | `?data={json}` | 搜索结果 → 提案详情（JSON编码传递完整数据） |
| Storage | `uni.getStorageSync / setStorageSync` | 搜索历史、引导状态、用户信息、页面状态恢复 |

---

## 八、设计系统

### Token 系统 (`src/styles/_tokens.scss`)
- 210 个设计 token：颜色 / 圆角 / 间距 / 字号 / 阴影 / 动画曲线 / z-index / 页面页边距
- 亮暗双套中性色；`scripts/gen-theme-colors.mjs` 由 token 生成 `src/config/theme-colors.ts`（`yarn theme:check` 校验）

### Mixins (`src/styles/_mixins.scss`)
- 31 个 mixin，按用途分组：交互反馈（`pressable`/`mwp-transition`/`bounce-on-tap`/`fab`）、容器（`card`/`card-dark`/`icon-tile`）、装饰（`title-accent`/`section-title`/`card-top-line`/`corner-glow`/`dashed-divider`/`quote-accent`）、控件（`selectable-tag`/`tag-chip-active`/`banner`/`pill`/`textarea-box`/`textarea-field`/`textarea-counter`）、文本（`ellipsis`/`text-primary`/`text-secondary`/`text-tertiary`/`text-gradient`/`log-action-color`）等

### Animations (`src/styles/_animations.scss`)
- 13 个 keyframe + `.mwp-*` 公共工具类
- `.mwp-fade-up` / `.mwp-scale-in` / `.mwp-slide-up` / `.mwp-bounce-in` / `.mwp-stagger-item` 等
- 响应 `prefers-reduced-motion`

---

## 九、已知未完成功能

| 功能 | 状态 | 位置 |
|------|------|------|
| 搜索排序（综合/热度/时间） | Toast "开发中" | components/find/FindView.vue |
| 评论修改 | Toast "开发中" | components/profile/ProfileView.vue |
| 昵称修改API对接 | Mock（setTimeout） | components/profile/ProfileView.vue |
| 首页浮动布局改造 | TODO | components/home/HomeView.vue |
| 课程卡片字段自定义 | TODO | — |
