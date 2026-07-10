<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { blogApi, resourceApi, noticeApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { formatRelativeTime, truncateText } from '@/utils'
import PageLoading from '@/components/common/PageLoading.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { Notebook, FolderOpened, Bell } from '@element-plus/icons-vue'
import type { BlogPost, Resource, Notice } from '@/types'

const userStore = useUserStore()
const loading = ref(true)
const error = ref(false)

const recentBlogs = ref<BlogPost[]>([])
const recentResources = ref<Resource[]>([])
const recentNotices = ref<Notice[]>([])

async function loadFeed(): Promise<void> {
  loading.value = true; error.value = false
  try {
    const [blogRes, resRes, noticeRes] = await Promise.all([
      blogApi.getList({ page: 1, pageSize: 5, sort: 'latest' }),
      resourceApi.getList({ page: 1, pageSize: 5, sort: 'latest' }),
      noticeApi.getList({ page: 1, pageSize: 5 }),
    ])
    recentBlogs.value = blogRes.data.data
    recentResources.value = resRes.data.data
    recentNotices.value = noticeRes.data.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadFeed() })
</script>

<template>
  <div class="dashboard-page">
    <div class="page-container">
      <PageLoading v-if="loading" />
      <ErrorState v-else-if="error" show-retry @retry="loadFeed" />
      <template v-else>
        <div class="welcome-card card">
          <div class="card-body welcome-body">
            <h2 class="welcome-title">欢迎回来，{{ userStore.displayName }}</h2>
            <p class="welcome-desc">今天是 {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }} · 祝您工作顺利</p>
          </div>
        </div>

        <div class="feed-grid">
          <section class="feed-section">
            <div class="section-header">
              <h3 class="section-title"><el-icon :size="16"><Notebook /></el-icon> 最新博客</h3>
              <router-link to="/blog" class="section-link">查看全部 &rarr;</router-link>
            </div>
            <div class="feed-list">
              <article v-for="post in recentBlogs" :key="post.id" class="feed-item card--hoverable">
                <router-link :to="`/blog/${post.id}`" class="feed-item-body">
                  <div class="feed-top">
                    <span class="feed-category">{{ post.category?.name }}</span>
                    <span class="feed-time">{{ formatRelativeTime(post.publishedAt) }}</span>
                  </div>
                  <h4 class="feed-item-title">{{ post.title }}</h4>
                  <p class="feed-item-desc">{{ truncateText(post.summary, 100) }}</p>
                  <div class="feed-item-meta">
                    <span>{{ post.author?.displayName }}</span>
                    <span>&middot;</span>
                    <span>{{ post.viewCount }} 阅读</span>
                    <span>&middot;</span>
                    <span>{{ post.likeCount }} 赞</span>
                  </div>
                </router-link>
              </article>
            </div>
          </section>

          <section class="feed-section">
            <div class="section-header">
              <h3 class="section-title"><el-icon :size="16"><FolderOpened /></el-icon> 最新资源</h3>
              <router-link to="/resource" class="section-link">查看全部 &rarr;</router-link>
            </div>
            <div class="feed-list">
              <article v-for="res in recentResources" :key="res.id" class="feed-item card--hoverable">
                <router-link :to="`/resource/${res.id}`" class="feed-item-body">
                  <div class="feed-top">
                    <span class="feed-type-badge" :class="`type-${res.type}`">
                      {{ ({ dataset: '数据集', software: '软件', model: '模型', paper: '论文', other: '其他' })[res.type] }}
                    </span>
                    <span class="feed-time">{{ formatRelativeTime(res.createdAt) }}</span>
                  </div>
                  <h4 class="feed-item-title">{{ res.title }}</h4>
                  <p class="feed-item-desc">{{ truncateText(res.description, 100) }}</p>
                  <div class="feed-item-meta">
                    <span>{{ res.downloadCount }} 下载</span>
                    <span>&middot;</span>
                    <span>{{ res.viewCount }} 查看</span>
                  </div>
                </router-link>
              </article>
            </div>
          </section>
        </div>

        <section class="notice-section card">
          <div class="card-body">
            <div class="section-header">
              <h3 class="section-title"><el-icon :size="16"><Bell /></el-icon> 最新通知</h3>
              <router-link to="/notice" class="section-link">查看全部 &rarr;</router-link>
            </div>
            <div v-for="n in recentNotices" :key="n.id" class="notice-item">
              <span class="notice-dot" :class="`dot-${n.level}`" />
              <div class="notice-content">
                <span class="notice-item-title">{{ n.title }}</span>
                <p class="notice-item-body">{{ truncateText(n.content, 80) }}</p>
              </div>
              <span class="notice-item-time">{{ formatRelativeTime(n.publishedAt) }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page { min-height: calc(100vh - 56px); padding-bottom: 40px; }

.welcome-card { margin-bottom: 24px; }
.welcome-body { padding: 28px 32px; }
.welcome-title { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
.welcome-desc { font-size: 13px; color: #868e96; }

.feed-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.feed-section { min-width: 0; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-size: 15px; font-weight: 600; color: #212529; display: flex; align-items: center; gap: 6px; }
.section-link { font-size: 12px; color: #4c6ef5; text-decoration: none; &:hover { text-decoration: underline; } }

.feed-list { display: flex; flex-direction: column; gap: 8px; }
.feed-item-body { display: block; padding: 16px 20px; text-decoration: none; color: inherit; }
.feed-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }

.feed-category { font-size: 11px; font-weight: 500; color: #4c6ef5; background: #eef2ff; padding: 1px 8px; border-radius: 4px; }
.feed-type-badge { font-size: 11px; font-weight: 500; padding: 1px 8px; border-radius: 4px;
  &.type-dataset { color: #2b8a3e; background: #ebfbee; }
  &.type-software { color: #1971c2; background: #e7f5ff; }
  &.type-model { color: #e67700; background: #fff9db; }
  &.type-paper { color: #c92a2a; background: #fff5f5; } }
.feed-time { font-size: 11px; color: #adb5bd; }

.feed-item-title { font-size: 14px; font-weight: 500; color: #212529; margin-bottom: 4px; line-height: 1.4; }
.feed-item-desc { font-size: 12px; color: #868e96; margin-bottom: 6px; line-height: 1.5; }
.feed-item-meta { display: flex; gap: 6px; font-size: 11px; color: #adb5bd; }

.notice-section { margin-bottom: 24px; }
.notice-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f3f5;
  &:last-child { border-bottom: none; } }
.notice-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
  &.dot-info { background: #339af0; } &.dot-warning { background: #f59f00; } &.dot-important, &.dot-urgent { background: #fa5252; } }
.notice-content { flex: 1; min-width: 0; }
.notice-item-title { font-size: 13px; color: #495057; }
.notice-item-body { font-size: 12px; color: #adb5bd; margin-top: 2px; }
.notice-item-time { font-size: 11px; color: #adb5bd; flex-shrink: 0; white-space: nowrap; }
</style>
