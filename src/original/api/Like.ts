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

import type { DtoToggleLikeReq, HandlerResponseDtoToggleLikeResp } from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Like<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录用户切换指定未删除提案或评论的点赞状态：未点赞时新增，已点赞时取消。path 中 likeId 是目标ID，请求体 targetType 必须是 proposal 或 comment；目标不存在、已删除或类型非法时拒绝且不会产生悬空点赞。响应返回操作后的点赞状态与最新总数
   *
   * @tags like
   * @name LikeCreate
   * @summary 点赞 / 取消点赞
   * @request POST:/api/like/{likeId}
   * @secure
   */
  likeCreate = (likeId: string, data: DtoToggleLikeReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoToggleLikeResp, any>({
      path: `/api/like/${likeId}`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
}
