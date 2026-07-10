import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ROUTE_NAMES, PERMISSIONS } from '@/constants'

const routes = [
  { path: '/login', name: ROUTE_NAMES.LOGIN, component: () => import('@/views/Login/LoginView.vue'), meta: { title: '登录', public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: ROUTE_NAMES.DASHBOARD, component: () => import('@/views/Dashboard/DashboardView.vue'), meta: { title: '仪表盘' } },
  { path: '/blog', name: ROUTE_NAMES.BLOG_LIST, component: () => import('@/views/Blog/BlogListView.vue'), meta: { title: '博客' } },
  { path: '/blog/create', name: ROUTE_NAMES.BLOG_CREATE, component: () => import('@/views/Blog/BlogEditorView.vue'), meta: { title: '写文章', permission: PERMISSIONS.BLOG_CREATE } },
  { path: '/blog/:id', name: ROUTE_NAMES.BLOG_DETAIL, component: () => import('@/views/Blog/BlogDetailView.vue'), meta: { title: '文章详情' } },
  { path: '/blog/:id/edit', name: ROUTE_NAMES.BLOG_EDIT, component: () => import('@/views/Blog/BlogEditorView.vue'), meta: { title: '编辑文章', permission: PERMISSIONS.BLOG_EDIT } },
  { path: '/resource', name: ROUTE_NAMES.RESOURCE_LIST, component: () => import('@/views/Resource/ResourceListView.vue'), meta: { title: '资源中心' } },
  { path: '/resource/upload', name: 'ResourceUpload', component: () => import('@/views/Resource/ResourceUploadView.vue'), meta: { title: '上传资源', permission: PERMISSIONS.RESOURCE_CREATE } },
  { path: '/resource/:id', name: ROUTE_NAMES.RESOURCE_DETAIL, component: () => import('@/views/Resource/ResourceDetailView.vue'), meta: { title: '资源详情' } },
  { path: '/search', name: ROUTE_NAMES.SEARCH, component: () => import('@/views/Search/SearchView.vue'), meta: { title: '搜索' } },
  { path: '/notice', name: ROUTE_NAMES.NOTICE, component: () => import('@/views/Notice/NoticeView.vue'), meta: { title: '通知' } },
  { path: '/notice/create', name: 'NoticeCreate', component: () => import('@/views/Notice/NoticeCreateView.vue'), meta: { title: '发布公告', permission: PERMISSIONS.NOTICE_CREATE } },
  { path: '/profile', name: ROUTE_NAMES.PROFILE, component: () => import('@/views/Profile/ProfileView.vue'), meta: { title: '个人中心' } },
  { path: '/profile/favorites', name: ROUTE_NAMES.PROFILE_FAVORITES, component: () => import('@/views/Profile/FavoritesView.vue'), meta: { title: '我的收藏' } },
  { path: '/profile/downloads', name: ROUTE_NAMES.PROFILE_DOWNLOADS, component: () => import('@/views/Profile/DownloadHistoryView.vue'), meta: { title: '下载历史' } },
  { path: '/admin', redirect: '/admin/dashboard', meta: { permission: PERMISSIONS.ADMIN_ACCESS } },
  { path: '/admin/dashboard', name: ROUTE_NAMES.ADMIN_DASHBOARD, component: () => import('@/views/Admin/AdminDashboardView.vue'), meta: { title: '管理概览', permission: PERMISSIONS.ADMIN_ACCESS, layout: 'admin' } },
  { path: '/admin/users', name: ROUTE_NAMES.ADMIN_USERS, component: () => import('@/views/Admin/UserManagementView.vue'), meta: { title: '用户管理', permission: PERMISSIONS.USER_MANAGE, layout: 'admin' } },
  { path: '/admin/roles', name: ROUTE_NAMES.ADMIN_ROLES, component: () => import('@/views/Admin/RoleManagementView.vue'), meta: { title: '角色管理', permission: PERMISSIONS.ROLE_MANAGE, layout: 'admin' } },
  { path: '/admin/permissions', name: ROUTE_NAMES.ADMIN_PERMISSIONS, component: () => import('@/views/Admin/PermissionView.vue'), meta: { title: '权限管理', permission: PERMISSIONS.PERMISSION_MANAGE, layout: 'admin' } },
  { path: '/admin/resources', name: ROUTE_NAMES.ADMIN_RESOURCES, component: () => import('@/views/Admin/ResourceManagementView.vue'), meta: { title: '资源管理', permission: PERMISSIONS.RESOURCE_MANAGE, layout: 'admin' } },
  { path: '/admin/categories', name: 'AdminCategories', component: () => import('@/views/Admin/CategoryManagementView.vue'), meta: { title: '分类管理', permission: PERMISSIONS.SETTING_MANAGE, layout: 'admin' } },
  { path: '/admin/tags', name: 'AdminTags', component: () => import('@/views/Admin/TagManagementView.vue'), meta: { title: '标签管理', permission: PERMISSIONS.SETTING_MANAGE, layout: 'admin' } },
  { path: '/admin/logs', name: ROUTE_NAMES.ADMIN_LOGS, component: () => import('@/views/Admin/OperationLogView.vue'), meta: { title: '操作日志', permission: PERMISSIONS.LOG_VIEW, layout: 'admin' } },
  { path: '/admin/settings', name: ROUTE_NAMES.ADMIN_SETTINGS, component: () => import('@/views/Admin/SystemSettingsView.vue'), meta: { title: '系统设置', permission: PERMISSIONS.SETTING_MANAGE, layout: 'admin' } },
  { path: '/403', name: ROUTE_NAMES.FORBIDDEN, component: () => import('@/views/Error/ForbiddenView.vue'), meta: { title: '无权限', public: true } },
  { path: '/:pathMatch(.*)*', name: ROUTE_NAMES.NOT_FOUND, component: () => import('@/views/Error/NotFoundView.vue'), meta: { title: '页面不存在', public: true } },
]

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior() { return { top: 0 } } })

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'ResearchHub'} - ResearchHub`
  const userStore = useUserStore()
  if (to.meta.public) return next()
  if (!userStore.isLoggedIn) return next({ name: ROUTE_NAMES.LOGIN, query: { redirect: to.fullPath } })
  const perm = to.meta.permission as string | undefined
  if (perm && !userStore.hasPermission(perm)) return next({ name: ROUTE_NAMES.FORBIDDEN })
  next()
})

export default router
