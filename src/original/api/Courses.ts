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

import type { DtoListCoursesReq, HandlerResponseDtoListCoursesResp } from "./data-contracts";
import type { HttpClient, RequestParams } from "./http-client";
import { ContentType } from "./http-client";

export class Courses<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 搜索课程列表
   *
   * @tags courses
   * @name SearchCreate
   * @summary 搜索课程列表
   * @request POST:/api/search
   */
  searchCreate = (body: DtoListCoursesReq, params: RequestParams = {}) =>
    this.http.request<JsonRet<HandlerResponseDtoListCoursesResp>, any>({
      path: `/api/search`,
      method: "POST",
      body: body,
      type: ContentType.Json,
      format: "json",
      ...params
    });
}
