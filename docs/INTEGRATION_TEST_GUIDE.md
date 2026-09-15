# 提案功能联调专项文档

> 基于代码扫描生成 · 2026-08-25
> 联调清单：9项核心功能

---

## 联调总览

| # | 功能 | 前端状态 | 入口 | 核心 API |
|---|------|---------|------|----------|
| 1 | 新增提案 | ✅ 就绪 | 首页FAB / 提案广场FAB / 搜索页 | `POST /api/proposal/add` |
| 2 | 管理员直接通过 | ✅ 就绪 | 提案广场→"通过"按钮 | `POST /api/proposal/{id}/approve` |
| 3 | 管理员拒绝 | ✅ 就绪 | 提案广场→"拒绝"按钮→RejectModal | `POST /api/proposal/{id}/reject` |
| 4 | 管理员修改通过 | ✅ 就绪 | 同功能2，修改表单后提交 | `POST /api/proposal/{id}/approve` |
| 5 | 撤回通过操作 | ✅ 就绪 | 提案广场→"撤回审批"按钮 | `POST /api/proposal/{id}/revoke` |
| 6 | 撤回拒绝操作 | ✅ 就绪 | 提案广场→"撤回"按钮 | `POST /api/proposal/{id}/revoke` |
| 7 | 删除发布提案 | ✅ 就绪 | 我的→长按提案→"删除" | `POST /api/proposal/{id}/delete` |
| 8 | 查看通过课程 | ✅ 就绪 | 提案广场→已通过卡片→"查看课程" | `GET /api/course/{id}` |
| 9 | 重新编辑功能 | ✅ 就绪 | 我的→长按提案→"修改" | `POST /api/proposal/add` |

---

## 功能 1：新增提案

### 测试路径

```
入口 → 填写表单 → 校验 → 提交 → 成功反馈 → 返回列表
```

### 入口（3个）

| 入口 | 操作 | 跳转 |
|------|------|------|
| 首页 | 点击搜索框→搜索结果→"亲自提案新课程" | `proposal/propose/propose` |
| 我的页 | FAB"+"→选"新增提案" | `proposal/propose/propose` |
| 提案广场 | FAB"+" / 空态"发起提案"按钮 | `proposal/propose/propose` |

### 表单字段

| 字段 | 类型 | 必填 | 交互方式 |
|------|------|------|---------|
| 课程名称 | text | ✅ | 点击→SearchModal(field=courseName) |
| 课程代码 | text | ❌ | 点击→SearchModal(field=courseCode) |
| 开课院系 | text | ✅ | 点击→SearchModal(field=department) |
| 课程类别 | text | ✅ | 点击→SearchModal(field=category) |
| 开课校区 | multi-select | ✅ | 点击标签切换（普陀/闵行/滴水湖） |
| 授课教师 | list | ✅(≥1) | 点击→TeacherListModal→AddTeacherModal |
| 提案理由 | textarea | ❌ | 直接输入，300字限制 |
| 展示昵称 | toggle | ✅ | 点击切换（展示/不展示） |

### API 调用

```
POST /api/proposal/add
Body: {
  title: string,           // 课程名称
  content: string,         // 提案理由
  course: {
    name: string,
    code?: string,
    department: string,
    category: string,
    campuses: string[],
    teachers: [{ name, title, department, teacherId? }]
  },
  showUsername: boolean
}
```

### 校验规则

| 校验失败 | Toast 提示 |
|---------|-----------|
| 课程名称为空 | "请输入课程名称" |
| 开课院系为空 | "请选择开课院系" |
| 课程类别为空 | "请选择课程类别" |
| 未选校区 | "请选择开课校区" |
| 无教师 | "请填写至少一位授课教师" |
| 未选昵称展示 | "请选择是否展示昵称" |
| 今日配额用尽 | "今日提交已达上限(N)" |

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "提交成功，等待管理员审核" (success) | 1.5s 后 navigateBack，触发 `proposalListShouldRefresh` 事件 |
| 失败 | Toast "提交失败(code:N)" (none) | 停留在当前页 |

### 联调验证点

