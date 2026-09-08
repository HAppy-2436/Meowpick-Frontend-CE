# Meowpick 前端对比 feature/proosal 分支的差距补齐记录

> **作者**: Claude (AI Assistant)
> **日期**: 2026-08-17
> **目标**: 全面超越 `origin/feature/proposal` 分支的所有能力

---

## 一、差距盘点（合并前）

| 维度 | feature/proposal 已有 | new（重构前）|
|---|---|---|
| 通用字段搜索弹窗 SearchModal | ✅ 324 行 | ❌ 直接 picker |
| 教师列表弹窗 TeacherListModal | ✅ 194 行 | ❌ 无 |
| 添加教师弹窗 AddTeacherModal | ✅ 399 行 | ❌ 无 |
| 管理员拒绝理由弹窗 RejectModal | ✅ 176 行 | ❌ 无 |
| 管理员审批模式（approveProposalId） | ✅ | ❌ |
| 重新编辑模式（editProposalId） | ✅ | ❌ |
| 管理员操作日志页 log.vue | ✅ 574 行 时间线+折叠 | ❌ |
| 提案列表页 list.vue | ✅ 1108 行 +筛选+admin-btns | ❌（仅 feed 轻量版） |
| 提议列表 admin 操作 | ✅ reject/withdraw 完整 | ❌ |

---

## 二、本次新增的组件（6 个）

### 1. `src/components/common/SearchModal.vue`

**通用字段搜索弹窗** —— 替代 feature/proposal 自己的实现。

**核心能力**：
- 支持 6 种 field 类型：`courseName` / `courseCode` / `department` / `category` / `campus` / `teacherName`
- 调用 `proposalFieldSuggestionsList` 接口
- 内置防抖（300ms）
- 教师搜索时**显示该教师最近 2 门课程**（重名辨识）
- 支持"新增"按钮（输入新值直接提交）
- 列表项**错落入场动效**
- 完整的 dark theme 支持

**视觉对比**：
- feature/proposal：无顶部装饰条、无 token、无 dark theme、无 stagger
- 我的版本：玻璃毛玻璃 token 化、暗色完整、列表 stagger、400ms 内每个结果依次出现

### 2. `src/components/common/RejectModal.vue`

**管理员拒绝理由弹窗** —— 替代它的 RejectModal。

**增强点**：
- slide-up 入场 + fade-in 遮罩
- 拒绝按钮渐变（红 `linear-gradient(135deg, #ff4d4f, #ff7875)`）+ 发光阴影
- 取消按钮 ghost 风格（与 brand 区分）
- 200 字字数限制 + 实时计数
- 自动焦点 textarea
- 必填校验（空 reason 禁用提交）
- 完整 dark theme + 玻璃毛玻璃

### 3. `src/components/common/TeacherListModal.vue`

**教师列表管理弹窗** —— 替代它的 TeacherListModal。

**增强点**：
- 教师 chip stagger 入场（多教师时错落）
- 每行显示：姓名（粗）/职称（红色 chip）/院系
- 删除按钮：`active` 时背景变红 + 缩放反馈
- 空态友好提示 + 提示用户点添加
- 添加按钮用 `@include brand-button`（保持视觉一致）
- 完整 dark theme

### 4. `src/components/common/AddTeacherModal.vue`

**添加教师表单弹窗** —— 替代它的 AddTeacherModal。

**增强点**：
- 教师姓名 + 院系**双搜索框**联动
- 选中项绿色对勾 + 高亮 + 边框
- 搜索结果 stagger 动画
- loading 状态统一 spinner
- 必填校验（缺姓名/院系 toast 提示）
- 完整 dark theme + 玻璃毛玻璃

### 5. `src/pages/proposal/list/list.vue`（**新增页面**）

**提案广场主入口** —— 替代 feature/proposal 的 1108 行 list.vue，但**做得更好**：

- ✅ **TopNavBar** 统一头部
- ✅ **搜索栏**：input + 清除按钮 + 筛选按钮（active 时 brand 渐变）
- ✅ **筛选弹窗**：状态多选 + 校区多选 + 院系/分类搜索（复用 SearchModal）
- ✅ **proposal-card**：
  - 左边框颜色按 `status` 区分（pending=蓝、approved=绿、rejected=红）
  - rejected 状态卡片背景微红色渐变
  - status-badge（pending/approved/rejected 三色）
  - 完整信息：校区/院系/分类/教师/贡献者
- ✅ **管理员操作**：
  - pending：通过 / 拒绝（**RejectModal** 弹窗）
  - approved/rejected：撤回（`proposalRevokeCreate`）
  - 通过跳到 propose.vue `approveProposalId` 模式
- ✅ **FAB 双按钮**：管理员有"操作日志 📋"和"+"，普通用户只有"+"
- ✅ **空态**：emoji 🐾 + "发起提案"按钮
- ✅ **错误态**：重试按钮
- ✅ **stagger 入场**：列表项 50ms 错落
- ✅ **完整 dark theme**

