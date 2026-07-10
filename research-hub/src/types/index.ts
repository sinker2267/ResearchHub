// ============================================================
// ResearchHub Type Definitions
// ============================================================

// --- User & Auth ---
export interface UserInfo {
  id: number
  username: string
  displayName: string
  email: string
  avatar: string
  bio: string
  department: string
  title: string
  roles: Role[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: number
  name: string
  code: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  code: string
  resource: string
  action: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userInfo: UserInfo
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// --- Blog ---
export interface BlogPost {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  tags: Tag[]
  category: Category
  author: UserInfo
  status: BlogStatus
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned?: boolean
  pinnedAt?: string | null
  isPinned?: boolean
  pinnedAt?: string | null
  isLiked: boolean
  isFavorited: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogListParams {
  page: number
  pageSize: number
  category?: string
  tag?: string
  keyword?: string
  sort?: 'latest' | 'popular' | 'trending'
}

export interface BlogComment {
  id: number
  blogId: number
  content: string
  author: UserInfo
  parentId: number | null
  replies: BlogComment[]
  createdAt: string
}

// --- Resource ---
export interface Resource {
  id: number
  title: string
  slug: string
  description: string
  type: ResourceType
  category: Category
  tags: Tag[]
  files: ResourceFile[]
  versions: ResourceVersion[]
  author: UserInfo
  license: string
  citation: string
  viewCount: number
  downloadCount: number
  likeCount: number
  isPinned?: boolean
  pinnedAt?: string | null
  isLiked: boolean
  isPinned?: boolean
  pinnedAt?: string | null
  isFavorited: boolean
  status: ResourceStatus
  createdAt: string
  updatedAt: string
}

export type ResourceType = 'dataset' | 'software' | 'model' | 'paper' | 'other'
export type ResourceStatus = 'draft' | 'published' | 'archived'

export interface ResourceFile {
  id: number
  filename: string
  size: number
  md5: string
  sha256: string
  mimeType: string
  downloadCount: number
  createdAt: string
}

export interface ResourceVersion {
  id: number
  version: string
  changelog: string
  files: ResourceFile[]
  createdAt: string
}

export interface ResourceListParams {
  page: number
  pageSize: number
  type?: ResourceType
  category?: string
  tag?: string
  keyword?: string
  sort?: 'latest' | 'popular' | 'downloads'
}

// --- Common ---
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  parentId: number | null
}

export interface Tag {
  id: number
  name: string
  slug: string
  color: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PageResponse<T> {
  data: T[]
  pagination: Pagination
}

// --- Notice ---
export interface Notice {
  id: number
  title: string
  content: string
  type: NoticeType
  level: NoticeLevel
  isRead: boolean
  publisher: UserInfo
  publishedAt: string
  createdAt: string
}

export type NoticeType = 'announcement' | 'system' | 'mention' | 'comment'
export type NoticeLevel = 'info' | 'warning' | 'important' | 'urgent'

// --- Admin ---
export interface UserListItem {
  id: number
  username: string
  displayName: string
  email: string
  department: string
  roles: Role[]
  status: 'active' | 'disabled'
  lastLoginAt: string
  createdAt: string
}

export interface OperationLog {
  id: number
  userId: number
  username: string
  action: string
  resource: string
  detail: string
  ip: string
  createdAt: string
}

export interface SystemSetting {
  id: number
  key: string
  value: string
  group: string
  description: string
}

// --- User Profile ---
export interface UserProfile extends UserInfo {
  downloadHistory: DownloadRecord[]
  favorites: FavoriteItem[]
}

export interface DownloadRecord {
  id: number
  resourceId: number
  resourceTitle: string
  fileId: number
  fileName: string
  downloadedAt: string
}

export interface FavoriteItem {
  id: number
  type: 'blog' | 'resource'
  itemId: number
  itemTitle: string
  createdAt: string
}

// --- Dashboard ---
export interface ActivityFeed {
  recentBlogs: BlogPost[]
  recentResources: Resource[]
  recentNotices: Notice[]
  recentDownloads: DownloadRecord[]
  welcomeMessage: string
}

// --- Search ---
export interface SearchResult {
  id: number
  type: 'blog' | 'resource' | 'notice'
  title: string
  summary: string
  highlight: string
  author: UserInfo
  createdAt: string
}

// --- Menu / Navigation ---
export interface MenuItem {
  id: string
  label: string
  icon: string
  path: string
  permission?: string
  children?: MenuItem[]
  badge?: number
}

// --- API ---
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  code: number
  message: string
  detail?: string
}
