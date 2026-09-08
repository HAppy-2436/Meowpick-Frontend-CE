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
| 2 | 首页 | `components/home-view`（嵌入 Tab 0） | 欢迎语、Logo、搜索入口、功能卡片、统计 |
| 3 | 我的 | `components/profile-view`（嵌入 Tab 1） | 头像、昵称、更多菜单、筛选列表、FAB |
| 4 | 搜索/发现 | `pages/find/index/index` | 可折叠搜索头、模糊建议、历史、筛选、结果列表 |
| 5 | 课程详情 | `pages/course/index/index` | 课程信息 + 评论列表 + FAB 写评论 |
| 6 | 发布评论 | `pages/course/comment/index` | 选标签 + 文字（200字）+ 提交 |
| 7 | 致用户信 | `pages/home/letter` | 静态内容页（v4.0 重写说明） |
| 8 | 更新日志 | `pages/home/update-log` | 版本时间线（v1.0.4 → v4.0.0） |
| 9 | 提案表单 | `pages/proposal/propose/propose` | 三模式：新增提案 / 管理员审批 / 重新编辑 |
| 10 | 提案广场 | `pages/proposal/list/list` | 多Tab：全部提案 / 操作记录 / 我的提案 |
| 11 | 提案详情 | `pages/course/proposal-detail/index` | 提案信息 + 投票按钮 |

### 导航图

```
┌──────────────────────────────────────────────────┐
│                 pages/layout/main                  │
│  ┌─────────────┐         ┌─────────────┐          │
│  │  Tab 0:      │  swipe  │  Tab 1:      │          │
│  │  home-view   │ ◄─────► │  profile-view│          │
│  └──────┬──────┘         └──┬──┬──┬────┘          │
└─────────┼───────────────────┼──┼──┼────────────────┘
          │                   │  │  │
          ▼                   │  │  │
  find/index                  │  │  │
  ?mode=add-comment           │  │  │
   ├─► course/index           │  │  │
   ├─► course/comment         │  │  │
   ├─► proposal-detail        │  │  │
   └─► proposal/propose       │  │  │
                              │  │  │
  home/letter  ◄──────────────┤  │  │
  home/update-log ◄───────────┤  │  │
                              │  │  │
  proposal/list ◄─────────────┘  │  │
   ├─► proposal-detail           │  │
   ├─► course/index（查看课程）    │  │
   └─► proposal/propose          │  │
      ?approveProposalId=        │  │
      ?editProposalId=           │  │
                                 │  │
  proposal/propose ◄─────────────┘  │
                                    │
  course/index ◄────────────────────┘
   └─► course/comment
```

### 各页面跳转详情

#### 1. 首页 (home-view)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击搜索框 | `find/index` | — |
| 点击"致用户的一封信" | `home/letter` | — |
| 点击"提议广场" | `proposal/list/list` | — |
| 点击"我要反馈" | 打开 feedback-modal | — |

#### 2. 我的 (profile-view)
| 触发 | 目标 | 参数 |
|------|------|------|
| ⋯菜单→提议广场 | `proposal/list/list` | — |
| ⋯菜单→更新日志 | `home/update-log` | — |
| 点击评论卡片 | `course/index/index` | `?id={commentId}` |
| 点击提案卡片 | `course/proposal-detail` | `?data={json}` |
| FAB+（吐槽筛选） | `find/index` | `?mode=add-comment` |
| FAB+（提议筛选） | `proposal/propose` | — |
| 长按提案→修改 | `proposal/propose` | `?editProposalId={id}` |

#### 3. 搜索页 (find)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击课程结果 | `course/index` | `?id={courseId}` |
| 点击课程结果(add-comment模式) | `course/comment` | `?data={json}` |
| 点击提案结果 | `course/proposal-detail` | `?data={json}` |
| 点击"亲自提议新课程" | `proposal/propose` | — |