- [ ] SearchModal 搜索字段建议接口 `GET /api/proposal/field-suggestions` 正常返回
- [ ] TeacherListModal → AddTeacherModal 添加教师 `POST /api/teacher/add` 正常
- [ ] 每日配额 `dailyQuota / dailyQuotaLimit` 显示正确
- [ ] 提交后提案广场列表自动刷新（事件总线 `proposalListShouldRefresh`）

---

## 功能 2：管理员直接通过

### 测试路径

```
提案广场(管理员Tab) → 待审核卡片 → "通过" → 跳转审批表单 → 确认/修改 → 提交
```

### 前置条件

- 用户需为管理员（`GET /api/auth/is_admin` 返回 `isAdmin: true`）
- 提案状态为 `pending`

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 在"全部提案"Tab 看到 pending 状态卡片 | `list.vue:94-146` |
| 2 | 卡片上显示"通过""拒绝"两个管理员按钮 | `list.vue:135-141` |
| 3 | 点击"通过" | `handleApprove(item)` |
| 4 | 跳转到 `propose?approveProposalId={id}` | `list.vue:606` |
| 5 | propose 页面检测 `approveProposalId` 参数 | `propose.vue:453-460` |
| 6 | 自动拉取提案详情预填表单 | `fetchProposalForForm(id)` |
| 7 | 顶部显示红色"管理员审批模式"banner | `propose.vue:20-25` |
| 8 | 管理员可修改表单中的课程信息 | 表单全部可编辑 |
| 9 | 点击"通过提案"按钮 | 提交 |

### API 调用

```
POST /api/proposal/{proposalId}/approve
Body: {
  proposalID: string,
  finalCourse: {
    name: string,
    code?: string,
    department: string,
    category: string,
    campuses: string[],
    teachers: [{ name, title, department, teacherId? }]
  }
}
```

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "已通过" (success) | 1.5s 后 navigateBack，触发 `proposalListShouldRefresh` |
| 失败 | Toast "通过失败" / "操作失败" (none) | 停留当前页 |

### 联调验证点

- [ ] `GET /api/proposal/{id}` 正确返回提案详情用于预填表单
- [ ] `finalCourse` 字段正确构建（从表单数据组装）
- [ ] 审批成功后提案状态变为 `approved`
- [ ] 关联课程被创建（`finalCourse.id` 有值）
- [ ] 贡献值正确结算给提案创建者

---

## 功能 3：管理员拒绝

### 测试路径

```
提案广场(管理员Tab) → 待审核卡片 → "拒绝" → RejectModal → 填写理由 → 确认
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 点击 pending 卡片上的"拒绝" | `handleReject(item)` |
| 2 | 弹出 RejectModal | `list.vue:609-611` |
| 3 | 输入拒绝理由（必填，200字限制） | RejectModal 内部 |
| 4 | 确认按钮在理由为空时禁用 | RejectModal 内部 |
| 5 | 点击"确认拒绝" | `handleRejectConfirm(reason)` |

### API 调用

```
POST /api/proposal/{proposalId}/reject
Body: {
  proposalId: string,
  reason: string
}
```

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "已拒绝" (success) | 自动 reload 列表 |
| 失败 | Toast "拒绝失败" / "操作失败" (none) | Modal 关闭 |

### 联调验证点

- [ ] RejectModal 弹出正常，textarea 可输入
- [ ] 空理由时确认按钮禁用
- [ ] 拒绝后提案状态变为 `rejected`
- [ ] `rejectReason` 字段被保存，前端可展示
- [ ] 提案创建者能看到拒绝原因

---

## 功能 4：管理员修改通过

### 测试路径

```
同功能2入口 → 审批表单 → 修改课程信息 → 通过提案
```

### 与功能2的区别

功能2是直接通过（不修改），功能4是管理员在审批表单中**修改课程信息后再通过**。

### 可修改字段

| 字段 | 可修改 | 说明 |
|------|--------|------|
| 课程名称 | ✅ | 通过 SearchModal 选择或手动输入 |
| 课程代码 | ✅ | 同上 |
| 开课院系 | ✅ | 同上 |
| 课程类别 | ✅ | 同上 |
| 开课校区 | ✅ | 标签切换 |
| 授课教师 | ✅ | TeacherListModal 增删 |
| 提案理由 | ❌ | 仅展示，不可编辑（admin模式下隐藏） |

### API 调用

与功能2相同，但 `finalCourse` 字段包含管理员修改后的数据：

```
POST /api/proposal/{proposalId}/approve
Body: {
  proposalID: string,
  finalCourse: { ...修改后的课程信息 }
}
```

### 联调验证点

- [ ] 修改课程名称后，`finalCourse.name` 为修改后的值
- [ ] 修改教师后，`finalCourse.teachers` 为修改后的列表
- [ ] 创建的课程使用 `finalCourse` 而非原始提案数据
- [ ] 前端表单 `courseCode` 自动 `.toUpperCase()`

---

## 功能 5：撤回通过操作

### 测试路径

```
提案广场(管理员Tab) → 已通过卡片 → "撤回审批" → 确认 → 列表刷新
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 已通过卡片上显示"撤回审批"按钮 | `list.vue:143-145` |
| 2 | 点击按钮 | `handleWithdraw(item)` |
| 3 | 根据 status 确定 actionType | `list.vue:635-638` |
| 4 | `status === 'approved'` → `actionType = 'approve'` | — |
| 5 | 调用撤回 API | `list.vue:640` |

