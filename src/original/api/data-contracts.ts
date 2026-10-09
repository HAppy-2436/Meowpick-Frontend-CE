/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DtoAdminActionVO {
  /** 最近动作名称，例如 approve、reject、delete、update */
  action?: string;
  /** 操作时间，格式 YYYY-MM-DD HH:mm:ss */
  actionTime?: string;
  /** 操作管理员用户ID */
  adminId?: string;
  /** 管理员昵称；未设置时回退为 OpenID */
  adminName?: string;
  /** 日志正文或拒绝理由，无内容时省略 */
  reason?: string;
}

export interface DtoChangeLogVO {
  /** 操作类型内部编号 */
  action?: number;
  /** 操作说明或拒绝理由等日志正文 */
  content?: string;
  /** 变更日志ID */
  id?: string;
  /** 与提案相关时返回提案ID，否则省略 */
  proposalId?: string;
  /** 被操作业务对象ID */
  targetId?: string;
  /** 目标类型内部编号 */
  targetType?: number;
  /** 操作来源内部编号，例如用户或管理员 */
  updateSource?: number;
  /** 操作记录时间 */
  updatedAt?: string;
  /** 操作者用户ID */
  userId?: string;
}

export interface DtoCommentVO {
  /** “我的评论”中附带的课程分类；普通课程评论列表中为空 */
  category?: string;
  /** 评论正文 */
  content?: string;
  /** 所属正式课程ID */
  courseId?: string;
  /** 发布时间 */
  createdAt?: string;
  /** “我的评论”中附带的课程开课院系；普通课程评论列表中为空 */
  department?: string;
  /** 评论ID */
  id?: string;
  /** 当前登录用户在操作后或查询时是否已点赞 */
  like?: boolean;
  /** 目标当前点赞总数 */
  likeCnt?: number;
  /** “我的评论”中附带的课程名称；普通课程评论列表中为空 */
  name?: string;
  /**
   * 评论标签列表，可为空
   * @uniqueItems false
   */
  tags?: string[];
  /**
   * “我的评论”中附带的教师姓名与职称拼接字符串列表；普通课程评论列表中为空
   * @uniqueItems false
   */
  teachers?: string[];
  /** 最近更新时间 */
  updatedAt?: string;
  /** 评论发布者用户ID */
  userId?: string;
}

export interface DtoCourseBrief {
  /** 未删除课程ID */
  id?: string;
  /** 课程名称 */
  name?: string;
}

export interface DtoCourseContributorVO {
  /** 创建该课程的已通过提案ID */
  proposalId?: string;
  /** 来源提案是否允许公开展示创建者昵称 */
  showUsername?: boolean;
  /** 提案允许展示昵称时返回创建者用户ID，匿名时省略 */
  userId?: string;
  /** 提案允许展示昵称时返回当前昵称，未设置昵称时可能为空 */
  username?: string;
}

export interface DtoCourseVO {
  /**
   * 开设校区名称列表
   * @uniqueItems false
   */
  campuses?: string[];
  /** 课程分类名称；映射缺失时返回未知分类 */
  category?: string;
  /** 课程代码，历史数据中可能为空 */
  code?: string;
  /** 课程由审批提案创建时返回来源信息；历史课程无来源提案时省略 */
  contributor?: DtoCourseContributorVO;
  /** 课程开课院系名称；不是教师所属院系 */
  department?: string;
  /** 正式课程ID */
  id?: string;
  /** 课程名称 */
  name?: string;
  /** 当前未删除评论中出现次数最多的至多三个非空标签及计数 */
  tagCount?: Record<string, number>;
  /**
   * 任课教师详情；教师所属院系暂未维护时返回未知开课院系
   * @uniqueItems false
   */
  teachers?: DtoTeacherVO[];
}

export interface DtoCreateCommentReq {
  /**
   * 评论正文，服务端去除首尾空白后必须为1至140个 Unicode 字符，并在发布前完成内容审核
   * @minLength 1
   * @maxLength 140
   */
  content: string;
  /** 所属正式课程ID，必填 */
  courseId: string;
  /**
   * 可选标签，最多4个、不得重复，只能取八个固定值之一
   * @maxItems 4
   * @uniqueItems true
   */
  tags?: ('容易' | '硬核' | '避雷' | '推荐' | '严格' | '快跑' | '幽默' | '枯燥')[];
}

