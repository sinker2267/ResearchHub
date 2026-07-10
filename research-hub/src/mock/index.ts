import type {
  ApiResponse, PageResponse, LoginRequest, LoginResponse,
  BlogPost, BlogListParams, BlogComment, Resource, ResourceListParams,
  Notice, UserProfile,
} from '@/types'
import {
  mockUsers, mockBlogs, mockResources, mockNotices,
  mockCategories, mockTags, mockComments,
} from './data'

// Simulate network delay
function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// Paginate array
function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = items.slice(start, start + pageSize)
  return { data, pagination: { page, pageSize, total, totalPages } }
}

// Build ApiResponse wrapper
function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

// ============================================================
// Auth Mock
// ============================================================
let currentUser: number | null = null

export async function mockLogin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  await delay(500)
  const user = mockUsers.find((u) => u.username === data.username)
  if (!user || data.password !== '123456') {
    return { code: 401, message: '用户名或密码错误', data: null as unknown as LoginResponse }
  }
  currentUser = user.id
  return ok({
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresIn: 7200,
    userInfo: user,
  })
}

export async function mockLogout(): Promise<ApiResponse<null>> {
  await delay(200)
  currentUser = null
  return ok(null)
}

// ============================================================
// Blog Mock
// ============================================================
export async function mockGetBlogList(params: BlogListParams): Promise<ApiResponse<PageResponse<BlogPost>>> {
  await delay(300)
  let items = [...mockBlogs]
  if (params.category) {
    items = items.filter((b) => b.category.slug === params.category)
  }
  if (params.tag) {
    items = items.filter((b) => b.tags.some((t) => t.slug === params.tag))
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    items = items.filter((b) => b.title.toLowerCase().includes(kw) || b.summary.toLowerCase().includes(kw))
  }
  if (params.sort === 'popular') {
    items.sort((a, b) => b.viewCount - a.viewCount)
  } else {
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }
  return ok(paginate(items, params.page, params.pageSize))
}

export async function mockGetBlogDetail(id: number): Promise<ApiResponse<BlogPost>> {
  await delay(200)
  const blog = mockBlogs.find((b) => b.id === id)
  if (!blog) return { code: 404, message: '文章不存在', data: null as unknown as BlogPost }
  return ok({ ...blog })
}

export async function mockGetBlogComments(blogId: number, params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<BlogComment>>> {
  await delay(200)
  const comments = mockComments[blogId] || []
  return ok(paginate(comments, params.page, params.pageSize))
}

export async function mockAddComment(blogId: number, data: { content: string; parentId?: number }): Promise<ApiResponse<BlogComment>> {
  await delay(200)
  const currentUserData = mockUsers.find((u) => u.id === currentUser) || mockUsers[0]
  const comment: BlogComment = {
    id: Date.now(), blogId, content: data.content, author: currentUserData,
    parentId: data.parentId || null, replies: [], createdAt: new Date().toISOString(),
  }
  if (!mockComments[blogId]) mockComments[blogId] = []
  mockComments[blogId].push(comment)
  return ok(comment)
}

export async function mockToggleBlogLike(id: number): Promise<ApiResponse<{ liked: boolean }>> {
  await delay(100)
  const blog = mockBlogs.find((b) => b.id === id)
  if (!blog) return { code: 404, message: '', data: { liked: false } }
  blog.isLiked = !blog.isLiked
  blog.likeCount += blog.isLiked ? 1 : -1
  return ok({ liked: blog.isLiked })
}

export async function mockToggleBlogFavorite(id: number): Promise<ApiResponse<{ favorited: boolean }>> {
  await delay(100)
  const blog = mockBlogs.find((b) => b.id === id)
  if (!blog) return { code: 404, message: '', data: { favorited: false } }
  blog.isFavorited = !blog.isFavorited
  return ok({ favorited: blog.isFavorited })
}

export async function mockGetBlogRecommendations(blogId: number): Promise<ApiResponse<BlogPost[]>> {
  await delay(200)
  return ok(mockBlogs.filter((b) => b.id !== blogId).slice(0, 3))
}

// ============================================================
// Resource Mock
// ============================================================
export async function mockGetResourceList(params: ResourceListParams): Promise<ApiResponse<PageResponse<Resource>>> {
  await delay(300)
  let items = [...mockResources]
  if (params.type) items = items.filter((r) => r.type === params.type)
  if (params.category) items = items.filter((r) => r.category.slug === params.category)
  if (params.tag) items = items.filter((r) => r.tags.some((t) => t.slug === params.tag))
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    items = items.filter((r) => r.title.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw))
  }
  if (params.sort === 'downloads') {
    items.sort((a, b) => b.downloadCount - a.downloadCount)
  } else {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return ok(paginate(items, params.page, params.pageSize))
}