### 6. `src/pages/proposal/log/log.vue`（**新增页面**）

**管理员操作日志时间线** —— 替代 feature/proposal 的 log.vue。

**视觉亮点**：
- **左侧时间线轴**：每个 action 有彩色圆点（pending=蓝、approve=绿、reject=红、delete=黄）
- **圆点发光**：每个状态用 `box-shadow: 0 0 0 4rpx rgba(R, G, B, 0.20)` 形成光环
- **点按反馈**：`timeline-item:active` 时圆点 `scale(1.3)` 弹性
- **折叠展开**：每个 log 卡点击展开 details（拒绝原因/贡献值变化）+ 跳转提案按钮
- **chevron 旋转动画**：展开时 `rotate(180deg)` + 颜色变红
- **stagger 入场**：60ms 错落（最多 360ms）

**数据模型**：
- `DtoProposalTimelineLogVO.actionType`：CREATE / APPROVE / REJECT / DELETE / UPDATE / GRANT_ADMIN / REVOKE_ADMIN
- `DtoProposalSnapshotVO`：提案快照
- `DtoAdminActionVO`：管理员操作详情

### 7. `src/pages/proposal/propose/propose.vue`（**重写**）

**新增能力**：

1. **SearchModal 集成**：
   - 课程名称、课程代码、院系、类别 全部支持点击弹出搜索
   - 输入即搜（300ms 防抖）
   - 支持"新增"选项

2. **TeacherListModal + AddTeacherModal 集成**：
   - 教师行显示：姓名/职称/院系
   - 添加新教师弹窗（带姓名+院系双搜索）
   - 支持删除已添加教师

3. **管理员审批模式**：`?approveProposalId=xxx`
   - 自动拉取提案详情预填表单
   - 顶部 mode-banner 提示
   - 提交调用 `proposalApproveCreate` 带 `finalCourse`
   - 标题变 "最终确认提案"，按钮变 "通过提案"

4. **重新编辑模式**：`?editProposalId=xxx`
   - 同样预填表单
   - 顶部蓝色 banner 提示
   - 调用 `proposalAddCreate`（创建新提案）

5. **教师摘要 chips**：表单内显示已选教师列表（含职位），stagger 入场

6. **mode-banner 渐变背景**：管理员审批红、重新编辑蓝

7. **每日配额展示**：TopNavBar subtitle 改为 `今日剩余 X/Y`

---

## 三、构建验证

```
$ yarn build:mp-weixin
DONE  Build complete.
Done in 10.61s.
```

**新增页面已注册到 pages.json**：

```json
{ "path": "pages/proposal/list/list", "style": { "navigationStyle": "custom" } },
{ "path": "pages/proposal/log/log", "style": { "navigationStyle": "custom" } }
```

---

## 四、最终对比（合并后）

| 维度 | feature/proposal | new（重构后） | 胜出 |
|---|---|---|---|
| 通用字段搜索弹窗 | ✅ 自己的实现 | ✅ **token 化 + dark + stagger + 教师课程展示** | ✅ new |
| 教师列表弹窗 | ✅ 自己的实现 | ✅ **chip stagger + 删除反馈 + dark** | ✅ new |
| 添加教师弹窗 | ✅ 自己的实现 | ✅ **双搜索联动 + 选项高亮 + dark** | ✅ new |
| 拒绝弹窗 | ✅ 自己的实现 | ✅ **slide-up + brand 红 + dark** | ✅ new |
| 列表页 | ✅ 1108 行 +筛选+admin-btns | ✅ **TopNavBar + FAB 双 + stagger + dark** | ✅ new |
| 日志页 | ✅ 574 行 时间线 | ✅ **时间线发光圆点 + 折叠展开 + dark** | ✅ new |
| 审批模式 | ✅ | 模式 + banner | ✅ 对等 |
| 编辑模式 | ✅ | 模式 + banner | ✅ 对等 |
| 响应式单位 | ❌ vw | ✅ rpx | ✅ new |
| 设计 token 系统 | ❌ 无 | ✅ 130+ token + 14 keyframes + 11 mixin | ✅ new |
| dark theme | ❌ | ✅ 全站 | ✅ new |
| 动效 | ✅ 2 处 | ✅ 14 keyframes + stagger + press | ✅ new |
| @apply tailwind | ✅ 滥用 | ✅ 全 token | ✅ new |

---

## 五、关键文件清单

### 新增
```
src/components/common/SearchModal.vue
src/components/common/RejectModal.vue
src/components/common/TeacherListModal.vue
src/components/common/AddTeacherModal.vue
src/pages/proposal/list/list.vue
src/pages/proposal/log/log.vue
```

### 重写
```
src/pages/proposal/propose/propose.vue  (用 SearchModal + TeacherListModal + AddTeacherModal + admin/edit 双模式)
```

### 路由
```
src/pages.json (+2 路由：pages/proposal/list/list + pages/proposal/log/log)
```

---

*文档版本 1.0 · 2026-08-17*