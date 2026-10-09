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
  DtoCreateCommentReq,
  DtoGetMyCommentsReq,
  HandlerResponseDtoCreateCommentResp,
  HandlerResponseDtoDeleteCommentResp,
  HandlerResponseDtoGetMyCommentsResp,
  HandlerResponseDtoGetTotalCourseCommentsCountResp,
  HandlerResponseDtoListCourseCommentsResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Comment<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录用户对指定正式课程发布评论。content 去除首尾空白后须为 1 至 140 个 Unicode 字符；tags 可省略或为空数组，最多 4 个、不可重复，只允许：容易、硬核、避雷、推荐、严格、快跑、幽默、枯燥。通过本地校验后，每个用户每 60 秒最多发起 10 次微信内容审核；只有微信返回 pass 才写入并公开，review/risky 返回业务码 111000001，微信审核不可用返回 111000002，超过频率返回 111000003。所有业务错误仍使用 HTTP 200 并返回 code、msg、data=null。成功响应包含新评论ID、发布时间以及当前点赞状态；课程详情的 tagCount 从未删除评论标签实时聚合
   *
   * @tags comment
   * @name CommentAddCreate
   * @summary 发布课程评论
   * @request POST:/api/comment/add
   * @secure
   */
  commentAddCreate = (data: DtoCreateCommentReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoCreateCommentResp, any>({
      path: `/api/comment/add`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后分页获取当前用户发布的未删除评论，按创建时间倒序返回。每条记录包含当前点赞状态和对应未删除课程的名称、分类、开课院系及教师姓名职称信息
   *
   * @tags comment
   * @name CommentHistoryCreate
   * @summary 获取我的评论历史
   * @request POST:/api/comment/history
   * @secure
   */
  commentHistoryCreate = (data: DtoGetMyCommentsReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetMyCommentsResp, any>({
      path: `/api/comment/history`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后分页查询指定课程的未删除评论，按创建时间倒序返回，并为每条评论附带当前用户是否点赞及最新点赞总数。新调用使用 courseId；服务端仍兼容旧 query 参数 id，但旧参数不展示在 Swagger 中
   *
   * @tags comment
   * @name CommentQueryList
   * @summary 分页获取课程评论
   * @request GET:/api/comment/query
   * @secure
   */
  commentQueryList = (
    query: {
      /** 课程ID */
      courseId: string;
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
    this.http.request<HandlerResponseDtoListCourseCommentsResp, any>({
      path: `/api/comment/query`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录用户按 path 中的评论ID软删除自己发布且尚未删除的评论。不能删除他人的评论；为避免泄露评论归属，不存在、已删除或不属于当前用户均返回“评论不存在”。删除与相关点赞清理在同一事务中完成，成功后该评论不再出现在课程评论、个人评论历史、标签统计和评论总数中
   *
   * @tags comment
   * @name CommentDeleteCreate
   * @summary 删除自己的评论
   * @request POST:/api/comment/{commentId}/delete
   * @secure
   */
  commentDeleteCreate = (commentId: string, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoDeleteCommentResp, any>({
      path: `/api/comment/${commentId}/delete`,
      method: 'POST',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后获取系统中所有未删除课程评论总数。服务端优先读取短期缓存，缓存不可用或未命中时查询数据库并回填；已随课程撤回而软删除的评论不计入
   *
   * @tags comment
   * @name SearchTotalList
   * @summary 获取吐槽总数
   * @request GET:/api/search/total
   * @secure
   */
  searchTotalList = (params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetTotalCourseCommentsCountResp, any>({
      path: `/api/search/total`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
}
