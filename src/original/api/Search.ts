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
  HandlerResponseDtoGetSearchHistoriesResp,
  HandlerResponseDtoGetSearchSuggestionsResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';

export class Search<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录后返回当前用户最近15条课程搜索历史，按最近搜索时间倒序。相同关键词会复用原记录并更新时间；搜索建议不会写入历史，只有提交非空课程搜索时才异步记录
   *
   * @tags search
   * @name SearchRecentList
   * @summary 获取最近搜索历史
   * @request GET:/api/search/recent
   * @secure
   */
  searchRecentList = (params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetSearchHistoriesResp, any>({
      path: `/api/search/recent`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后模糊匹配未删除课程名称，以及至少被一门未删除课程引用的教师、课程分类和课程开课院系。教师可按姓名、无分隔的“姓名+职称”或职称匹配；相同教师搜索值合并。结果按完全一致、前缀一致、子串一致排序；同一匹配等级内教师姓名命中优先于“姓名+职称”或职称命中，同分再按 course、teacher、category、department 稳定排序。每项 searchValue 均可直接作为 /api/search 的 keyword；教师项为无分隔的“姓名+职称”，职称为空时等于姓名，并另返回纯姓名 name 和职称 title。此接口不写入搜索历史
   *
   * @tags search
   * @name SearchSuggestList
   * @summary 获取搜索建议
   * @request GET:/api/search/suggest
   * @secure
   */
  searchSuggestList = (
    query: {
      /** 搜索关键词 */
      keyword: string;
      /**
       * 页码，小于1按1处理
       * @default 1
       */
      page?: number;
      /**
       * 最终建议条数上限，范围1-100，超出范围按10处理
       * @default 10
       */
      pageSize?: number;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetSearchSuggestionsResp, any>({
      path: `/api/search/suggest`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
}