export interface DtoCreateCommentResp {
  /** “我的评论”中附带的课程分类；普通课程评论列表中为空 */
  category?: string;
  /** 评论正文 */
  content?: string;
  /** 所属正式课程ID */
  courseId?: string;
  /** 发布时间 */
  createdAt?: string;
  /** “我的评论”中附带的课程开课院系；普通课程评论列表中为空 */
  department?: string;
  /** 评论ID */
  id?: string;
  /** 当前登录用户在操作后或查询时是否已点赞 */
  like?: boolean;
  /** 目标当前点赞总数 */
  likeCnt?: number;
  /** “我的评论”中附带的课程名称；普通课程评论列表中为空 */
  name?: string;
  /**
   * 评论标签列表，可为空
   * @uniqueItems false
   */
  tags?: string[];
  /**
   * “我的评论”中附带的教师姓名与职称拼接字符串列表；普通课程评论列表中为空
   * @uniqueItems false
   */
  teachers?: string[];
  /** 最近更新时间 */
  updatedAt?: string;
  /** 评论发布者用户ID */
  userId?: string;
}

export interface DtoCreateProposalReq {
  /** 提案补充说明，可为空 */
  content?: string;
  /** 提议新增的课程完整信息 */
  course: DtoProposalCourseVO;
  /** 是否允许公开展示提案创建者昵称；false 表示匿名展示 */
  showUsername?: boolean;
  /** 提案标题，去除首尾空白后不能为空 */
  title: string;
}

export interface DtoCreateProposalResp {
  /** 新建后的完整待审核提案 */
  proposal?: DtoProposalVO;
  /** 新建提案ID */
  proposalId?: string;
}

export interface DtoCreateTeacherReq {
  /** 教师所属院系，独立创建教师时必填；这与提案内教师院系可空的规则不同 */
  department: string;
  /** 教师姓名，必填 */
  name: string;
  /** 教师职称，必填 */
  title: string;
}

export interface DtoCreateTeacherResp {
  /** 教师所属院系；提案场景允许为空，表示暂未维护 */
  department?: string;
  /** 教师ID；提案引用已有教师时传入，新教师可为空 */
  id?: string;
  /** 教师姓名 */
  name?: string;
  /** 教师职称 */
  title?: string;
}

export interface DtoCreatorVO {
  /** 提案创建时间，格式 YYYY-MM-DD HH:mm:ss */
  createTime?: string;
  /** 提案创建者用户ID */
  creatorId?: string;
  /** 创建者昵称；未设置时回退为 OpenID */
  creatorName?: string;
}

export interface DtoDeleteCommentResp {
  /** 被软删除的评论ID */
  commentId?: string;
  /** 是否成功软删除 */
  deleted?: boolean;
  /** 本次删除完成时间 */
  deletedAt?: string;
}

export interface DtoDeleteProposalResp {
  /** 是否成功软删除 */
  deleted?: boolean;
  /** 本次删除完成时间 */
  deletedAt?: string;
  /** 执行删除的提案创建者用户ID */
  operatorId?: string;
  /** 被软删除的提案ID */
  proposalId?: string;
}

export interface DtoFieldSuggestionVO {
  /**
   * 仅 teacherName 建议返回，固定存在且最多两门；其他字段省略
   * @uniqueItems false
   */
  courses?: DtoCourseBrief[];
  /** 建议关联实体ID；教师、课程等数据库建议可能返回 */
  id?: string;
  /** 前端展示文本；教师有职称时格式为“姓名 - 职称” */
  label?: string;
  /** teacherName 建议固定返回教师职称（历史教师无职称时为空字符串）；其他字段省略 */
  title?: string;
  /** 选中建议后写入请求字段的值 */
  value?: string;
}

export interface DtoGetCourseCampusesResp {
  /**
   * 同名未删除课程涉及的去重开设校区名称
   * @uniqueItems false
   */
  campuses?: string[];
}

export interface DtoGetCourseCategoriesResp {
  /**
   * 同名未删除课程涉及的去重课程分类名称
   * @uniqueItems false
   */
  categories?: string[];
}