#### 4. 提案广场 (proposal/list)
| 触发 | 目标 | 参数 |
|------|------|------|
| 点击提案卡片 | `course/proposal-detail` | `?id={proposalId}` |
| 点击"查看课程" | `course/index` | `?id={courseId}` |
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
| RejectModal | 管理员填写拒绝理由（200字） | 提案广场 |
| SearchModal | 通用字段搜索（课程名/代码/院系/分类/教师） | 提案表单、提案广场筛选 |
| TeacherListModal | 教师列表管理（查看/删除/添加） | 提案表单 |
| AddTeacherModal | 添加教师（姓名+院系双搜索） | 提案表单 |
| FeedbackModal | 反馈联系方式（QQ群/邮箱，点击复制） | 首页、我的 |
| NicknameModal | 修改昵称（20字限制） | 我的 |
| GuideOverlay | 首次使用引导（一次性） | 首页、我的 |

### ActionSheet 操作面板

| 页面 | 选项 | 触发 |
|------|------|------|
| 我的 | ["新增吐槽", "新增提议"] | FAB+（全部筛选时） |
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

| 组件 | 用途 | Props | 事件 |
|------|------|-------|------|
| Button | 通用按钮（5 tone / 3 size / loading） | tone, size, block, disabled, loading, icon | click |
| TopNavBar | 顶部导航栏（毛玻璃背景） | title, subtitle, showBack, forceLight | back |
| BackBtn | 返回按钮（CSS箭头） | customStyle, color | click |
| StatusBadge | 状态徽标 | status, tone, label, pill, dot | — |
| EmptyState | 空/错状态 | title, desc, emoji, tone, compact | click |
| SkeletonCard | 骨架屏 | count | — |
| SearchModal | 字段搜索弹窗 | visible, field, title, placeholder, allowAdd | select, close |
| RejectModal | 拒绝理由弹窗 | visible | confirm(reason), cancel |
| TeacherListModal | 教师列表弹窗 | visible, teachers | add, remove(index) |
| AddTeacherModal | 添加教师弹窗 | visible | confirm(teacher), close |

### 业务组件

| 组件 | 路径 | 用途 |
|------|------|------|
| CourseCard | business/course/ | 双模式卡片（课程/提案） |
| choose-course | choose/ | 搜索结果卡片（含emoji标签） |
| comment-item | comment/ | 评论卡片（头像/时间/标签/点赞） |
| course-header | course/ | 课程详情头部 |
| course-comment-list | course/ | 评论列表（分页/点赞/PubSub） |
| course-comment-publish | course/ | 评论发布表单 |
| star | course/ | 星级评分组件 |
| find | find/ | 搜索页完整实现 |
| feedback-modal | feedback/ | 反馈弹窗 |
| home-view | home-view/ | 首页完整实现 |
| profile-view | profile-view/ | 我的页完整实现 |
| ProposalLogTimeline | proposal/ | 操作日志时间线 |
| scroll | scroll/ | 可滚动容器 |
| fuzzy-search | fuzzy-search/ | 模糊搜索下拉 |
| DebugPanel | 根目录 | 调试面板（环境切换） |

### Composables

| 名称 | 文件 | 用途 |
|------|------|------|
| useMenuButton | composables/ | 胶囊按钮位置计算 |
| useCourseComment | course/comment-list/ | 评论列表状态管理 |
| useSuggest | find/ | 搜索建议API调用 |
| useInput | find/ | 搜索输入状态 |
| useFuzzySearch | fuzzy-search/ | 客户端模糊过滤 |

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
- 130+ 设计 token：颜色/圆角/间距/字号/阴影/动画曲线/z-index
- 亮暗双套中性色

### Mixins (`src/styles/_mixins.scss`)
- `pressable` / `bounce-on-tap` / `glass` / `ellipsis` / `brand-button` / `card` / `safe-area-bottom` / `pill` / `text-gradient` / `focus-ring` / `shimmer`

### Animations (`src/styles/_animations.scss`)
- 14 keyframes + 8 公共 class
- `.mwp-fade-up` / `.mwp-scale-in` / `.mwp-slide-up` / `.mwp-bounce-in` / `.mwp-pop` / `.mwp-stagger-item` 等
- 响应 `prefers-reduced-motion`

---

## 九、已知未完成功能

| 功能 | 状态 | 位置 |
|------|------|------|
| 搜索排序（综合/热度/时间） | Toast "开发中" | find/index.vue |
| 评论修改 | Toast "开发中" | profile-view |
| 昵称修改API对接 | Mock（setTimeout） | profile-view |
| 深色模式部分硬编码颜色 | 待 token 化 | 多页面 |
| 首页浮动布局改造 | TODO | home-view |
| 课程卡片字段自定义 | TODO | — |
