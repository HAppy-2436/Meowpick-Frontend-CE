export const CONTENT_REVIEW_CODES = {
  NOT_COMPLIANT: 111000001,
  SERVICE_UNAVAILABLE: 111000002,
  TOO_MANY_REQUESTS: 111000003
} as const;

export type ReviewedContentType = 'comment' | 'username';

type BusinessResponse = {
  code?: number | string;
  msg?: string;
  status?: string;
  reviewStatus?: string;
  auditStatus?: string;
  suggest?: string;
  result?: Record<string, any> | null;
  data?: any;
};

function normalizeStatus(response: BusinessResponse): string {
  const data = response.data || {};
  const result = response.result || data.result || {};
  return String(
    response.reviewStatus ||
    response.auditStatus ||
    response.status ||
    response.suggest ||
    data.reviewStatus ||
    data.auditStatus ||
    data.status ||
    data.suggest ||
    result.reviewStatus ||
    result.auditStatus ||
    result.status ||
    result.suggest ||
    ''
  ).trim().toLowerCase();
}

function contentName(type: ReviewedContentType): string {
  return type === 'username' ? '昵称' : '吐槽内容';
}

/**
 * 业务错误也使用 HTTP 200，调用方必须同时检查 code 和微信审核状态。
 * 返回 null 表示成功；返回字符串表示应保留用户输入并展示错误。
 */
export function getContentReviewError(
  response: BusinessResponse | null | undefined,
  type: ReviewedContentType,
  fallback: string
): string | null {
  if (!response) return fallback;

  const code = Number(response.code);
  const status = normalizeStatus(response);
  const name = contentName(type);

  // 当前没有人工复核流程，因此 review、reject/risky 都直接视为不合规。
  if (status && status !== 'pass') {
    if (status === 'review' || status === 'reject' || status === 'risky') {
      return `${name}未通过内容安全审核，请修改后重试`;
    }
    return `${name}暂未通过内容安全审核，请修改后重试`;
  }

  if (code === 0 && (!status || status === 'pass')) return null;
  if (code === CONTENT_REVIEW_CODES.NOT_COMPLIANT) {
    return `${name}未通过内容安全审核，请修改后重试`;
  }
  if (code === CONTENT_REVIEW_CODES.SERVICE_UNAVAILABLE) {
    return '内容审核服务暂时不可用，请稍后重试';
  }
  if (code === CONTENT_REVIEW_CODES.TOO_MANY_REQUESTS) {
    return '内容审核请求过于频繁，请稍后再试';
  }

  // 未识别的后端错误使用前端文案，避免把服务端异常或字段信息直接展示给用户。
  return fallback;
}

export function hasControlCharacters(value: string): boolean {
  return /[\u0000-\u001f\u007f-\u009f]/u.test(value);
}