export async function mockGetResourceDetail(id: number): Promise<ApiResponse<Resource>> {
  await delay(200)
  const resource = mockResources.find((r) => r.id === id)
  if (!resource) return { code: 404, message: '资源不存在', data: null as unknown as Resource }
  return ok({ ...resource })
}

// ============================================================
// Notice Mock
// ============================================================
export async function mockGetNoticeList(params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<Notice>>> {
  await delay(200)
  const sorted = [...mockNotices].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  return ok(paginate(sorted, params.page, params.pageSize))
}

export async function mockGetUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  await delay(100)
  return ok({ count: mockNotices.filter((n) => !n.isRead).length })
}

export async function mockMarkRead(id: number): Promise<ApiResponse<null>> {
  await delay(100)
  const notice = mockNotices.find((n) => n.id === id)
  if (notice) notice.isRead = true
  return ok(null)
}

// ============================================================
// User Mock
// ============================================================
export async function mockGetProfile(): Promise<ApiResponse<UserProfile>> {
  await delay(200)
  const user = mockUsers[0]
  return ok({
    ...user,
    downloadHistory: [
      { id: 1, resourceId: 101, resourceTitle: 'Human Protein Atlas v23 数据集', fileId: 1001, fileName: 'hpa_v23_normal_tissue.h5', downloadedAt: '2026-07-09T10:30:00Z' },
    ],
    favorites: [
      { id: 1, type: 'blog', itemId: 3, itemTitle: '使用AlphaFold2进行蛋白质结构预测的实用指南', createdAt: '2026-07-08T10:00:00Z' },
      { id: 2, type: 'resource', itemId: 102, itemTitle: 'MolDock Pro', createdAt: '2026-07-07T10:00:00Z' },
    ],
  })
}

// ============================================================
// Categories & Tags
// ============================================================
export async function mockGetCategories(): Promise<ApiResponse<typeof mockCategories>> {
  await delay(100)
  return ok(mockCategories)
}

export async function mockGetTags(): Promise<ApiResponse<typeof mockTags>> {
  await delay(100)
  return ok(mockTags)
}

export async function mockToggleBlogPin(id: number): Promise<ApiResponse<{ isPinned: boolean }>> {
  await delay(100)
  const blog = mockBlogs.find((b) => b.id === id)
  if (!blog) return { code: 404, message: '', data: { isPinned: false } }
  blog.isPinned = !blog.isPinned
  blog.pinnedAt = blog.isPinned ? new Date().toISOString() : null
  return ok({ isPinned: blog.isPinned })
}

export async function mockToggleResourcePin(id: number): Promise<ApiResponse<{ isPinned: boolean }>> {
  await delay(100)
  const r = mockResources.find((r) => r.id === id)
  if (!r) return { code: 404, message: '', data: { isPinned: false } }
  r.isPinned = !r.isPinned
  r.pinnedAt = r.isPinned ? new Date().toISOString() : null
  return ok({ isPinned: r.isPinned })
}
