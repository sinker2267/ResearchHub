import http from '@/api/request'
import type { ApiResponse, UserListItem, Role, Permission, Tag, OperationLog, SystemSetting, PageResponse } from '@/types'

export const adminApi = {
  // Users
  getUsers(params: { page: number; pageSize: number; keyword?: string }): Promise<ApiResponse<PageResponse<UserListItem>>> {
    return http.get('/admin/users', { params }).then((r) => r.data)
  },
  createUser(data: Partial<UserListItem>): Promise<ApiResponse<UserListItem>> {
    return http.post('/admin/users', data).then((r) => r.data)
  },
  updateUser(id: number, data: Partial<UserListItem>): Promise<ApiResponse<UserListItem>> {
    return http.put(`/admin/users/${id}`, data).then((r) => r.data)
  },
  deleteUser(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/admin/users/${id}`).then((r) => r.data)
  },
  // Roles
  getRoles(): Promise<ApiResponse<Role[]>> {
    return http.get('/admin/roles').then((r) => r.data)
  },
  createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
    return http.post('/admin/roles', data).then((r) => r.data)
  },
  updateRole(id: number, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return http.put(`/admin/roles/${id}`, data).then((r) => r.data)
  },
  deleteRole(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/admin/roles/${id}`).then((r) => r.data)
  },
  // Permissions
  getPermissions(): Promise<ApiResponse<Permission[]>> {
    return http.get('/admin/permissions').then((r) => r.data)
  },
  // Logs
  getLogs(params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<OperationLog>>> {
    return http.get('/admin/logs', { params }).then((r) => r.data)
  },
  // Settings
  getSettings(): Promise<ApiResponse<SystemSetting[]>> {
    return http.get('/admin/settings').then((r) => r.data)
  },
  updateSettings(data: SystemSetting[]): Promise<ApiResponse<null>> {
    return http.put('/admin/settings', data).then((r) => r.data)
  },
  // Dashboard stats
  getDashboardStats(): Promise<ApiResponse<Record<string, number>>> {
    return http.get('/admin/dashboard').then((r) => r.data)
  },

  // Categories
  getCategories(): Promise<ApiResponse<Category[]>> {
    return http.get('/admin/categories').then((r) => r.data)
  },
  createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    return http.post('/admin/categories', data).then((r) => r.data)
  },
  updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
    return http.put(`/admin/categories/${id}`, data).then((r) => r.data)
  },
  deleteCategory(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/admin/categories/${id}`).then((r) => r.data)
  },


  // Tags
  getTags(): Promise<ApiResponse<Tag[]>> {
    return http.get('/admin/tags').then((r) => r.data)
  },
  createTag(data: Partial<Tag>): Promise<ApiResponse<Tag>> {
    return http.post('/admin/tags', data).then((r) => r.data)
  },
  updateTag(id: number, data: Partial<Tag>): Promise<ApiResponse<Tag>> {
    return http.put(`/admin/tags/${id}`, data).then((r) => r.data)
  },
  deleteTag(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/admin/tags/${id}`).then((r) => r.data)
  },
}
