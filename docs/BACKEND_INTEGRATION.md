# Meowpick 后端对接指南

> 最后更新：2026-08-17

## 1. 核心契约：Swagger 文档

**`src/swagger.json`** 是前端与后端的**唯一契约**。所有变更必须同步到这里。

### 后端推送变更的 3 种方式

**方式 1：自动生成（推荐）**

后端用 Go 的话用 [swaggo/swag](https://github.com/swaggo/swag)：

```go
// @Summary  课程详情
// @Tags     course
// @Produce  json
// @Param    courseId path string true "课程 ID"
// @Success  200 {object} DtoCourseVO
// @Router   /api/course/{courseId} [get]
func (h *CourseHandler) Get(c *gin.Context) { ... }
```

```bash
swag init -g cmd/server/main.go -o swagger/
# 把 swagger/swagger.json 复制到前端 src/swagger.json
```

**方式 2：手动维护**

如果后端不能自动生成，则由后端**手动维护** `src/swagger.json`，版本控制。

**方式 3：只告诉前端**

让后端在 PR 中 @ 前端开发者，**描述改了什么**——口述变更。**门槛最低、风险最高**（容易遗漏）。

---

## 2. 前端的标准对接流程

### 步骤 1：收到变更通知

任何形式：PR / 微信 / 文档链接。

### 步骤 2：本地重新生成 API 客户端

```bash
cd new
yarn api
```

**输出**：
```
✨  try to get swagger by path "/home/i/.../new/src/swagger.json"
⭐  start generating your typescript api
✅  api file "data-contracts.ts" created
✅  api file "Proposal.ts" created
... (12 个文件)
Done in 2.64s.
```

**自动生成位置**：`src/api/*.ts`（按 tag 分模块）

### 步骤 3：跑 TypeScript 检查

```bash
yarn type-check
```

**重点关注**：
- 新增字段 → 页面是否需要读取
- 删除字段 → 是否有页面还在用
- 字段类型变更 → 是否需要适配
- 字段重命名 → 全面搜索替换

### 步骤 4：验证构建

```bash
yarn build:mp-weixin
```

如果失败，说明某个字段被删除但代码还在用——修复。

### 步骤 5：跑 Demo 验证

```bash
yarn dev:mp-weixin
```

用微信开发者工具打开 dist/dev/mp-weixin。

---

## 3. 后端接口清单（基于 src/swagger.json）

### 认证 (auth)
- `POST /api/auth/sign_in` — 微信登录
- `GET /api/auth/is_admin` — 判断当前用户是否管理员
- `POST /api/auth/grant_admin` — 授予管理员权限

### 提案 (proposal)
- `POST /api/proposal/add` — 提交新提案
- `GET /api/proposal/list` — 列表（已被 `filter` 取代，保留兼容）
- `GET /api/proposal/filter` — 多状态筛选分页
- `GET /api/proposal/{proposalId}` — 详情
- `POST /api/proposal/{proposalId}/approve` — 管理员通过
- `POST /api/proposal/{proposalId}/reject` — 管理员拒绝
- `POST /api/proposal/{proposalId}/revoke` — 管理员撤回审批
- `POST /api/proposal/{proposalId}/delete` — 提案人撤回自己的提案
- `POST /api/proposal/{proposalId}/update` — 修改提案（实际用不到）
- `GET /api/proposal/history` — 我的提案历史
- `GET /api/proposal/suggest` — 提案搜索建议
- `GET /api/proposal/field-suggestions` — 字段建议（院系/课程名/教师等）

### 课程 (course)
- `GET /api/course/{courseId}` — 详情
- `GET /api/course/campuses` — 校区枚举
- `GET /api/course/categories` — 类别枚举
- `GET /api/course/departs` — 院系列表

### 课程搜索 (courses)
- `POST /api/courses/search` — 搜索课程（带过滤）

### 评论 (comment)
- `POST /api/comment/add` — 提交吐槽
- `GET /api/comment/history` — 我的吐槽
- `GET /api/comment/query` — 查询某课程评论
- `GET /api/comment/total` — 吐槽总数

### 搜索 (search)
- `GET /api/search` — 搜索
- `GET /api/search/recent` — 搜索历史
- `GET /api/search/suggest` — 搜索建议
- `POST /api/search/recent` — 删除某条历史

### 教师 (teacher)
- `POST /api/teacher/add` — 新增教师
- `GET /api/teacher/suggest` — 教师搜索建议

### 点赞 (like)
- `POST /api/like/{likeId}` — 点赞 / 取消点赞

### 用户 (user)
- `GET /api/user/profile` — 用户信息
- `POST /api/user/profile/update` — 更新昵称/头像

### 操作日志 (changelog)
- `GET /api/changelog/list` — 操作日志
- `GET /api/changelog/proposal/grouped` — 按提案分组
- `GET /api/changelog/proposal/timeline` — 时间线

**总计 29 个接口**。

---

## 4. 错误约定

### 业务错误（4xx）

```json
{
  "code": 10001,
  "msg": "提案标题已存在",
  "data": null
}
```

**约定的错误码**（建议）：

| 范围 | 含义 |
|---|---|
| 0 | 成功 |
| 1xxxx | 通用错误（参数缺失、格式错误） |
| 2xxxx | 认证错误（未登录、token 过期） |
| 3xxxx | 权限错误（非管理员） |
| 4xxxx | 提案错误（重复、状态冲突） |
| 5xxxx | 评论错误 |
| 6xxxx | 教师/课程错误 |
| 7xxxx | 用户错误（昵称冲突、30 天冷却） |

### 系统错误（5xx）

```json
{
  "code": 500,
  "msg": "Internal Server Error"
}
```

**前端处理**：读取数据时兼容「扁平 / 嵌套」两种结构：
```typescript
const data = res.data?.data ?? res.data;  // 兼容扁平结果
```

但**业务 code 仍需逐个判断**：
```typescript
if (res.data?.code !== 0) {
  uni.showToast({ title: res.data?.msg || '操作失败', icon: 'none' });
}
```

---

## 5. 跨域 + Token 机制

### 当前前端假设

```typescript
// src/config/utils/http.ts
const token = useTokenStore().token;
config.headers![process.env.VITE_TOKEN_NAME] = `Bearer ${token}`;
```

后端需要：
- 接收 `Authorization: Bearer <token>` 头
- 返回 `401` 表示 token 过期
- 前端处理：跳转到登录页

### Dev API 推荐

```typescript
// .env.development
VITE_SERVER_HOST_PORT=https://dev-api.yourdomain.com
```

或本地代理：
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

---

## 6. 关键 DTO 字段速查

### `DtoProposalVO`
```typescript
{
  id: string
  userId: string
  title: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  deleted: boolean
  rejectReason?: string
  showUsername: boolean     // 是否展示昵称
  contribution?: number     // 该提案贡献值
  createdAt: string
  updatedAt: string
  course: DtoCourseVO
  finalCourse?: DtoProposalCourseVO  // 管理员确认后
}
```

### `DtoCourseVO`
```typescript
{
  id: string
  name: string
  code?: string
  proposalId?: string  // 来源提案
  department?: string
  category?: string
  campuses?: string[]
  teachers: Array<string | DtoTeacherVO>  // 兼容新旧
}
```

### `DtoUserProfile`（含每日配额）
```typescript
{
  username: string
  avatar?: string
  contribution: number
  dailyQuota: number        // 今日剩余
  dailyQuotaLimit: number   // 每日上限
  canEditUsername: boolean  // 30 天冷却
}
```

### `DtoProposalTimelineLogVO`
```typescript
{
  logId: string
  operatorId: string
  operatorName: string
  actionType: 'CREATE' | 'APPROVE' | 'REJECT' | 'DELETE' | 'UPDATE' | 'GRANT_ADMIN' | 'REVOKE_ADMIN'
  actionTime: string
  proposalId: string
  proposalSnapshot?: DtoProposalSnapshotVO
  details: Record<string, any>  // 例如：拒绝原因、贡献值变化
}
```

---

## 7. 频率 / 性能约定

| 接口 | 频率 | 缓存 |
|---|---|---|
| `/api/proposal/filter` | 高（每页加载） | 短时内存缓存 |
| `/api/proposal/{id}` | 中 | 1 分钟 |
| `/api/proposal/history` | 低（我的页面） | 长时缓存 |
| `/api/course/{id}` | 高 | 5 分钟 |
| `/api/comment/query` | 高 | 30 秒 |
| `/api/user/profile` | 中 | 5 分钟 |
| `/api/auth/is_admin` | 高（每次进入） | 永久（登录后不变） |

**前端暂未做缓存层**——后续优化时用 `useRequest` composable + IndexedDB。

---

## 8. 监控 + 错误上报

建议后端接入：
- **Sentry** 异常监控（前端 `src/main.ts` 接入 `@sentry/vue`）
- **Prometheus** + Grafana 接口 QPS/延迟
- **Sentry Performance** 前后端链路追踪

---

## 9. 紧急修复流程

后端发现严重 BUG 需要前端立即适配：

```bash
# 1. 后端 PR 改 swagger.json
# 2. 前端开发者：
git pull origin main
yarn api
yarn type-check
# 修复错误
yarn build:mp-weixin
# 通过 PR 提交
```

**时间目标**：重大 BUG 4 小时内必须修复。

---

## 10. 沟通规范

### 字段命名

- **snake_case** 用于 swagger / JSON / 数据库
- **camelCase** 用于 TypeScript
- **自动转换** 由 `swagger-typescript-api` 完成

### 时间格式

- 后端返回 ISO 8601 (`2026-08-17T10:00:00Z`)
- 前端用 `new Date(iso)` 解析
- 显示用 `formatDate(iso)` 工具函数

### 状态枚举

- `pending` / `approved` / `rejected`（统一三态）
- `CREATE` / `APPROVE` / `REJECT` / `DELETE`（操作日志）

### 错误信息

- 用户友好：`昵称已存在`、`提案正在审核中`
- i18n 准备：暂用中文，错误码统一便于以后翻译

---

## 11. 后续扩展路线

| 阶段 | 时间 | 重点 |
|---|---|---|
| v1.0（当前） | 现在 | 提案基础 + 暗色模式 |
| v1.1 | 1-2 周 | 后端 2.0 联调 + 评论重写 |
| v1.2 | 1 月 | 教师系统 + 课程举报 |
| v1.3 | 2 月 | 缓存层 + 离线能力 |
| v2.0 | 3 月 | SSR (Web 端) + 搜索建议 AI 化 |

---

## 12. 文档

- `docs/DEV_GUIDE.md` —— 开发者完整指南
- `docs/PROJECT_OVERVIEW.md` —— 页面路由与交互清单
- `docs/DESIGN_LANGUAGE.md` —— 设计语言与视觉规范

---

## 13. 立即可做的 3 件事

| # | 任务 | 时间 |
|---|---|---|
| 1 | 后端确认 swagger.json 与代码同步 | 后端 30 分钟 |
| 2 | 提供 dev API 地址（含 CORS） | 后端 30 分钟 |
| 3 | 前端 `yarn api` 跑通 + 列出所有 warning | 我 10 分钟 |

---

## 14. 总结：核心契约

**`src/swagger.json` 是前后端沟通的唯一真相。**

变更流程：
1. 后端改代码 → 自动 / 手动更新 `swagger.json`
2. 通知前端（PR / 微信）
3. 我跑 `yarn api` → TypeScript 客户端重生成
4. 跑 `yarn type-check` → 找出哪些地方需要适配
5. 修复 → 提交 PR

**后端不变 swagger.json = 前端永远不知道。** 这是契约，不是文档。