export interface DtoGetCourseDepartmentsResp {
  /**
   * 同名未删除课程涉及的去重开课院系名称
   * @uniqueItems false
   */
  departments?: string[];
}

export interface DtoGetCourseResp {
  /** 未被软删除的课程完整信息 */
  course?: DtoCourseVO;
}

export interface DtoGetMyCommentsReq {
  /** 页码，从1开始；小于1时按1处理 */
  page?: number;
  /** 每页数量，范围1-100；未传、非正数或超过100时按10处理 */
  pageSize?: number;
}

export interface DtoGetMyCommentsResp {
  /**
   * 当前分页评论，附带对应课程信息及当前点赞状态
   * @uniqueItems false
   */
  comments?: DtoCommentVO[];
  /** 当前用户未删除评论总数 */
  total?: number;
}

export interface DtoGetMyProposalsResp {
  /**
   * 当前分页的个人提案历史
   * @uniqueItems false
   */
  proposals?: DtoProposalVO[];
  /** 当前用户全部提案总数，包含所有状态及已删除提案 */
  total?: number;
}

export interface DtoGetProposalFieldSuggestionsResp {
  /** 原样返回请求的字段类型 */
  field?: string;
  /**
   * 当前分页建议列表
   * @uniqueItems false
   */
  suggestions?: DtoFieldSuggestionVO[];
  /** 匹配建议总数 */
  total?: number;
}

export interface DtoGetProposalResp {
  proposal?: DtoProposalVO;
}

export interface DtoGetSearchHistoriesResp {
  /**
   * 当前用户最近15条搜索历史，按最近搜索时间倒序
   * @uniqueItems false
   */
  histories?: DtoSearchHistoryVO[];
}

export interface DtoGetSearchSuggestionsResp {
  /**
   * 合并后的建议列表，最多 pageSize 条
   * @uniqueItems false
   */
  suggestions?: DtoSearchSuggestionsVO[];
}

export interface DtoGetTeacherSuggestionsResp {
  /**
   * 当前分页教师建议列表
   * @uniqueItems false
   */
  teachers?: DtoTeacherVO[];
}

export interface DtoGetTotalCourseCommentsCountResp {
  /** 系统中所有未删除课程评论总数 */
  count?: number;
}

export interface DtoGetUserProfileResp {
  /** 当前头像引用，未设置时为空字符串 */
  avatar?: string;
  /** 当前是否允许设置或修改非空昵称；清空昵称不受30天冷却限制 */
  canEditUsername?: boolean;
  /** 用户累计贡献值，用于计算每日提案上限 */
  contribution?: number;
  /** 当前中国时区自然日内已创建的提案数量 */
  dailyQuota?: number;
  /** 按当前贡献值等级计算的每日提案上限 */
  dailyQuotaLimit?: number;
  /** 当前昵称，未设置时为空字符串 */
  username?: string;
}

export interface DtoGetUsernameByUserIDResp {
  /** 目标用户昵称，尚未设置时为空字符串 */
  username?: string;
}

export interface DtoGrantAdminReq {
  /** 要切换管理员状态的目标用户ID */
  userId?: string;
  /** 管理员授权密钥，必须与服务端配置完全一致 */
  verifyCode?: string;
}

export interface DtoGrantAdminResp {
  /** 切换后的管理员状态；true 表示已授予，false 表示已撤销 */
  isAdmin?: boolean;
}

export interface DtoIsAdminResp {
  /** 当前登录用户是否为管理员 */
  isAdmin?: boolean;
}

export interface DtoListChangeLogsReq {
  /** 可选日志内容关键词，大小写不敏感模糊匹配 */
  keyword?: string;
  /** 页码，从1开始；小于1时按1处理 */
  page?: number;
  /** 每页数量，范围1-100；未传、非正数或超过100时按10处理 */
  pageSize?: number;
  /** 可选目标类型：course、proposal、teacher、user；为空时不过滤类型 */
  type?: 'course' | 'proposal' | 'teacher' | 'user';
}

export interface DtoListChangeLogsResp {
  /**
   * 当前分页日志，按时间倒序
   * @uniqueItems false
   */
  changeLogs?: DtoChangeLogVO[];
  /** 符合筛选条件的日志总数 */
  total?: number;
}

