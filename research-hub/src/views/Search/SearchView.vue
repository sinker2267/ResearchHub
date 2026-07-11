<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { blogApi, resourceApi } from '@/api'
import { formatRelativeTime, truncateText } from '@/utils'
import EmptyState from '@/components/common/EmptyState.vue'
import type { BlogPost, Resource } from '@/types'

const route = useRoute()
const query = ref((route.query.q as string) || '')
const loading = ref(false)
const blogResults = ref<BlogPost[]>([])
const resourceResults = ref<Resource[]>([])

async function search(): Promise<void> {
  const q = query.value.trim()
  if (!q) { blogResults.value = []; resourceResults.value = []; return }
  loading.value = true
  try {
    const [blogRes, resRes] = await Promise.all([
      blogApi.getList({ page: 1, pageSize: 20, keyword: q }),
      resourceApi.getList({ page: 1, pageSize: 20, keyword: q }),
    ])
    blogResults.value = blogRes.data.data
    resourceResults.value = resRes.data.data
  } finally { loading.value = false }
}

onMounted(() => { if (query.value) search() })
</script>

<template>
  <div class="search-page">
    <div class="page-container--narrow">
      <div class="search-header">
        <el-input v-model="query" placeholder="搜索文章、资源..." size="large" clearable @keyup.enter="search" @clear="search">
          <template #append><el-button @click="search">搜索</el-button></template>
        </el-input>
      </div>

      <div v-loading="loading">
        <template v-if="blogResults.length === 0 && resourceResults.length === 0 && query">
          <EmptyState title="未找到结果" description="尝试使用不同的关键词搜索" />
        </template>

        <!-- Blog results -->
        <section v-if="blogResults.length > 0" class="result-section">
          <h3 class="result-heading">文章 ({{ blogResults.length }})</h3>
          <div v-for="item in blogResults" :key="'blog-'+item.id" class="result-item card--hoverable">
            <router-link :to="`/blog/${item.id}`" class="result-link">
              <div class="result-body">
                <div class="result-header">
                  <span class="result-type type-blog">文章</span>
                  <span class="result-time">{{ formatRelativeTime(item.publishedAt) }}</span>
                </div>
                <h3 class="result-title">{{ item.title }}</h3>
                <p class="result-summary">{{ truncateText(item.summary, 200) }}</p>
                <span class="result-author">{{ item.author?.displayName }}</span>
              </div>
            </router-link>
          </div>
        </section>

        <!-- Resource results -->
        <section v-if="resourceResults.length > 0" class="result-section">
          <h3 class="result-heading">资源 ({{ resourceResults.length }})</h3>
          <div v-for="item in resourceResults" :key="'res-'+item.id" class="result-item card--hoverable">
            <router-link :to="`/resource/${item.id}`" class="result-link">
              <div class="result-body">
                <div class="result-header">
                  <span class="result-type type-resource">资源</span>
                  <span class="result-time">{{ formatRelativeTime(item.createdAt) }}</span>
                </div>
                <h3 class="result-title">{{ item.title }}</h3>
                <p class="result-summary">{{ truncateText(item.description, 200) }}</p>
                <span class="result-author">{{ item.author?.displayName }}</span>
              </div>
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-page { min-height: calc(100vh - 56px); padding: 24px 0; }
.search-header { margin-bottom: 24px; }

.result-section { margin-bottom: 24px; }
.result-heading { font-size: 14px; font-weight: 600; color: #212529; margin-bottom: 10px; }
.result-item { margin-bottom: 8px; }
.result-link { text-decoration: none; color: inherit; display: block; }
.result-body { padding: 16px 20px; }

.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.result-type { font-size: 11px; font-weight: 500; padding: 1px 8px; border-radius: 4px;
  &.type-blog { color: #4c6ef5; background: #eef2ff; }
  &.type-resource { color: #2b8a3e; background: #ebfbee; } }
.result-time { font-size: 11px; color: #adb5bd; }

.result-title { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 6px; }
.result-summary { font-size: 13px; color: #6c757d; line-height: 1.6; margin-bottom: 8px; }
.result-author { font-size: 12px; color: #868e96; }
</style>
