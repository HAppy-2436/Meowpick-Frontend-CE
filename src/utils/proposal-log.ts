import type {
  DtoProposalSnapshotVO,
  DtoProposalTimelineLogVO
} from '@/api/data-contracts';
import { parseBackendTime } from '@/utils/time';

/** 统一日志条目：时间线接口字段最全，变更列表接口仅补充 content/typeLabel */
export interface LogItem extends DtoProposalTimelineLogVO {
  content?: string;
  typeLabel?: string;
  targetId?: string;
}

export interface ProposalLogGroup {
  key: string;
  proposalId?: string;
  typeLabel?: string;
  logs: LogItem[];
}

export const ACTION_TEXT: Record<string, string> = {
  CREATE: '发起提案',
  APPROVE: '通过',
  REJECT: '拒绝',
  DELETE: '撤回',
  UPDATE: '修改',
  GRANT_ADMIN: '授权管理员',
  REVOKE_ADMIN: '撤销管理员',
  UNKNOWN: '撤回'
};

const ACTION_TONE: Record<string, string> = {
  CREATE: 'info',
  APPROVE: 'success',
  REJECT: 'danger',
  DELETE: 'warning',
  UPDATE: 'info',
  GRANT_ADMIN: 'success',
  REVOKE_ADMIN: 'warning',
  UNKNOWN: 'info'
};

export const actionTextOf = (type?: string) =>
  (type && ACTION_TEXT[type.toUpperCase()]) || type || '操作';

/**
 * 解析单条日志的动作文案。
 *
 * 后端把「用户撤回提案」与「管理员撤回审批」都记为 DELETE，时间线 DTO 也不含
 * 操作来源字段，因此需要传入提案创建者 id 才能区分：
 *   - 操作者 === 创建者 → 撤回提案
 *   - 操作者 !== 创建者 → 撤回审批
 * 取不到创建者 id（如分页中缺少 CREATE 日志）时回退为中性「撤回」。
 */
export const actionTextForLog = (
  log: Pick<LogItem, 'actionType' | 'operatorId'>,
  creatorId?: string
): string => {
  const type = (log.actionType || '').toUpperCase();
  if (type === 'DELETE' || type === 'UNKNOWN') {
    if (creatorId && log.operatorId) {
      return log.operatorId === creatorId ? '撤回提案' : '撤回审批';
    }
    return '撤回';
  }
  return actionTextOf(log.actionType);
};

export const actionToneOf = (type?: string) =>
  (type && ACTION_TONE[type.toUpperCase()]) || 'neutral';

/**
 * 日志正文（操作说明 / 拒绝理由）。
 *
 * 时间线接口把正文放在 `details.content`；旧版曾用顶层 `content` 或
 * `details.reason`，这里一并兼容，便于展示与关键词搜索。
 */
export const logContentOf = (
  log: Pick<LogItem, 'content' | 'details'>
): string => {
  const value = log.details?.reason ?? log.details?.content ?? log.content;
  return typeof value === 'string' ? value : '';
};

export const parseLogTime = (value?: string): number => {
  const date = parseBackendTime(value);
  return date ? date.getTime() : 0;
};

export const formatLogTime = (value?: string): string => {
  if (!value) return '—';
  const date = parseBackendTime(value);
  if (!date) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

export const snapshotOf = (
  group: ProposalLogGroup
): DtoProposalSnapshotVO | undefined =>
  group.logs.find((log) => log.proposalSnapshot)?.proposalSnapshot;

export const latestOf = (group: ProposalLogGroup): LogItem | undefined =>
  group.logs[group.logs.length - 1];

export const groupLogs = (logs: LogItem[]): ProposalLogGroup[] => {
  const map = new Map<string, ProposalLogGroup>();
  logs.forEach((log, index) => {
    const key =
      log.proposalId || log.targetId || log.logId || `orphan-${index}`;
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        proposalId: log.proposalId,
        typeLabel: log.typeLabel,
        logs: []
      };
      map.set(key, group);
    }
    if (!group.typeLabel && log.typeLabel) group.typeLabel = log.typeLabel;
    group.logs.push(log);
  });
  const groups = [...map.values()];
  groups.forEach((group) =>
    group.logs.sort(
      (a, b) => parseLogTime(a.actionTime) - parseLogTime(b.actionTime)
    )
  );
  groups.sort(
    (a, b) =>
      parseLogTime(latestOf(b)?.actionTime) -
      parseLogTime(latestOf(a)?.actionTime)
  );
  return groups;
};
