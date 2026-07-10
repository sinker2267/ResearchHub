<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { mockBlogs, mockResources, mockNotices } from '@/mock/data'
import { formatRelativeTime, truncateText } from '@/utils'
import EmptyState from '@/components/common/EmptyState.vue'
import type { SearchResult } from '@/types'

const route = useRoute()
const query = ref((route.query.q as string) || '')
const results = ref<SearchResult[]>([])
const loading = ref(false)

function search(): void {
  const q = query.value.toLowerCase().trim()
  if (!q) { results.value = []; return }
  loading.value = true
  const blogResults: SearchResult[] = mockBlogs
    .filter((b) => b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q))
    .map((b) => ({ id: b.id, type: 'blog' as const, title: b.title, summary: b.summary, highlight: q, author: b.author, createdAt: b.publishedAt }))
  const resResults: SearchResult[] = mockResources
    .filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .map((r) => ({ id: r.id, type: 'resource' as const, title: r.title, summary: r.description, highlight: q, author: r.author, createdAt: r.createdAt }))
  results.value = [...blogResults, ...resResults]
  loading.value = false
}

onMounted(() => { if (query.value) search() })
</script>

<template>
  <div class="search-page">
    <div class="page-container--narrow">
      <div class="search-header">
        <el-input
          v-model="query"
          placeholder="搜索文章、资源..."
          size="large"
          clearable
          @keyup.enter="search"
          @clear="search"
        >
          <template #append>
            <el-button @click="search">搜索</el-button>
          </template>
        </el-input>
      </div>

      <EmptyState v-if="results.length === 0 && query" title="未找到结果" description="尝试使用不同的关键词搜索" />
      <div v-else-if="results.length > 0" class="result-list">
        <div v-for="item in results" :key="`${item.type}-${item.id}`" class="result-item card--hoverable">
          <router-link :to="`/${item.type}/${item.id}`" class="result-link">
            <div class="result-body">
              <div class="result-header">
                <span class="result-type" :class="`type-${item.type}`">
                  {{ item.type === 'blog' ? '文章' : '资源' }}
                </span>
                <span class="result-time">{{ formatRelativeTime(item.createdAt) }}</span>
              </div>
              <h3 class="result-title">{{ item.title }}</h3>
              <p class="result-summary">{{ truncateText(item.summary, 200) }}</p>
              <span class="result-author">{{ item.author.displayName }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-page { min-height: calc(100vh - 56px); padding: 24px 0; }

.search-header { margin-bottom: 24px; }

.result-list { display: flex; flex-direction: column; gap: 8px; }
.result-link { text-decoration: none; color: inherit; display: block; }
.result-body { padding: 16px 20px; }

.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.result-type {
  font-size: 11px; font-weight: 500; padding: 1px 8px; border-radius: 4px;
  &.type-blog { color: #4c6ef5; background: #eef2ff; }
  &.type-resource { color: #2b8a3e; background: #ebfbee; }
}
.result-time { font-size: 11px; color: #adb5bd; }

.result-title { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 6px; }
.result-summary { font-size: 13px; color: #6c757d; line-height: 1.6; margin-bottom: 8px; }
.result-author { font-size: 12px; color: #868e96; }
</style>
