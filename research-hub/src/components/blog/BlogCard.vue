<script setup lang="ts">
import type { BlogPost } from '@/types'
import { formatRelativeTime } from '@/utils'
import { ChatDotRound, View, Star } from '@element-plus/icons-vue'

defineProps<{ post: BlogPost }>()
</script>

<template>
  <article class="blog-card card--hoverable">
    <router-link :to="`/blog/${post.id}`" class="blog-card-link">
      <div class="blog-card-body">
        <div class="blog-card-category">
          <span v-if="post.isPinned" class="pinned-badge">📌 置顶</span>
          <span class="category-badge">{{ post.category.name }}</span>
        </div>
        <h3 class="blog-card-title">{{ post.title }}</h3>
        <p class="blog-card-summary">{{ post.summary }}</p>
        <div class="blog-card-meta">
          <div class="blog-card-author">
            <span class="author-name">{{ post.author.displayName }}</span>
            <span class="meta-sep">·</span>
            <span class="post-time">{{ formatRelativeTime(post.publishedAt) }}</span>
          </div>
          <div class="blog-card-stats">
            <span class="stat-item"><el-icon :size="14"><Star /></el-icon> {{ post.likeCount }}</span>
            <span class="stat-item"><el-icon :size="14"><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
            <span class="stat-item"><el-icon :size="14"><View /></el-icon> {{ post.viewCount }}</span>
          </div>
        </div>
        <div v-if="post.tags.length > 0" class="blog-card-tags">
          <span v-for="tag in post.tags.slice(0, 3)" :key="tag.id" class="tag-chip">
            {{ tag.name }}
          </span>
        </div>
      </div>
    </router-link>
  </article>
</template>

<style lang="scss" scoped>
.blog-card-link { text-decoration: none; color: inherit; display: block; }
.blog-card-body { padding: 20px 24px; }

.blog-card-category { margin-bottom: 10px; }
.pinned-badge { display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 500; color: #e67700; background: #fff9db; border-radius: 4px; margin-right: 6px; }
.category-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  color: #4c6ef5;
  background: #eef2ff;
  border-radius: 4px;
}

.blog-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-summary {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.blog-card-author {
  font-size: 12px;
  color: #868e96;
}

.author-name { color: #495057; font-weight: 500; }
.meta-sep { margin: 0 6px; }

.blog-card-stats {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #adb5bd;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.blog-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  color: #495057;
  background: #f1f3f5;
  border-radius: 4px;
}
</style>
