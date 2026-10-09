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

import type {
  DtoCreateProposalReq,
  DtoGetProposalFieldSuggestionsResp,
  DtoRejectProposalReq,
  DtoResubmitProposalReq,
  DtoRevokeProposalReq,
  DtoToggleProposalReq,
  DtoUpdateProposalReq,
  HandlerResponseDtoCreateProposalResp,
  HandlerResponseDtoDeleteProposalResp,
  HandlerResponseDtoGetMyProposalsResp,
  HandlerResponseDtoGetProposalResp,
  HandlerResponseDtoListProposalResp,
  HandlerResponseDtoRejectProposalResp,
  HandlerResponseDtoResubmitProposalResp,
  HandlerResponseDtoRevokeProposalResp,
  HandlerResponseDtoToggleProposalResp,
  HandlerResponseDtoUpdateProposalResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Proposal<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录用户创建待审核课程提案。标题、课程名称、课程开课院系、课程分类及至少一个已有校区必填，课程代码和补充说明可空；教师列表可为空，教师项姓名必填，id 有值时复用已有教师、为空时审批通过后创建新教师，教师 department 可为空且不会用课程开课院系推断。系统还会检查同课程重复提案、已有课程及当前用户每日额度
   *
   * @tags proposal
   * @name ProposalAddCreate
   * @summary 新增提案
   * @request POST:/api/proposal/add
   * @secure
   */
  proposalAddCreate = (data: DtoCreateProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoCreateProposalResp, any>({
      path: `/api/proposal/add`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后获取提案表单字段建议。department、category、campus 从当前映射名称中匹配；courseName、courseCode 从未删除课程中分页搜索；teacherName 可按姓名、无分隔的“姓名+职称”或职称模糊匹配，相同搜索值合并并按相关度排序，返回独立的 name(value)、title 和展示 label，每项额外返回所有重复教师记录合并后的最近两门未删除课程。未知 field 返回无效字段错误
   *
   * @tags proposal
   * @name ProposalFieldSuggestionsList
   * @summary 获取提案字段建议
   * @request GET:/api/proposal/field-suggestions
   * @secure
   */
  proposalFieldSuggestionsList = (
    query: {
      /** 字段类型: department/category/campus/courseName/courseCode/teacherName */
      field: string;
      /** 搜索关键词 */
      keyword: string;
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，范围1-100，超出范围按10处理
       * @default 10
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<JsonRet<DtoGetProposalFieldSuggestionsResp>, any>({
      path: `/api/proposal/field-suggestions`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后获取当前用户的完整提案历史，包含 pending、approved、rejected 及已软删除提案，按创建时间倒序分页。updatedAt 是最近一次编辑或审批时间；已通过提案附带关联正式课程 finalCourse，课程查询失败或已删除时省略。此接口中 contribution 对创建者可见
   *
   * @tags proposal
   * @name ProposalHistoryList
   * @summary 获取我的提案
   * @request GET:/api/proposal/history
   * @secure
   */
  proposalHistoryList = (
    query?: {
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，范围1-100，超出范围按10处理
       * @default 10
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetMyProposalsResp, any>({
      path: `/api/proposal/history`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后分页查询提案。管理员可按 status 查询 pending、approved、rejected，不传 status 时查询全部；普通用户无论传什么 status 都只返回 approved。返回的 contribution 仅提案创建者可见，其他用户看到 -1；已通过提案附带关联正式课程 finalCourse，课程查询失败或已删除时省略
   *
   * @tags proposal
   * @name ProposalListList
   * @summary 分页获取提案列表
   * @request GET:/api/proposal/list
   * @secure
   */
  proposalListList = (
    query?: {
      /** 提案状态：pending/approved/rejected；管理员不传时查询全部，普通用户传值会被忽略 */
      status?: string;
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，范围1-100，超出范围按10处理
       * @default 10
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoListProposalResp, any>({
      path: `/api/proposal/list`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后按提案标题关键词、状态、校区、课程开课院系和课程分类组合筛选提案。keyword 对提案原始 title 进行大小写不敏感模糊匹配；status 与 campus 支持重复 query 参数或 JSON 数组字符串；普通用户的状态条件固定为 approved。校区必须是系统已有名称，院系和分类按名称精确匹配；所有条件均为空时管理员查询全部、普通用户查询全部已通过提案；已通过提案附带关联正式课程 finalCourse，课程查询失败或已删除时省略
   *
   * @tags proposal
   * @name ProposalSuggestList
   * @summary 分页搜索并筛选提案列表
   * @request GET:/api/proposal/suggest
   * @secure
   */
  proposalSuggestList = (
    query?: {
      /** 提案标题普通文本模糊搜索关键词，正则特殊字符按字面值处理 */
      keyword?: string;
      /** 提案状态，可多选，不传则不按状态过滤 */
      status?: string[];
      /** 校区，可多选，不传则不按校区过滤 */
      campus?: string[];
      /** 开课院系，精确匹配 */
      department?: string;
      /** 课程分类，精确匹配 */
      category?: string;
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，范围1-100，超出范围按10处理
       * @default 10
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoListProposalResp, any>({
      path: `/api/proposal/suggest`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后根据提案ID查询完整信息及当前用户点赞状态。approved 提案所有登录用户可见；pending/rejected 提案仅创建者和管理员可见，其他用户按提案不存在处理；已删除提案仅创建者本人可见。contribution 仅创建者可见。已通过提案的 finalCourse 仅创建者或管理员可见，关联正式课程已删除或查询失败时省略
   *
   * @tags proposal
   * @name ProposalDetail
   * @summary 获取提案详情
   * @request GET:/api/proposal/{proposalId}
   * @secure
   */
  proposalDetail = (proposalId: string, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetProposalResp, any>({
      path: `/api/proposal/${proposalId}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 管理员将 pending 提案审批为 approved，并在同一数据库事务内处理可选标题修改、映射、教师、正式课程、贡献值及操作日志。title 传入非空文本时会去除首尾空白并更新提案标题，省略或空白时保留原标题。finalCourse 可省略、传 null，或直接使用空请求体，此时以用户原始 course 为准；传入时以管理员确认内容创建或恢复正式课程，但不覆盖提案原始 course。已有教师传 id 后直接复用；id 为空则创建新教师，department 可为空并保存为未维护状态，不创建空院系映射，也不从课程开课院系推断
   *
   * @tags proposal
   * @name ProposalApproveCreate
   * @summary 审批提案
   * @request POST:/api/proposal/{proposalId}/approve
   * @secure
   */
  proposalApproveCreate = (proposalId: string, data: DtoToggleProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoToggleProposalResp, any>({
      path: `/api/proposal/${proposalId}/approve`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录用户按 path 中的提案ID执行软删除，请求体可为空。仅提案创建者本人可删除自己的 pending 或 rejected 提案，管理员也不能代删；approved 提案不能删除。软删除后创建者仍可在个人提案历史中查看
   *
   * @tags proposal
   * @name ProposalDeleteCreate
   * @summary 删除提案
   * @request POST:/api/proposal/{proposalId}/delete
   * @secure
   */
  proposalDeleteCreate = (proposalId: string, data: object, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoDeleteProposalResp, any>({
      path: `/api/proposal/${proposalId}/delete`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 管理员操作：将状态为 pending（待审核）的提案变更为 rejected（已拒绝） 使用场景：课程提案审核流程中，管理员认为提案不符合要求，驳回该提案 注意事项： - 仅管理员可操作（需先调用 /api/auth/is_admin 确认权限） - 仅状态为 pending 的提案可以拒绝，已 approved/rejected 的提案无法再次操作 - 拒绝后不会创建课程记录，仅更新提案状态
   *
   * @tags proposal
   * @name ProposalRejectCreate
   * @summary 拒绝提案
   * @request POST:/api/proposal/{proposalId}/reject
   * @secure
   */
  proposalRejectCreate = (proposalId: string, data: DtoRejectProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoRejectProposalResp, any>({
      path: `/api/proposal/${proposalId}/reject`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录用户重新提交自己未删除的 rejected 提案。请求必须携带完整的新提案内容；后端在同一 MongoDB 事务内软删除原提案并创建新的 pending 提案，同时执行课程防重和每日额度检查。任一步失败时原提案保持未删除且不会创建新提案
   *
   * @tags proposal
   * @name ProposalResubmitCreate
   * @summary 重新提交被拒绝提案
   * @request POST:/api/proposal/{proposalId}/resubmit
   * @secure
   */
  proposalResubmitCreate = (proposalId: string, data: DtoResubmitProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoResubmitProposalResp, any>({
      path: `/api/proposal/${proposalId}/resubmit`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 管理员把已通过或已拒绝提案恢复为 pending。actionType=approve 仅适用于 approved：事务内软删除提案关联课程和评论、删除相关评论点赞、扣回已结算贡献值，并清理无引用的教师、分类和院系；教师仍被未删除课程或提案通过 teacherId 引用时保留，分类仍被未删除课程引用时保留，院系仍被未删除课程或正式教师引用时保留。提案中的院系和分类是名称文本，不计作映射引用。actionType=reject 仅适用于 rejected：清空拒绝理由。状态与 actionType 不匹配时拒绝操作
   *
   * @tags proposal
   * @name ProposalRevokeCreate
   * @summary 撤回提案操作
   * @request POST:/api/proposal/{proposalId}/revoke
   * @secure
   */
  proposalRevokeCreate = (proposalId: string, data: DtoRevokeProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoRevokeProposalResp, any>({
      path: `/api/proposal/${proposalId}/revoke`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 管理员更新 pending 提案的标题、补充说明和完整课程信息；已通过、已拒绝或已删除提案不能更新。请求必须提交完整 course，教师规则与创建提案一致：姓名必填，id 为空表示新教师，department 可为空
   *
   * @tags proposal
   * @name ProposalUpdateCreate
   * @summary 更新提案内容
   * @request POST:/api/proposal/{proposalId}/update
   * @secure
   */
  proposalUpdateCreate = (proposalId: string, data: DtoUpdateProposalReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoUpdateProposalResp, any>({
      path: `/api/proposal/${proposalId}/update`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
}
