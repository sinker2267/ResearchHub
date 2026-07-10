<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNoticeStore } from '@/stores/notice'
import { formatRelativeTime } from '@/utils'
import { NOTICE_LEVEL_MAP, PAGINATION_DEFAULTS } from '@/constants'
import PageLoading from '@/components/common/PageLoading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'

const noticeStore = useNoticeStore()
const loading = ref(true)
const error = ref(false)
const currentPage = ref(1)
const pageSize = PAGINATION_DEFAULTS.PAGE_SIZE

async function load(): Promise<void> {
  loading.value = true; error.value = false
  try {
    await noticeStore.fetchNotices({ page: currentPage.value, pageSize })
  } catch { error.value = true } finally { loading.value = false }
}

function handleMarkRead(id: number): void { noticeStore.markRead(id) }

onMounted(() => { load() })
</script>

<template>
  <div class="notice-page">
    <div class="page-container--narrow">
      <div class="page-header">
        <h2 class="page-title">通知</h2>
        <span class="unread-badge" v-if="noticeStore.hasUnread">{{ noticeStore.unreadCount }} 条未读</span>
      </div>

      <PageLoading v-if="loading" />
      <ErrorState v-else-if="error" show-retry @retry="load" />
      <template v-else>
        <EmptyState v-if="noticeStore.notices.length === 0" title="暂无通知" />
        <div v-else class="notice-list">
          <div
            v-for="notice in noticeStore.notices"
            :key="notice.id"
            class="notice-item"
            :class="{ unread: !notice.isRead }"
            @click="handleMarkRead(notice.id)"
          >
            <div class="notice-left">
              <span class="notice-dot" :class="`dot-${notice.level}`" />
              <div class="notice-content">
                <h4 class="notice-title">{{ notice.title }}</h4>
                <p class="notice-body">{{ notice.content }}</p>
              </div>
            </div>
            <div class="notice-right">
              <span class="notice-level-tag" :class="`level-${notice.level}`">
                {{ NOTICE_LEVEL_MAP[notice.level]?.label }}
              </span>
              <span class="notice-time">{{ formatRelativeTime(notice.publishedAt) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notice-page { min-height: calc(100vh - 56px); padding: 24px 0; }

.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; color: #212529; }
.unread-badge { font-size: 12px; color: #4c6ef5; background: #eef2ff; padding: 2px 10px; border-radius: 4px; }

.notice-list { display: flex; flex-direction: column; gap: 8px; }

.notice-item {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px;
  background: #fff; border: 1px solid #e9ecef; border-radius: 8px;
  cursor: pointer; transition: all 150ms ease;
  &:hover { border-color: #bac8ff; }
  &.unread { background: #f8f9ff; border-color: #dbe4ff; }
}

.notice-left { display: flex; gap: 12px; flex: 1; min-width: 0; }
.notice-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px;
  &.dot-info { background: #339af0; }
  &.dot-warning { background: #f59f00; }
  &.dot-important { background: #fa5252; }
  &.dot-urgent { background: #fa5252; }
}

.notice-content { flex: 1; min-width: 0; }
.notice-title { font-size: 14px; font-weight: 500; color: #212529; margin-bottom: 4px; }
.notice-body { font-size: 13px; color: #6c757d; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.notice-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; margin-left: 16px; }
.notice-level-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500;
  &.level-info { color: #1971c2; background: #e7f5ff; }
  &.level-warning { color: #e67700; background: #fff9db; }
  &.level-important, &.level-urgent { color: #c92a2a; background: #fff5f5; }
}
.notice-time { font-size: 11px; color: #adb5bd; white-space: nowrap; }
</style>
