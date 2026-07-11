import http from '@/api/request'
import type { ApiResponse, Resource, ResourceListParams, PageResponse, Category, Tag } from '@/types'

export const resourceApi = {
  getList(params: ResourceListParams): Promise<ApiResponse<PageResponse<Resource>>> {
    return http.get('/resources', { params }).then((r) => r.data)
  },
  getDetail(id: number): Promise<ApiResponse<Resource>> {
    return http.get(`/resources/${id}`).then((r) => r.data)
  },
  create(data: Partial<Resource>): Promise<ApiResponse<Resource>> {
    return http.post('/resources', data).then((r) => r.data)
  },
  update(id: number, data: Partial<Resource>): Promise<ApiResponse<Resource>> {
    return http.put(`/resources/${id}`, data).then((r) => r.data)
  },
  delete(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/resources/${id}`).then((r) => r.data)
  },
  like(id: number): Promise<ApiResponse<{ liked: boolean }>> {
    return http.post(`/resources/${id}/like`).then((r) => r.data)
  },
  favorite(id: number): Promise<ApiResponse<{ favorited: boolean }>> {
    return http.post(`/resources/${id}/favorite`).then((r) => r.data)
  },
  getCategories(): Promise<ApiResponse<Category[]>> {
    return http.get('/resources/categories').then((r) => r.data)
  },
  getTags(): Promise<ApiResponse<Tag[]>> {
    return http.get('/resources/tags').then((r) => r.data)
  },
  uploadFile(resourceId: number, formData: FormData): Promise<ApiResponse<any>> {
    return http.post(`/resources/${resourceId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
