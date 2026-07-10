import http from '@/api/request'
import type { ApiResponse, Notice, PageResponse } from '@/types'

export const noticeApi = {
  getList(params: { page: number; pageSize: number; type?: string }): Promise<ApiResponse<PageResponse<Notice>>> {
    return http.get('/notices', { params }).then((r) => r.data)
  },
  getDetail(id: number): Promise<ApiResponse<Notice>> {
    return http.get(`/notices/${id}`).then((r) => r.data)
  },
  markRead(id: number): Promise<ApiResponse<null>> {
    return http.put(`/notices/${id}/read`).then((r) => r.data)
  },
  markAllRead(): Promise<ApiResponse<null>> {
    return http.put('/notices/read-all').then((r) => r.data)
  },
  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return http.get('/notices/unread-count').then((r) => r.data)
  },
  create(data: Partial<Notice>): Promise<ApiResponse<Notice>> {
    return http.post('/notices', data).then((r) => r.data)
  },
  update(id: number, data: Partial<Notice>): Promise<ApiResponse<Notice>> {
    return http.put(`/notices/${id}`, data).then((r) => r.data)
  },
  delete(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/notices/${id}`).then((r) => r.data)
  },
}
