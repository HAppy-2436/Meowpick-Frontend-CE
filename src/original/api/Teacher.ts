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
  DtoCreateTeacherReq,
  HandlerResponseDtoCreateTeacherResp,
  HandlerResponseDtoGetTeacherSuggestionsResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Teacher<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 管理员独立创建正式教师。此接口的姓名、职称和所属院系均必填；与提案审批自动创建教师不同，独立创建教师不接受空院系。院系名称不存在时会创建并持久化对应映射
   *
   * @tags teacher
   * @name TeacherAddCreate
   * @summary 新建教师
   * @request POST:/api/teacher/add
   * @secure
   */
  teacherAddCreate = (data: DtoCreateTeacherReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoCreateTeacherResp, any>({
      path: `/api/teacher/add`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 已弃用，当前前端未调用且不再扩展搜索规则；提案教师建议请使用 /api/proposal/field-suggestions?field=teacherName，全局搜索建议请使用 /api/search/suggest
   *
   * @tags teacher
   * @name TeacherSuggestList
   * @summary 获取教师搜索建议（已弃用）
   * @request GET:/api/teacher/suggest
   * @deprecated
   * @secure
   */
  teacherSuggestList = (
    query: {
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
    this.http.request<HandlerResponseDtoGetTeacherSuggestionsResp, any>({
      path: `/api/teacher/suggest`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
}