export interface DtoListCourseCommentsResp {
  /**
   * 当前分页评论，按创建时间倒序
   * @uniqueItems false
   */
  comments?: DtoCommentVO[];
  /** 该课程未删除评论总数 */
  total?: number;
}

export interface DtoListCoursesReq {
  /** 页码，从1开始；小于1时按1处理 */
  page?: number;
  /** 每页数量，范围1-100；未传、非正数或超过100时按10处理 */
  pageSize?: number;
}

export interface DtoListCoursesResp {
  /**
   * 当前页的课程列表
   * @uniqueItems false
   */
  courses?: DtoCourseVO[];
  /** 页码，从1开始；小于1时按1处理 */
  page?: number;
  /** 每页数量，范围1-100；未传、非正数或超过100时按10处理 */
  pageSize?: number;
  /** 符合条件的总记录数 */
  total?: number;
}

export interface DtoListProposalLogsGroupedResp {
  /**
   * 当前分页提案及其最近一次管理员操作摘要
   * @uniqueItems false
   */
  proposals?: DtoProposalLogVO[];
  /** 提案总数 */
  total?: number;
}

export interface DtoListProposalLogsTimelineResp {
  /**
   * 当前分页时间线日志，严格按操作时间倒序
   * @uniqueItems false
   */
  logs?: DtoProposalTimelineLogVO[];
  /** 全部变更日志总数 */
  total?: number;
}

export interface DtoListProposalResp {
  /**
   * 当前分页提案列表，无结果时为空数组
   * @uniqueItems false
   */
  proposals?: DtoProposalVO[];
  /** 符合当前权限与筛选条件的提案总数 */
  total?: number;
}

export interface DtoProposalCourseVO {
  /**
   * 开设校区名称列表，至少一项且必须是系统已有校区，不允许由提案创建新校区
   * @uniqueItems false
   */
  campuses?: string[];
  /** 课程分类名称，不能为空；审批时可落库为新分类 */
  category?: string;
  /** 课程代码，可为空 */
  code?: string;
  /** 课程开课院系，不能为空；与教师所属院系是两个独立字段 */
  department?: string;
  /** 课程ID；创建提案时无需传入，finalCourse 返回正式课程时可能携带 */
  id?: string;
  /** 课程名称，去除首尾空白后不能为空 */
  name?: string;
  /**
   * 任课教师列表；每项姓名必填，id 为空表示新增教师，department 可为空
   * @uniqueItems false
   */
  teachers?: DtoTeacherVO[];
}

export interface DtoProposalLogVO {
  /** 最近一次管理员操作；尚无管理员操作时省略 */
  adminAction?: DtoAdminActionVO;
  /** 提案补充说明 */
  content?: string;
  /** 用户提交的课程快照 */
  course?: DtoProposalCourseVO;
  /** 提案创建者信息 */
  creator?: DtoCreatorVO;
  /** 提案ID */
  proposalId?: string;
  /** 当前提案状态 */
  status?: string;
  /** 提案标题 */
  title?: string;
}

export interface DtoProposalSnapshotVO {
  /** 提案课程分类 */
  category?: string;
  /** 提案课程名称 */
  courseName?: string;
  /** 提案课程开课院系 */
  department?: string;
  /** 提案标题 */
  title?: string;
}

export interface DtoProposalTimelineLogVO {
  /** 操作时间，格式 YYYY-MM-DD HH:mm:ss */
  actionTime?: string;
  /** CREATE/APPROVE/REJECT/DELETE/UPDATE/GRANT_ADMIN/REVOKE_ADMIN */
  actionType?: string;
  /** 额外操作信息；当前主要通过 content 返回日志正文 */
  details?: Record<string, any>;
  /** 变更日志ID */
  logId?: string;
  /** 操作者用户ID */
  operatorId?: string;
  /** 操作者昵称；未设置时回退为 OpenID */
  operatorName?: string;
  /** 关联提案ID；非提案操作时省略 */
  proposalId?: string;
  /** 能找到关联提案时返回当前提案摘要 */
  proposalSnapshot?: DtoProposalSnapshotVO;
}

