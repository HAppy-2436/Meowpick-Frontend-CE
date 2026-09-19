// API Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE = 10;
export const TEACHER_SEARCH_PAGE_SIZE = 5;
export const MY_COMMENTS_PAGE_SIZE = 5;
export const HISTORY_PAGE_SIZE = 50;

// UI Constants
export const DEBOUNCE_DELAY_MS = 300;
export const TOAST_DURATION_MS = 1500;
export const COLLAPSE_SCROLL_THRESHOLD = 30;
export const EXPAND_SCROLL_THRESHOLD = 10;
export const MAX_HISTORY_SIZE = 50;

// Sort Types
export const SORT_DEFAULT = 'default';
export const SORT_HOT = 'hot';
export const SORT_TIME = 'time';

// Comment Target Type
export const TARGET_TYPE_COMMENT = '2';
export const TARGET_TYPE_PROPOSAL = '1';

// API Default Constants
export const PROPOSAL_PAGE_SIZE_DEFAULT = 10;
export const PROPOSAL_FIELD_PAGE_SIZE_DEFAULT = 10;
export const ADMIN_LOG_PAGE_SIZE_DEFAULT = 20;

// Search Filter Options (campus list is stable; category is search-based via API)
export const CAMPUS_OPTIONS = ['闵行校区', '普陀校区', '滴水湖校区'];

// Proposal plaza filter options (shared by proposal list page and cross-page filter handoff)
export const PROPOSAL_CATEGORY_OPTIONS = [
  '通识必修',
  '通识选修',
  '专业必修',
  '专业选修',
  '公共基础',
  '实践环节'
];
