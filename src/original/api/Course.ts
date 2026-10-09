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
  DtoListCoursesReq,
  HandlerResponseDtoGetCourseCampusesResp,
  HandlerResponseDtoGetCourseCategoriesResp,
  HandlerResponseDtoGetCourseDepartmentsResp,
  HandlerResponseDtoGetCourseResp,
  HandlerResponseDtoListCoursesResp
} from './data-contracts';
import type { HttpClient, RequestParams } from './http-client';
import { ContentType } from './http-client';

export class Course<SecurityDataType = unknown> {
  private http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * @description 登录后按完整课程名称精确匹配所有未删除同名课程，返回这些课程涉及的去重开设校区名称；没有同名课程时返回空数组，历史映射缺失时可能返回“未知校区”
   *
   * @tags course
   * @name CourseCampusesList
   * @summary 获取课程开课校区
   * @request GET:/api/course/campuses
   * @secure
   */
  courseCampusesList = (
    query: {
      /** 课程名称关键词 */
      keyword: string;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetCourseCampusesResp, any>({
      path: `/api/course/campuses`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后按完整课程名称精确匹配所有未删除同名课程，返回这些课程涉及的去重课程分类名称；没有同名课程时返回空数组，历史映射缺失时可能返回“未知分类”
   *
   * @tags course
   * @name CourseCategoriesList
   * @summary 获取课程分类
   * @request GET:/api/course/categories
   * @secure
   */
  courseCategoriesList = (
    query: {
      /** 课程名称关键词 */
      keyword: string;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetCourseCategoriesResp, any>({
      path: `/api/course/categories`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后按完整课程名称精确匹配所有未删除同名课程，返回这些课程涉及的去重开课院系名称；没有同名课程时返回空数组，历史映射缺失时可能返回“未知开课院系”
   *
   * @tags course
   * @name CourseDepartmentsList
   * @summary 获取课程开课院系
   * @request GET:/api/course/departments
   * @secure
   */
  courseDepartmentsList = (
    query: {
      /** 课程名称关键词 */
      keyword: string;
    },
    params: RequestParams = {}
  ) =>
    this.http.request<HandlerResponseDtoGetCourseDepartmentsResp, any>({
      path: `/api/course/departments`,
      method: 'GET',
      query: query,
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后按课程ID获取未被软删除的正式课程，包含课程分类、开课院系、校区、教师、评论标签统计，以及可选的来源提案贡献者信息。课程由匿名提案创建时 contributor 仅返回 proposalId 和 showUsername=false，不返回用户身份
   *
   * @tags course
   * @name CourseDetail
   * @summary 获取课程信息
   * @request GET:/api/course/{courseId}
   * @secure
   */
  courseDetail = (courseId: string, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoGetCourseResp, any>({
      path: `/api/course/${courseId}`,
      method: 'GET',
      secure: true,
      format: 'json',
      ...params
    });
  /**
   * @description 登录后分页搜索未删除课程。type=course 时按课程名称大小写不敏感模糊匹配；type=teacher 时 keyword 精确接受教师姓名或无分隔的“姓名+职称”，姓名命中返回所有同名教师课程的并集，姓名+职称命中返回所有同名同职称教师课程的并集；不接受姓名与职称间的空格或连字符。type=category 或 department 时按映射完整名称精确匹配。未知 type 返回参数错误。非空 keyword 会异步写入当前用户搜索历史，重复关键词更新时间且仅保留最近15条
   *
   * @tags course
   * @name SearchCreate
   * @summary 搜索课程列表
   * @request POST:/api/search
   * @secure
   */
  searchCreate = (data: DtoListCoursesReq, params: RequestParams = {}) =>
    this.http.request<HandlerResponseDtoListCoursesResp, any>({
      path: `/api/search`,
      method: 'POST',
      body: data,
      secure: true,
      type: ContentType.Json,
      format: 'json',
      ...params
    });
}
