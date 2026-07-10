import http from '@/api/request'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types'

export const authApi = {
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return http.post('/auth/login', data).then((r) => r.data)
  },

  logout(): Promise<ApiResponse<null>> {
    return http.post('/auth/logout').then((r) => r.data)
  },

  refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
    return http.post('/auth/refresh', { refreshToken }).then((r) => r.data)
  },
}
