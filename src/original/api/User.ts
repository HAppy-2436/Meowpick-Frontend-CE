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
  DtoUpdateUserProfileReq,
  HandlerResponseDtoGetUserProfileResp,
  HandlerResponseDtoGetUsernameByUserIDResp,
  HandlerResponseDtoUpdateUserProfileResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class User<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 返回当前登录用户的昵称、头像引用、累计贡献值、按中国时区自然日统计的今日提案使用量、按贡献值等级计算的每日上限，以及当前能否设置或修改非空昵称。昵称未设置和头像未设置均返回空字符串
   *
   * @tags user
   * @name UserProfileList
   * @summary 获取当前用户资料
   * @request GET:/api/user/profile
   * @secure
   */
  userProfileList = (params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetUserProfileResp, any>({
      path: `/api/user/profile`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 原子更新当前登录用户的昵称和头像，任一字段校验、微信审核或写入失败时两者都不改变。字段省略或为 null 表示保持原值，空字符串表示清空且不调用审核。非空昵称去除首尾空白后最多15个 Unicode 字符，不允许控制字符、不得与其他用户昵称重复，设置或改名后30天内不能再次设置非空昵称，并且只有微信内容审核返回 pass 才保存；review/risky 返回业务码 111000001，微信审核不可用返回 111000002。所有业务错误仍使用 HTTP 200 并返回 code、msg、data=null。清空昵称不受冷却限制。头像仅保存引用字符串，不负责上传、下载或 URL 格式校验
   *
   * @tags user
   * @name UserProfileUpdateCreate
   * @summary 更新当前用户资料
   * @request POST:/api/user/profile/update
   * @secure
   */
  userProfileUpdateCreate = (data: DtoUpdateUserProfileReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoUpdateUserProfileResp, any>({
      path: `/api/user/profile/update`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后查询指定用户昵称。查询本人或管理员查询任意用户时无需 proposalId；普通用户跨用户查询必须提供属于目标用户且 showUsername=true 的未删除提案ID，否则拒绝，避免绕过匿名提案设置。目标用户尚未设置昵称时成功返回空字符串
   *
   * @tags user
   * @name UserUsernameDetail
   * @summary 根据用户 ID 获取昵称
   * @request GET:/api/user/{userId}/username
   * @secure
   */
  userUsernameDetail = (
    userId: string,
    query?: {
      /** 跨用户查询时必填，且该提案必须允许展示昵称；本人和管理员可省略 */
      proposalId?: string;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetUsernameByUserIDResp, any>({
      path: `/api/user/${userId}/username`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
}
