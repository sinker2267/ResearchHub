<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import { useUserStore } from '@/stores/user'
import { resourceApi } from '@/api'
import { PERMISSIONS, PAGINATION_DEFAULTS } from '@/constants'
import BlogCard from '@/components/blog/BlogCard.vue'
import PageLoading from '@/components/common/PageLoading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { Edit } from '@element-plus/icons-vue'
import type { BlogListParams, Category, Tag } from '@/types'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const userStore = useUserStore()

const loading = ref(true)
const error = ref(false)
const keyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')
const selectedSort = ref<'latest' | 'popular'>('latest')
const currentPage = ref(1)
const pageSize = PAGINATION_DEFAULTS.PAGE_SIZE

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const queryParams = computed<BlogListParams>(() => ({
  page: currentPage.value,
  pageSize,
  category: selectedCategory.value || undefined,
  tag: selectedTag.value || undefined,
  keyword: keyword.value || undefined,
  sort: selectedSort.value,
}))

async function loadPosts(): Promise<void> {
  loading.value = true
  error.value = false
  try {
    await blogStore.fetchPosts(queryParams.value)
  blogStore.posts.sort((a, b) => { if (a.isPinned && !b.isPinned) return -1; if (!a.isPinned && b.isPinned) return 1; return 0; })
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function handleSearch(): void {
  currentPage.value = 1
  
}

function handlePageChange(page: number): void {
  currentPage.value = page
  
}

function handleCreate(): void {
  router.push('/blog/create')
}

watch([selectedCategory, selectedTag, selectedSort], () => {
  currentPage.value = 1
  
})

async function loadMeta() { const [c, t] = await Promise.all([resourceApi.getCategories(), resourceApi.getTags()]); categories.value = c.data; tags.value = t.data }
onMounted(async () => { await loadMeta(); loadPosts() })
onMounted(() => {
  if (route.query.q) {
    keyword.value = route.query.q as string
  }
  
})
</script>

<template>
  <div class="blog-list-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">博客</h2>
          <p class="page-desc">科研知识分享与交流</p>
        </div>
        <button
          v-if="userStore.hasPermission(PERMISSIONS.BLOG_CREATE)"
          class="btn-create"
          @click="handleCreate"
        >
          <el-icon :size="16"><Edit /></el-icon>
          写文章
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-row">
          <el-input
            v-model="keyword"
            placeholder="搜索文章..."
            clearable
            class="filter-search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-select
            v-model="selectedCategory"
            placeholder="全部分类"
            clearable
            class="filter-select"
          >
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.slug" />
          </el-select>
          <el-select
            v-model="selectedTag"
            placeholder="全部标签"
            clearable
            class="filter-select"
          >
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.slug" />
          </el-select>
          <el-radio-group v-model="selectedSort" size="small">
            <el-radio-button value="latest">最新</el-radio-button>
            <el-radio-button value="popular">热门</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- Content -->
      <PageLoading v-if="loading" />
      <ErrorState v-else-if="error" show-retry @retry="loadPosts" />
      <template v-else>
        <EmptyState
          v-if="blogStore.posts.length === 0"
          title="暂无文章"
          description="还没有发布任何文章，快来写第一篇吧"
          :action-label="userStore.hasPermission(PERMISSIONS.BLOG_CREATE) ? '写文章' : undefined"
          @action="handleCreate"
        />
        <div v-else class="blog-grid">
          <BlogCard v-for="post in blogStore.posts" :key="post.id" :post="post" />
        </div>

        <!-- Pagination -->
        <div v-if="blogStore.pagination.totalPages > 1" class="pagination-wrap">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="blogStore.pagination.total"
            background
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.blog-list-page { min-height: calc(100vh - 56px); }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: #868e96; }

.btn-create {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #4c6ef5;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
  &:hover { background: #4263eb; }
}

.filter-bar {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-search { width: 280px; }
.filter-select { width: 160px; }

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}
</style>
