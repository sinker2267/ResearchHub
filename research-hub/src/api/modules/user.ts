import http from '@/api/request'
import type { ApiResponse, UserProfile, FavoriteItem, DownloadRecord } from '@/types'

export const userApi = {
  getProfile(): Promise<ApiResponse<UserProfile>> {
    return http.get('/user/profile').then((r) => r.data)
  },
  updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return http.put('/user/profile', data).then((r) => r.data)
  },
  getFavorites(params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<FavoriteItem>>> {
    return http.get('/user/favorites', { params }).then((r) => r.data)
  },
  getDownloadHistory(params: { page: number; pageSize: number }): Promise<ApiResponse<PageResponse<DownloadRecord>>> {
    return http.get('/user/downloads', { params }).then((r) => r.data)
  },
}

import type { PageResponse } from '@/types'