export interface DtoProposalVO {
  /** 提案补充说明，可能为空 */
  content?: string;
  /** 本提案结算贡献值；仅创建者可见，其他用户响应中为 -1 */
  contribution?: number;
  /** 用户最初提交的课程内容，审批时不会被 finalCourse 覆盖 */
  course?: DtoProposalCourseVO;
  /** 提案创建时间 */
  createdAt?: string;
  /** 是否已被创建者软删除 */
  deleted?: boolean;
  /** 审批通过后的正式课程；历史/列表/筛选接口对已通过提案返回，详情接口仅创建者或管理员可见，课程已删除或查询失败时省略 */
  finalCourse?: DtoProposalCourseVO;
  /** 提案ID */
  id?: string;
  /** 当前登录用户在操作后或查询时是否已点赞 */
  like?: boolean;
  /** 目标当前点赞总数 */
  likeCnt?: number;
  /** 拒绝理由；未拒绝或未填写理由时为空 */
  rejectReason?: string;
  /** 是否允许公开展示创建者昵称 */
  showUsername?: boolean;
  /** 提案状态：pending 待审核、approved 已通过、rejected 已拒绝 */
  status?: string;
  /** 提案标题 */
  title?: string;
  /** 最近一次编辑或审批时间 */
  updatedAt?: string;
  /** 提案创建者用户ID；是否展示昵称由 showUsername 控制 */
  userId?: string;
}

export interface DtoRejectProposalReq {
  /** 提案ID，由 URL path 写入，请求体无需传 */
  proposalId?: string;
  /** 拒绝理由，可为空 */
  reason?: string;
}

export interface DtoRejectProposalResp {
  /** 操作后剩余待审核提案数量 */
  pendingCount?: number;
  /** 是否成功拒绝 */
  rejected?: boolean;
}

export interface DtoResubmitProposalReq {
  /** 新提案补充说明，可为空 */
  content?: string;
  /** 新提案的完整课程信息 */
  course: DtoProposalCourseVO;
  /** 是否允许公开展示新提案创建者昵称 */
  showUsername?: boolean;
  /** 新提案标题，不能为空 */
  title: string;
}

export interface DtoResubmitProposalResp {
  /** 已软删除的原拒绝提案ID */
  previousProposalId?: string;
  /** 新建后的完整待审核提案 */
  proposal?: DtoProposalVO;
  /** 新建待审核提案ID */
  proposalId?: string;
}

export interface DtoRevokeProposalReq {
  /** 必填；approve 撤回已通过提案，reject 撤回已拒绝提案 */
  actionType?: string;
}

export interface DtoRevokeProposalResp {
  /** 已恢复为 pending 的提案ID */
  proposalId?: string;
}

export interface DtoSearchHistoryVO {
  /** 最近一次搜索该关键词的时间 */
  createdAt?: string;
  /** 搜索历史记录ID */
  id?: string;
  /** 曾提交的非空课程搜索关键词 */
  query?: string;
}

export interface DtoSearchSuggestionsVO {
  /** 建议实体名称；教师建议仅为姓名，不包含职称 */
  name?: string;
  /** 点击后传给 /api/search 的精确搜索值；教师为无分隔的姓名+职称（职称为空时等于姓名），其他类型等于 name */
  searchValue?: string;
  /** 教师建议固定返回职称（历史教师无职称时为空字符串）；其他类型省略 */
  title?: string;
  /** 建议类型：course、teacher、category、department */
  type?: string;
}

export interface DtoSignInReq {
  /** 客户端认证标识，当前版本为兼容字段且仍需传入 */
  authId: string;
  /** 认证类型标识，当前登录流程使用微信临时登录凭证 */
  authType: string;
  /** 微信登录临时 code，用于换取 OpenID，不能为空 */
  verifyCode: string;
}

export interface DtoSignInResp {
  /** Bearer 访问令牌；已有令牌仍有效且无需续期时可能原样返回 */
  accessToken?: string;
  /** 访问令牌剩余有效秒数 */
  expiresIn?: number;
  /** 当前用户是否具有管理员权限 */
  isAdmin?: boolean;
  /** 当前用户ID；首次登录时自动创建用户 */
  userId?: string;
}

