// ============================================================
// ResearchHub Application Constants
// ============================================================

// --- Storage Keys ---
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'rh_access_token',
  REFRESH_TOKEN: 'rh_refresh_token',
  USER_INFO: 'rh_user_info',
  THEME: 'rh_theme',
  SIDEBAR_COLLAPSED: 'rh_sidebar_collapsed',
} as const

// --- Route Names ---
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  BLOG_LIST: 'BlogList',
  BLOG_DETAIL: 'BlogDetail',
  BLOG_CREATE: 'BlogCreate',
  BLOG_EDIT: 'BlogEdit',
  RESOURCE_LIST: 'ResourceList',
  RESOURCE_DETAIL: 'ResourceDetail',
  SEARCH: 'Search',
  NOTICE: 'Notice',
  PROFILE: 'Profile',
  PROFILE_FAVORITES: 'ProfileFavorites',
  PROFILE_DOWNLOADS: 'ProfileDownloads',
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_USERS: 'AdminUsers',
  ADMIN_ROLES: 'AdminRoles',
  ADMIN_PERMISSIONS: 'AdminPermissions',
  ADMIN_RESOURCES: 'AdminResources',
  ADMIN_LOGS: 'AdminLogs',
  ADMIN_SETTINGS: 'AdminSettings',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'NotFound',
} as const

// --- Permission Codes ---
export const PERMISSIONS = {
  // Blog
  BLOG_VIEW: 'blog:view',
  BLOG_CREATE: 'blog:create',
  BLOG_EDIT: 'blog:edit',
  BLOG_DELETE: 'blog:delete',
  BLOG_PUBLISH: 'blog:publish',
  // Resource
  RESOURCE_VIEW: 'resource:view',
  RESOURCE_CREATE: 'resource:create',
  RESOURCE_EDIT: 'resource:edit',
  RESOURCE_DELETE: 'resource:delete',
  RESOURCE_DOWNLOAD: 'resource:download',
  // Notice
  NOTICE_VIEW: 'notice:view',
  NOTICE_CREATE: 'notice:create',
  NOTICE_MANAGE: 'notice:manage',
  // Admin
  ADMIN_ACCESS: 'admin:access',
  USER_MANAGE: 'admin:user:manage',
  ROLE_MANAGE: 'admin:role:manage',
  PERMISSION_MANAGE: 'admin:permission:manage',
  RESOURCE_MANAGE: 'admin:resource:manage',
  LOG_VIEW: 'admin:log:view',
  SETTING_MANAGE: 'admin:setting:manage',
  // System
  SYSTEM_ADMIN: 'system:admin',
} as const

// --- Resource Types ---
export const RESOURCE_TYPES = [
  { value: 'dataset', label: '数据集', icon: 'FolderOpened' },
  { value: 'software', label: '软件', icon: 'Monitor' },
  { value: 'model', label: '模型', icon: 'Cpu' },
  { value: 'paper', label: '论文', icon: 'Document' },
  { value: 'other', label: '其他', icon: 'More' },
] as const

// --- Blog Status ---
export const BLOG_STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

// --- Notice Levels ---
export const NOTICE_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  info: { label: '信息', color: 'var(--el-color-info)' },
  warning: { label: '警告', color: 'var(--el-color-warning)' },
  important: { label: '重要', color: 'var(--el-color-danger)' },
  urgent: { label: '紧急', color: 'var(--el-color-danger)' },
}

// --- Pagination Defaults ---
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 12,
  PAGE_SIZES: [12, 24, 48, 96],
} as const

// --- File Size Units ---
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const
