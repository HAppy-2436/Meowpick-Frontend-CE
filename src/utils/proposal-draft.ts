/**
 * 提案本地草稿（纯前端 storage，不依赖后端）。
 *
 * 统一在此维护 storage key 与数据结构，供「新增/重新编辑提案」页与
 * 「我的发布」列表（作为草稿）共用，避免两处定义漂移。
 */
export const PROPOSAL_DRAFT_KEY = 'meowpick_proposal_draft';

export interface ProposalTeacherEntry {
  name: string;
  title: string;
  department?: string;
  teacherId?: string;
}

export interface ProposalDraft {
  courseName: string;
  courseCode: string;
  department: string;
  category: string;
  teachers: ProposalTeacherEntry[];
  campuses: string[];
  reason: string;
  showUsername: boolean | null;
  savedAt: number;
}

export const readProposalDraft = (): ProposalDraft | null => {
  try {
    const stored = uni.getStorageSync(PROPOSAL_DRAFT_KEY);
    if (stored && typeof stored === 'object') return stored as ProposalDraft;
  } catch (e) {
    console.warn('[proposal-draft] read failed:', e);
  }
  return null;
};

export const writeProposalDraft = (draft: ProposalDraft): boolean => {
  try {
    uni.setStorageSync(PROPOSAL_DRAFT_KEY, draft);
    return true;
  } catch (e) {
    console.error('[proposal-draft] write failed:', e);
    return false;
  }
};

export const clearProposalDraft = () => {
  try {
    uni.removeStorageSync(PROPOSAL_DRAFT_KEY);
  } catch (e) {
    console.warn('[proposal-draft] clear failed:', e);
  }
};
