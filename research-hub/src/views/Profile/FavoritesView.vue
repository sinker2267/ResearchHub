<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockBlogs, mockResources } from '@/mock/data'
import { formatRelativeTime, truncateText } from '@/utils'
import PageLoading from '@/components/common/PageLoading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { FavoriteItem } from '@/types'

const loading = ref(true)
const items = ref<FavoriteItem[]>([])

async function load(): Promise<void> {
  loading.value = true
  await new Promise((r) => setTimeout(r, 300))
  items.value = [
    ...mockBlogs.filter((b) => b.isFavorited).map((b) => ({ id: b.id, type: 'blog' as const, itemId: b.id, itemTitle: b.title, createdAt: b.publishedAt })),
    ...mockResources.filter((r) => r.isFavorited).map((r) => ({ id: r.id + 1000, type: 'resource' as const, itemId: r.id, itemTitle: r.title, createdAt: r.createdAt })),
  ]
  loading.value = false
}

onMounted(() => { load() })
</script>

<template>
  <div class="fav-page">
    <div class="page-container--narrow">
      <h2 class="page-title">我的收藏</h2>
      <PageLoading v-if="loading" />
      <EmptyState v-else-if="items.length === 0" title="暂无收藏" description="浏览博客或资源时点击收藏即可添加到此处" />
      <div v-else class="fav-list">
        <div v-for="item in items" :key="item.id" class="fav-item card--hoverable">
          <router-link :to="`/${item.type}/${item.itemId}`" class="fav-link">
            <div class="fav-body">
              <span class="fav-type" :class="`type-${item.type}`">{{ item.type === 'blog' ? '文章' : '资源' }}</span>
              <div class="fav-info">
                <h4 class="fav-title">{{ item.itemTitle }}</h4>
                <span class="fav-time">{{ formatRelativeTime(item.createdAt) }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fav-page { min-height: calc(100vh - 56px); padding: 24px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 24px; }

.fav-list { display: flex; flex-direction: column; gap: 8px; }
.fav-link { text-decoration: none; color: inherit; display: block; }
.fav-body { padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
.fav-type {
  font-size: 11px; font-weight: 500; padding: 2px 10px; border-radius: 4px; flex-shrink: 0;
  &.type-blog { color: #4c6ef5; background: #eef2ff; }
  &.type-resource { color: #2b8a3e; background: #ebfbee; }
}
.fav-info { flex: 1; }
.fav-title { font-size: 14px; font-weight: 500; color: #212529; margin-bottom: 4px; }
.fav-time { font-size: 11px; color: #adb5bd; }
</style>
