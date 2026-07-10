import http from '@/api/request'
import type {
  ApiResponse,
  BlogPost,
  BlogListParams,
  BlogComment,
  PageResponse,
} from '@/types'

export const blogApi = {
  getList(params: BlogListParams): Promise<ApiResponse<PageResponse<BlogPost>>> {
    return http.get('/blogs', { params }).then((r) => r.data)
  },

  getDetail(id: number): Promise<ApiResponse<BlogPost>> {
    return http.get(`/blogs/${id}`).then((r) => r.data)
  },

  getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return http.get(`/blogs/slug/${slug}`).then((r) => r.data)
  },

  create(data: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    return http.post('/blogs', data).then((r) => r.data)
  },

  update(id: number, data: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    return http.put(`/blogs/${id}`, data).then((r) => r.data)
  },

  delete(id: number): Promise<ApiResponse<null>> {
    return http.delete(`/blogs/${id}`).then((r) => r.data)
  },

  like(id: number): Promise<ApiResponse<{ liked: boolean }>> {
    return http.post(`/blogs/${id}/like`).then((r) => r.data)
  },

  favorite(id: number): Promise<ApiResponse<{ favorited: boolean }>> {
    return http.post(`/blogs/${id}/favorite`).then((r) => r.data)
  },

  getComments(blogId: number, params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<BlogComment>>> {
    return http.get(`/blogs/${blogId}/comments`, { params }).then((r) => r.data)
  },

  addComment(blogId: number, data: { content: string; parentId?: number }): Promise<ApiResponse<BlogComment>> {
    return http.post(`/blogs/${blogId}/comments`, data).then((r) => r.data)
  },

  getRecommendations(blogId: number): Promise<ApiResponse<BlogPost[]>> {
    return http.get(`/blogs/${blogId}/recommendations`).then((r) => r.data)
  },
}
