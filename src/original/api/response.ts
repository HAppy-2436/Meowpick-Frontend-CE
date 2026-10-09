import type { AxiosResponse } from "axios";

/**
 * 兼容新旧后端响应结构
 *
 * - 旧后端：{ code, msg, data: {...} }   → 业务字段位于 res.data.data
 * - 新后端 2.0：{ code, msg, proposalId, proposal: {...} }（扁平）
 *
 * 策略：把所有"扁平"业务响应统一包装回嵌套形态 `{ code, msg, data }`，
 * 上层调用继续用 `res.data.data.xxx` 读取，零侵入。
 *
 * 判别规则（按优先级）：
 *   1) 已是嵌套结构（存在 `data` 字段且为对象） → 原样返回
 *   2) 含 code/msg 或 proposalId/proposal 等业务键 → 视为业务响应，
 *      将业务字段合并成 `data` 对象
 *   3) 非业务响应（纯字符串 / 数组 / null） → 原样返回
 */
export function normalizeResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  const body = response?.data;
  if (body === null || body === undefined) return response;
  if (typeof body !== "object") return response;
  if (Array.isArray(body)) return response;

  const obj = body as Record<string, any>;

  if (obj.data !== undefined && typeof obj.data === "object") {
    return response;
  }

  const looksLikeBusiness =
    typeof obj.code === "number" ||
    typeof obj.code === "string" ||
    "msg" in obj ||
    "proposalId" in obj ||
    "proposal" in obj;
  if (!looksLikeBusiness) return response;

  const { code = 0, msg = "success", ...rest } = obj;
  const data: Record<string, any> = {};
  const knownBusinessKeys = [
    "proposal",
    "proposals",
    "course",
    "courses",
    "comment",
    "comments",
    "proposalId",
    "proposalCnt",
    "pendingCount",
    "rejected",
    "deleted",
    "deletedAt",
    "operatorId",
    "accessToken",
    "expiresIn",
    "isAdmin",
    "userId",
    "username",
    "avatar",
    "contribution",
    "dailyQuota",
    "dailyQuotaLimit",
    "canEditUsername",
    "total",
    "suggestions",
    "histories",
    "campuses",
    "categories",
    "departments",
    "teachers",
    "changeLogs",
    "logs",
    "like",
    "likeCnt"
  ];
  let hasBusinessField = false;
  for (const key of knownBusinessKeys) {
    if (key in rest) {
      data[key] = rest[key];
      hasBusinessField = true;
    }
  }
  if (!hasBusinessField && rest.proposalId !== undefined) {
    data.proposalId = rest.proposalId;
  }

  return { ...response, data: { code, msg, data } as unknown as T };
}
