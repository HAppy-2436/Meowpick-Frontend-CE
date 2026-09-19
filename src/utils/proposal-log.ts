import type {
  DtoProposalSnapshotVO,
  DtoProposalTimelineLogVO
} from '@/api/data-contracts';

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
  UPDATE: '更新',
  GRANT_ADMIN: '授权管理员',
  REVOKE_ADMIN: '撤销管理员'
};

const ACTION_TONE: Record<string, string> = {
  CREATE: 'info',
  APPROVE: 'success',
  REJECT: 'danger',
  DELETE: 'warning',
  UPDATE: 'info',
  GRANT_ADMIN: 'success',
  REVOKE_ADMIN: 'warning'
};

export const actionTextOf = (type?: string) =>
  (type && ACTION_TEXT[type]) || type || '操作';

export const actionToneOf = (type?: string) =>
  (type && ACTION_TONE[type]) || 'neutral';

export const parseLogTime = (value?: string): number => {
  if (!value) return 0;
  const time = new Date(value.replace(' ', 'T')).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const formatLogTime = (value?: string): string => {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
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