export interface DtoTeacherVO {
  /** 教师所属院系；提案场景允许为空，表示暂未维护 */
  department?: string;
  /** 教师ID；提案引用已有教师时传入，新教师可为空 */
  id?: string;
  /** 教师姓名 */
  name?: string;
  /** 教师职称 */
  title?: string;
}

export interface DtoToggleLikeReq {
  /** 点赞对象类型：proposal/comment */
  targetType: 'proposal' | 'comment';
}

export interface DtoToggleLikeResp {
  /** 当前登录用户在操作后或查询时是否已点赞 */
  like?: boolean;
  /** 目标当前点赞总数 */
  likeCnt?: number;
}

export interface DtoToggleProposalReq {
  /** 管理员最终确认的课程；省略、null 或空请求体时使用用户原始 course */
  finalCourse?: DtoProposalCourseVO;
  /** 提案ID，由 URL path 写入，请求体无需传 */
  proposalID?: string;
  /** 管理员确认的提案标题；省略、空字符串或纯空格时保留原标题 */
  title?: string;
}

export interface DtoToggleProposalResp {
  /** 是否成功通过提案 */
  proposal?: boolean;
  /** 操作后剩余待审核提案数量 */
  proposalCnt?: number;
}

export interface DtoUpdateProposalReq {
  /** 更新后的补充说明，当前接口要求非空 */
  content: string;
  /** 更新后的完整课程信息，不支持仅传部分字段 */
  course: DtoProposalCourseVO;
  /** 更新后的提案标题，不能为空 */
  title: string;
}

export interface DtoUpdateProposalResp {
  /** 更新成功的提案ID */
  proposalId?: string;
}

export interface DtoUpdateUserProfileReq {
  /** 省略或 null 保持不变；空字符串清空；服务端仅保存引用字符串，不上传或校验 URL */
  avatar?: string;
  /** 省略或 null 保持不变；空字符串清空；非空昵称会去除首尾空白并校验长度、控制字符、唯一性、30天冷却及微信内容审核 */
  username?: string;
}

export interface DtoUpdateUserProfileResp {
  /** 更新后的头像引用 */
  avatar?: string;
  /** 更新后的昵称 */
  username?: string;
}

export interface HandlerResponseDtoCreateCommentResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoCreateCommentResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoCreateProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoCreateProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoCreateTeacherResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoCreateTeacherResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoDeleteCommentResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoDeleteCommentResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoDeleteProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoDeleteProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetCourseCampusesResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetCourseCampusesResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetCourseCategoriesResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetCourseCategoriesResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetCourseDepartmentsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetCourseDepartmentsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetCourseResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetCourseResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetMyCommentsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetMyCommentsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetMyProposalsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetMyProposalsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetSearchHistoriesResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetSearchHistoriesResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetSearchSuggestionsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetSearchSuggestionsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetTeacherSuggestionsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetTeacherSuggestionsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetTotalCourseCommentsCountResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetTotalCourseCommentsCountResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetUserProfileResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetUserProfileResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGetUsernameByUserIDResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGetUsernameByUserIDResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoGrantAdminResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoGrantAdminResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoIsAdminResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoIsAdminResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListChangeLogsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListChangeLogsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListCourseCommentsResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListCourseCommentsResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListCoursesResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListCoursesResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListProposalLogsGroupedResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListProposalLogsGroupedResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListProposalLogsTimelineResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListProposalLogsTimelineResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoListProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoListProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoRejectProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoRejectProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoResubmitProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoResubmitProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoRevokeProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoRevokeProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoSignInResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoSignInResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoToggleLikeResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoToggleLikeResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoToggleProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoToggleProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoUpdateProposalResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoUpdateProposalResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

export interface HandlerResponseDtoUpdateUserProfileResp {
  /**
   * 业务代码, 0表示成功
   * @example 0
   */
  code?: number;
  /** 实际业务数据 */
  data?: DtoUpdateUserProfileResp;
  /**
   * 提示信息
   * @example "success"
   */
  msg?: string;
}

/* ---- original skin compatibility aliases (legacy swagger type names) ---- */
export type CommentVO = DtoCommentVO;
export type TeacherVO = DtoTeacherVO;
export interface Score {
  score: number;
  avg: number;
  percent: Record<number, number>;
}