### API 调用

```
POST /api/proposal/{proposalId}/revoke
Body: {
  actionType: "approve"
}
```

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "已撤回" (success) | 自动 reload 列表 |
| 失败 | Toast "撤回失败" / "操作失败" (none) | — |

### 联调验证点

- [ ] 撤回后提案状态变回 `pending`
- [ ] 关联课程被删除
- [ ] 已结算的贡献值被扣回
- [ ] 列表自动刷新显示新状态

---

## 功能 6：撤回拒绝操作

### 测试路径

```
提案广场(管理员Tab) → 已拒绝卡片 → "撤回" → 确认 → 列表刷新
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 已拒绝卡片上显示"撤回"按钮 | `list.vue:143-145` |
| 2 | 点击按钮 | `handleWithdraw(item)` |
| 3 | `status === 'rejected'` → `actionType = 'reject'` | `list.vue:636-637` |
| 4 | 调用撤回 API | `list.vue:640` |

### API 调用

```
POST /api/proposal/{proposalId}/revoke
Body: {
  actionType: "reject"
}
```

### 成功/失败反馈

与功能5相同。

### 联调验证点

- [ ] 撤回后提案状态变回 `pending`
- [ ] `rejectReason` 被清除
- [ ] 列表自动刷新

---

## 功能 7：删除发布提案

### 测试路径

```
我的页 → 筛选"提案" → 长按提案卡片 → ActionSheet → "删除" → 确认
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 在"我的"页筛选显示提案列表 | profile-view 筛选胶囊 |
| 2 | 长按提案卡片 | `onLongPress(item)` |
| 3 | 弹出 ActionSheet | `profile-view:454-478` |
| 4 | 无票: ["修改", "删除"] | — |
| 5 | 有票: ["查看详情", "修改(清空票数)", "删除"] | — |
| 6 | 点击"删除" | `deleteItem(item)` |

### API 调用

```
POST /api/proposal/{proposalId}/delete
Body: {}  // 空对象
```

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "已删除" (success) | 从列表中移除该条目 |
| 失败 | Toast "删除失败" (none) | — |

### 联调验证点

- [ ] 仅 `pending` 和 `rejected` 状态的提案可删除
- [ ] 删除后前端列表立即移除该条目（乐观更新）
- [ ] 评论类型不支持删除（Toast "评论暂不支持删除"）
- [ ] `proposalDeleteCreate` 的参数签名：`(proposalId)` 无额外 body

---

## 功能 8：查看通过课程

### 测试路径

