<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useResourceStore } from '@/stores/resource'
import { resourceApi } from '@/api'
import { RESOURCE_TYPES, PAGINATION_DEFAULTS } from '@/constants'
import { formatFileSize, formatRelativeTime } from '@/utils'
import PageLoading from '@/components/common/PageLoading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { Download, View } from '@element-plus/icons-vue'
import type { ResourceType, Category, Tag } from '@/types'

const resourceStore = useResourceStore()
const loading = ref(true)
const error = ref(false)
const keyword = ref('')
const selectedType = ref<ResourceType | ''>('')
const selectedCategory = ref('')
const selectedTag = ref('')
const selectedSort = ref<'latest' | 'downloads'>('latest')
const currentPage = ref(1)
const pageSize = PAGINATION_DEFAULTS.PAGE_SIZE

const types = RESOURCE_TYPES
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const queryParams = computed(() => ({
  page: currentPage.value, pageSize,
  type: (selectedType.value || undefined) as ResourceType | undefined,
  category: selectedCategory.value || undefined,
  tag: selectedTag.value || undefined,
  keyword: keyword.value || undefined,
  sort: selectedSort.value,
}))

async function load(): Promise<void> {
  loading.value = true; error.value = false
  try { await resourceStore.fetchResources(queryParams.value) }
  catch { error.value = true } finally { loading.value = false }
}

watch([selectedType, selectedCategory, selectedTag, selectedSort], () => {
  currentPage.value = 1; load()
})

async function loadMeta() { const [c, t] = await Promise.all([resourceApi.getCategories(), resourceApi.getTags()]); categories.value = c.data; tags.value = t.data }
onMounted(async () => { await loadMeta(); load() })
onMounted(() => { load() })
</script>

<template>
  <div class="resource-list-page">
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2 class="page-title">资源中心</h2>
          <p class="page-desc">数据集、软件工具、模型等科研资源</p>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-row">
          <el-input v-model="keyword" placeholder="搜索资源..." clearable class="filter-search" @keyup.enter="load" @clear="load" />
          <el-select v-model="selectedType" placeholder="全部类型" clearable class="filter-select">
            <el-option v-for="t in types" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <el-select v-model="selectedCategory" placeholder="全部分类" clearable class="filter-select">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.slug" />
          </el-select>
          <el-radio-group v-model="selectedSort" size="small">
            <el-radio-button value="latest">最新</el-radio-button>
            <el-radio-button value="downloads">最多下载</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <PageLoading v-if="loading" />
      <ErrorState v-else-if="error" show-retry @retry="load" />
      <template v-else>
        <EmptyState v-if="resourceStore.resources.length === 0" title="暂无资源" />
        <div v-else class="resource-grid">
          <article v-for="res in resourceStore.resources" :key="res.id" class="resource-card card--hoverable">
            <router-link :to="`/resource/${res.id}`" class="resource-link">
              <div class="resource-card-body">
                <div class="res-type-badge" :class="`type-${res.type}`">
                  {{ types.find((t) => t.value === res.type)?.label || res.type }}
                </div>
                <h3 class="res-title">{{ res.title }}</h3>
                <p class="res-desc">{{ res.description }}</p>
                <div class="res-meta">
                  <span class="meta-stat"><el-icon :size="14"><Download /></el-icon> {{ res.downloadCount }}</span>
                  <span class="meta-stat"><el-icon :size="14"><View /></el-icon> {{ res.viewCount }}</span>
                  <span class="meta-time">{{ formatRelativeTime(res.createdAt) }}</span>
                </div>
              </div>
            </router-link>
          </article>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resource-list-page { min-height: calc(100vh - 56px); }

.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: #868e96; }

.filter-bar {
  margin-bottom: 24px; padding: 16px 20px;
  background: #fff; border: 1px solid #e9ecef; border-radius: 8px;
}
.filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filter-search { width: 280px; }
.filter-select { width: 160px; }

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.resource-link { text-decoration: none; color: inherit; display: block; }
.resource-card-body { padding: 20px; }

.res-type-badge {
  display: inline-block; padding: 2px 10px;
  font-size: 11px; font-weight: 500; border-radius: 4px; margin-bottom: 10px;
  &.type-dataset { color: #2b8a3e; background: #ebfbee; }
  &.type-software { color: #1971c2; background: #e7f5ff; }
  &.type-model { color: #e67700; background: #fff9db; }
  &.type-paper { color: #c92a2a; background: #fff5f5; }
  &.type-other { color: #495057; background: #f1f3f5; }
}

.res-title { font-size: 15px; font-weight: 600; color: #212529; line-height: 1.4; margin-bottom: 8px; }
.res-desc {
  font-size: 13px; color: #6c757d; line-height: 1.6; margin-bottom: 12px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.res-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; color: #adb5bd; }
.meta-stat { display: flex; align-items: center; gap: 3px; }
.meta-time { margin-left: auto; }
</style>
