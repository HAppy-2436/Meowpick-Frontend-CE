export type ProposalOperation =
  | 'create'
  | 'resubmit'
  | 'approve'
  | 'reject'
  | 'revoke'
  | 'delete'
  | 'detail';

const DEFAULT_MESSAGES: Record<ProposalOperation, string> = {
  create: '提案提交失败，请稍后重试',
  resubmit: '提案重新提交失败，请稍后重试',
  approve: '提案审批失败，请稍后重试',
  reject: '提案驳回失败，请稍后重试',
  revoke: '提案撤回失败，请稍后重试',
  delete: '提案删除失败，请稍后重试',
  detail: '获取提案信息失败，请稍后重试'
};

function errorText(source: any): string {
  const response = source?.response?.data;
  return [
    source?.msg,
    source?.message,
    source?.errMsg,
    response?.msg,
    response?.message,
    typeof source === 'string' ? source : ''
  ].filter(Boolean).join(' ').toLowerCase();
}

function statusCode(source: any): number {
  const status = source?.response?.status ?? source?.status;
  const code = Number(status || source?.code);
  return Number.isFinite(code) ? code : 0;
}

/**
 * 将后端错误归类为前端维护的用户提示，绝不直接向用户展示后端原文。
 */
export function getProposalErrorMessage(source: unknown, operation: ProposalOperation): string {
  const text = errorText(source);
  const status = statusCode(source);

  if (status === 401 || /(unauthori|token|session|登录|会话).*(invalid|expired|无效|过期)/.test(text)) {
    return '登录状态已失效，请重新进入小程序后再试';
  }
  if (status === 403 || /(forbidden|permission|无权限|权限不足)/.test(text)) {
    return '当前账号无权执行此操作';
  }
  if (status === 404 || /(not found|不存在|未找到)/.test(text)) {
    return operation === 'detail' ? '未找到该提案' : '该提案不存在或已被删除';
  }
  if (/(network error|request:fail|网络|连接异常)/.test(text)) {
    return '网络连接异常，请检查网络后重试';
  }
  if (/(timeout|超时)/.test(text)) {
    return '请求超时，请稍后重试';
  }
  if (/(daily|today|quota|maximum|exceed|max|每日|今日|额度|上限)/.test(text)
      && /(proposal|submit|create|quota|limit|提案|提交|次数|额度)/.test(text)) {
    return '今日提案提交次数已达上限，请明天再试';
  }
  if (status === 429 || /(too many|frequent|频繁)/.test(text)) {
    return '操作过于频繁，请稍后再试';
  }
  if (/(category|课程分类|课程类别)/.test(text)) {
    return '请选择课程类别';
  }
  if (/(department|开课院系|课程院系)/.test(text)) {
    return '请选择开课院系';
  }
  if (/(campus|校区)/.test(text)) {
    return '所选校区不可用，请重新选择';
  }
  if (/(teacher|教师)/.test(text)) {
    return '教师信息填写不完整，请检查后重试';
  }
  if (/(course.*(already|exist)|already.*course|课程.*(已存在|已经存在|已收录))/.test(text)) {
    return '该课程已被收录，无需重复提交';
  }
  if (/(duplicate|already.*proposal|重复提案|已有.*提案|提案.*已存在)/.test(text)) {
    return '该课程已有相关提案，请勿重复提交';
  }
  if (/(course.?name|title|课程名称|提案标题)/.test(text)) {
    return '请输入有效的课程名称';
  }
  if (operation === 'resubmit' && /(status|state|rejected|状态|驳回)/.test(text)) {
    return '只有被驳回的提案可以重新提交';
  }
  if (status === 400 || status === 422 || /(invalid|validation|参数|校验)/.test(text)) {
    return '提案信息填写有误，请检查后重试';
  }
  if (status >= 500) {
    return '服务暂时不可用，请稍后重试';
  }

  return DEFAULT_MESSAGES[operation];
}