```
提案广场 → 已通过提案卡片 → "查看课程"按钮 → 课程详情页
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 已通过提案卡片底部显示绿色"查看课程→" | `list.vue:135-139` |
| 2 | 条件: `item.status === 'approved' && item.courseId` | — |
| 3 | 点击按钮 | `goToCourse(item.courseId)` |
| 4 | 跳转到 `/pages/course/index/index?id={courseId}` | `list.vue:593-595` |

### 数据来源

`courseId` 从 API 返回的 `finalCourse.id` 中提取：

```js
// list.vue:482-496 mapProposalItem
const course = item.course || item.finalCourse || {};
return { ..., courseId: course.id || '' };
```

### 联调验证点

- [ ] `proposalFilterList` 返回的提案数据包含 `finalCourse` 字段
- [ ] `finalCourse.id` 有值（管理员通过时创建的课程ID）
- [ ] 课程详情页 `GET /api/course/{courseId}` 能正确加载该课程
- [ ] `proposalHistoryList` 返回的"我的提案"也包含 `finalCourse.id`
- [ ] 按钮样式：绿色渐变背景、圆角、按压缩放反馈

---

## 功能 9：重新编辑功能

### 测试路径

```
我的页 → 长按提案 → "修改" → 跳转编辑表单 → 修改 → 重新提交
```

### 操作流程

| 步骤 | 操作 | 代码位置 |
|------|------|---------|
| 1 | 长按提案卡片 | `onLongPress(item)` |
| 2 | ActionSheet 选"修改" | `profile-view:472` |
| 3 | 跳转到 `propose?editProposalId={id}` | `profile-view:473` |
| 4 | propose 页面检测 `editProposalId` 参数 | `propose.vue:461-467` |
| 5 | 自动拉取提案详情预填表单 | `fetchProposalForForm(id)` |
| 6 | 顶部显示蓝色"重新编辑模式"banner | `propose.vue:27-31` |
| 7 | 用户修改表单内容 | — |
| 8 | 按钮文字变为"重新提交" | `propose.vue:157` |
| 9 | 点击提交 | — |

### API 调用

重新编辑创建一个**新提案**（不是更新原提案）：

```
POST /api/proposal/add
Body: {
  title: string,
  content: string,
  course: { ...修改后的课程信息 },
  showUsername: boolean
}
```

> 注意：重新编辑调用的是 `proposalAddCreate`（新增），不是 `proposalUpdateCreate`（更新）。

### 成功/失败反馈

| 结果 | 反馈 | 后续 |
|------|------|------|
| 成功 | Toast "重新提交成功" (success) | 1.5s 后 navigateBack |
| 失败 | Toast "提交失败(code:N)" (none) | 停留当前页 |

### 联调验证点

- [ ] 预填表单数据与原提案一致
- [ ] 蓝色 banner 显示"重新编辑模式"
- [ ] 按钮文字显示"重新提交"
- [ ] 提交后创建新提案（新 ID），原提案不受影响
- [ ] 配额检查：重新编辑也消耗每日配额
- [ ] 成功后触发 `proposalListShouldRefresh` 事件

---

## 联调通用验证项

### 跨功能验证

| 验证项 | 说明 |
|--------|------|
| 事件总线 | `proposalListShouldRefresh` 事件正确触发和监听 |
| 管理员权限 | `GET /api/auth/is_admin` 正确识别管理员 |
| 操作日志 | 每次操作后 `GET /api/changelog/proposal/timeline` 有对应记录 |
| 贡献值 | 通过/撤回通过时贡献值正确增减 |
| 状态流转 | pending → approved → (revoke) → pending |
| 状态流转 | pending → rejected → (revoke) → pending |
| 状态流转 | pending/rejected → (delete) → deleted |
| Dark Theme | 所有弹窗/卡片/按钮在深色模式下显示正常 |
| 错误处理 | 网络异常时 Toast 提示，不白屏 |

### API 响应码约定

| code | 含义 | 前端处理 |
|------|------|---------|
| 0 / 200 | 成功 | 显示成功 Toast |
| 201 | 创建成功 | 同上 |
| 其他 | 失败 | 显示 `msg` 或默认错误提示 |

---

## 快速联调命令

```bash
cd new/
yarn install
yarn api                  # 重新生成 API 类型（swagger.json 更新后）
yarn dev:mp-weixin        # 开发构建
yarn build:mp-weixin      # 生产构建
yarn type-check           # 类型检查
```

微信开发者工具导入 `dist/dev/mp-weixin` 目录预览。
