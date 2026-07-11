<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import { useUserStore } from '@/stores/user'
import { formatDate, formatRelativeTime } from '@/utils'
import { PERMISSIONS } from '@/constants'
import { blogApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import PageLoading from '@/components/common/PageLoading.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Star, ChatDotRound, View, Share, Edit, Delete, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const userStore = useUserStore()

const loading = ref(true)
const error = ref(false)
const commentText = ref('')
const submitting = ref(false)

async function load(): Promise<void> {
  loading.value = true; error.value = false
  try {
    const id = Number(route.params.id)
    await Promise.all([blogStore.fetchPost(id), blogStore.fetchComments(id), blogStore.fetchRecommendations(id)])
  } catch { error.value = true } finally { loading.value = false }
}

async function handleLike(): Promise<void> { if (blogStore.currentPost) await blogStore.toggleLike(blogStore.currentPost.id) }
async function handleFavorite(): Promise<void> { if (blogStore.currentPost) await blogStore.toggleFavorite(blogStore.currentPost.id) }

async function handleAddComment(): Promise<void> {
  if (!commentText.value.trim() || !blogStore.currentPost) return
  submitting.value = true
  try {
    const res = await mockAddComment(blogStore.currentPost.id, { content: commentText.value })
    blogStore.comments.unshift(res.data)
    if (blogStore.currentPost) blogStore.currentPost.commentCount++
    commentText.value = ''
  } finally { submitting.value = false }
}

function handleEdit(): void { router.push(`/blog/${blogStore.currentPost?.id}/edit`) }

async function handleDelete(): Promise<void> {
  if (!blogStore.currentPost) return
  try { await ElMessageBox.confirm('确定删除这篇文章？', '确认删除', { type: 'warning' }) } catch { return }
  try { await blogApi.delete(blogStore.currentPost.id); ElMessage.success('已删除'); router.push('/blog') } catch { ElMessage.error('删除失败') }
}

onMounted(() => { load() })
</script>

<template>
  <div class="blog-detail-page">
    <PageLoading v-if="loading" />
    <ErrorState v-else-if="error" show-retry @retry="load" />
    <template v-else-if="blogStore.currentPost">
      <div class="page-container--narrow">
        <div class="back-nav"><router-link to="/blog" class="back-link"><el-icon :size="16"><ArrowLeft /></el-icon> 返回博客列表</router-link></div>

        <article class="article">
          <header class="article-header">
            <span class="article-category">{{ blogStore.currentPost.category.name }}</span>
            <h1 class="article-title">{{ blogStore.currentPost.title }}</h1>
            <div class="article-meta">
              <div class="meta-left"><span class="meta-author">{{ blogStore.currentPost.author.displayName }}</span><span class="meta-sep">·</span><span class="meta-time">{{ formatDate(blogStore.currentPost.publishedAt, 'full') }}</span></div>
              <div class="meta-right"><span class="meta-stat"><el-icon :size="15"><View /></el-icon> {{ blogStore.currentPost.viewCount }}</span></div>
            </div>
          </header>

          <div class="article-body"><MarkdownRenderer :content="blogStore.currentPost.content" /></div>

          <div v-if="blogStore.currentPost.tags.length" class="article-tags">
            <span>标签：</span><span v-for="tag in blogStore.currentPost.tags" :key="tag.id" class="tag-chip">{{ tag.name }}</span>
          </div>

          <div class="actions-bar">
            <button class="action-btn" :class="{ active: blogStore.currentPost.isLiked }" @click="handleLike"><el-icon :size="16"><Star /></el-icon> {{ blogStore.currentPost.isLiked ? '已点赞' : '点赞' }} ({{ blogStore.currentPost.likeCount }})</button>
            <button class="action-btn" :class="{ active: blogStore.currentPost.isFavorited }" @click="handleFavorite">{{ blogStore.currentPost.isFavorited ? '★ 已收藏' : '☆ 收藏' }}</button>
            <button class="action-btn"><el-icon :size="16"><Share /></el-icon> 分享</button>
            <button v-if="userStore.hasPermission(PERMISSIONS.BLOG_EDIT)" class="action-btn" @click="handleEdit"><el-icon :size="16"><Edit /></el-icon> 编辑</button>
            <button v-if="userStore.hasPermission(PERMISSIONS.BLOG_DELETE)" class="action-btn danger-btn" @click="handleDelete"><el-icon :size="16"><Delete /></el-icon> 删除</button>
          </div>
        </article>

        <section class="comments-section">
          <h3 class="section-heading"><el-icon :size="18"><ChatDotRound /></el-icon> 评论 ({{ blogStore.currentPost.commentCount }})</h3>
          <div class="comment-form">
            <el-input v-model="commentText" type="textarea" :rows="3" placeholder="写下你的评论..." maxlength="1000" show-word-limit />
            <div class="comment-form-actions"><button class="btn-submit" :disabled="!commentText.trim()" @click="handleAddComment">发表评论</button></div>
          </div>
          <div v-if="blogStore.comments.length" class="comment-list">
            <div v-for="comment in blogStore.comments" :key="comment.id" class="comment-item">
              <div class="comment-header"><span class="comment-author">{{ comment.author.displayName }}</span><span class="comment-time">{{ formatRelativeTime(comment.createdAt) }}</span></div>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
          <EmptyState v-else title="暂无评论" />
        </section>

        <section v-if="blogStore.recommendations.length" class="recommendations-section">
          <h3 class="section-heading">相关推荐</h3>
          <div class="rec-grid"><BlogCard v-for="rec in blogStore.recommendations" :key="rec.id" :post="rec" /></div>
        </section>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.blog-detail-page { min-height: calc(100vh - 56px); padding: 32px 0; }
.back-nav { margin-bottom: 20px; }
.back-link { font-size: 13px; color: #6c757d; text-decoration: none; display: flex; align-items: center; gap: 4px; &:hover { color: #212529; } }

.article { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
.article-header { padding: 32px 40px 24px; border-bottom: 1px solid #f1f3f5; }
.article-category { display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 500; color: #4c6ef5; background: #eef2ff; border-radius: 4px; margin-bottom: 12px; }
.article-title { font-size: 26px; font-weight: 700; color: #212529; line-height: 1.4; margin-bottom: 16px; }
.article-meta { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #868e96; }
.meta-left { display: flex; align-items: center; gap: 6px; }
.meta-author { color: #495057; font-weight: 500; }
.meta-stat { display: flex; align-items: center; gap: 4px; }

.article-body { padding: 40px; }
.article-tags { padding: 0 40px 24px; font-size: 13px; color: #868e96; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.tag-chip { padding: 2px 10px; font-size: 11px; color: #495057; background: #f1f3f5; border-radius: 4px; }

.actions-bar { display: flex; gap: 8px; padding: 16px 40px; border-top: 1px solid #f1f3f5; }
.action-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; font-size: 13px; color: #6c757d; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; cursor: pointer;
  &:hover { background: #f1f3f5; color: #212529; }
  &.active { color: #4c6ef5; background: #eef2ff; border-color: #bac8ff; } }
.danger-btn { color: #fa5252 !important; background: #fff5f5 !important; border-color: #ffc9c9 !important; }

.comments-section, .recommendations-section { margin-top: 32px; }
.section-heading { font-size: 16px; font-weight: 600; color: #212529; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

.comment-form { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
.comment-form-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.btn-submit { padding: 8px 20px; background: #4c6ef5; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; } &:disabled { opacity: 0.5; cursor: not-allowed; } }

.comment-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { padding: 16px 20px; background: #fff; border: 1px solid #e9ecef; border-radius: 8px; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.comment-author { font-size: 13px; font-weight: 500; color: #212529; }
.comment-time { font-size: 11px; color: #adb5bd; }
.comment-content { font-size: 13px; color: #495057; line-height: 1.6; }

.rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
</style>
