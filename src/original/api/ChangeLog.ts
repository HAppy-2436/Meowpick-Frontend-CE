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
  DtoListChangeLogsReq,
  HandlerResponseDtoListChangeLogsResp,
  HandlerResponseDtoListProposalLogsGroupedResp,
  HandlerResponseDtoListProposalLogsTimelineResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class ChangeLog<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 仅管理员可用。按可选目标类型和日志正文关键词分页查询全部变更记录，type 支持 course、proposal、teacher、user，keyword 使用大小写不敏感模糊匹配；两者为空时查询全部，结果按时间倒序
   *
   * @tags changeLog
   * @name ChangelogListCreate
   * @summary 分页查询变更记录
   * @request POST:/api/changelog/list
   * @secure
   */
  changelogListCreate = (data: DtoListChangeLogsReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoListChangeLogsResp, any>({
      path: `/api/changelog/list`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 仅管理员可用。以提案为分页单位返回提案原始内容、课程、创建者信息和最近一次管理员操作；同一提案存在多次审核、撤回或更新日志时 adminAction 只保留时间最新的一条，尚无管理员操作时省略
   *
   * @tags changeLog
   * @name ChangelogProposalGroupedList
   * @summary 按提案聚合的日志列表
   * @request GET:/api/changelog/proposal/grouped
   * @secure
   */
  changelogProposalGroupedList = (
    data: object,
    query?: {
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，默认20；大于100按10处理
       * @default 20
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoListProposalLogsGroupedResp, any>({
      path: `/api/changelog/proposal/grouped`,
      method: 'GET',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 仅管理员可用。以每次独立操作为一条记录分页返回全部变更日志，严格按操作时间倒序，包含操作者、标准化动作名、可选关联提案当前摘要及日志正文；管理员权限变更等非提案操作可能没有 proposalId 和 proposalSnapshot
   *
   * @tags changeLog
   * @name ChangelogProposalTimelineList
   * @summary 扁平化时间线日志
   * @request GET:/api/changelog/proposal/timeline
   * @secure
   */
  changelogProposalTimelineList = (
    data: object,
    query?: {
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 每页数量，默认20；大于100按10处理
       * @default 20
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoListProposalLogsTimelineResp, any>({
      path: `/api/changelog/proposal/timeline`,
      method: 'GET',
      query: query,
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
}
