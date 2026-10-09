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
  DtoGrantAdminReq,
  DtoSignInReq,
  HandlerResponseDtoGrantAdminResp,
  HandlerResponseDtoIsAdminResp,
  HandlerResponseDtoSignInResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Auth<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录用户凭服务端配置的管理员授权密钥切换指定用户的管理员状态：普通用户变为管理员，管理员再次操作则撤销权限。目标用户必须存在；操作会写入管理员变更日志。该接口不是“只授予不撤销”，响应 isAdmin 表示切换后的状态
   *
   * @tags auth
   * @name AuthGrantAdminCreate
   * @summary 切换管理员权限
   * @request POST:/api/auth/grant_admin
   * @secure
   */
  authGrantAdminCreate = (data: DtoGrantAdminReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGrantAdminResp, any>({
      path: `/api/auth/grant_admin`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 校验 Bearer 登录态并返回当前用户实时管理员状态；用户不存在或查询失败时返回用户查询错误
   *
   * @tags auth
   * @name AuthIsAdminList
   * @summary 是否管理员
   * @request GET:/api/auth/is_admin
   * @secure
   */
  authIsAdminList = (params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoIsAdminResp, any>({
      path: `/api/auth/is_admin`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 使用微信临时登录 code 换取 OpenID，查找或首次创建用户并返回 Bearer 访问令牌。请求若同时携带仍有效、属于同一用户且尚无需续期的令牌，服务端会复用原令牌；否则签发新令牌。authId 和 authType 当前为兼容必填字段，实际身份以 verifyCode 换取的 OpenID 为准
   *
   * @tags auth
   * @name AuthSignInCreate
   * @summary 登录
   * @request POST:/api/auth/sign_in
   */
  authSignInCreate = (data: DtoSignInReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoSignInResp, any>({
      path: `/api/auth/sign_in`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
}
