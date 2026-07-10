import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notice, Pagination } from '@/types'
import { PAGINATION_DEFAULTS } from '@/constants'
import { noticeApi } from '@/api'

export const useNoticeStore = defineStore('notice', () => {
  const notices = ref<Notice[]>([])
  const unreadCount = ref(0)
  const pagination = ref<Pagination>({ page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE, total: 0, totalPages: 0 })
  const hasUnread = computed(() => unreadCount.value > 0)

  async function fetchNotices(params: { page: number; pageSize: number }): Promise<void> {
    const res = await noticeApi.getList(params)
    notices.value = res.data.data
    pagination.value = res.data.pagination
  }

  async function fetchUnreadCount(): Promise<void> {
    const res = await noticeApi.getUnreadCount()
    unreadCount.value = res.data.count
  }

  async function markRead(id: number): Promise<void> {
    await noticeApi.markRead(id)
    const n = notices.value.find((n) => n.id === id)
    if (n) n.isRead = true
    if (unreadCount.value > 0) unreadCount.value--
  }

  return { notices, unreadCount, pagination, hasUnread, fetchNotices, fetchUnreadCount, markRead }
})
