<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '@/stores/resource'
import { useUserStore } from '@/stores/user'
import { formatFileSize, formatDate } from '@/utils'
import { RESOURCE_TYPES, PERMISSIONS } from '@/constants'
import { ElMessage } from 'element-plus'
import PageLoading from '@/components/common/PageLoading.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { Download, Document, Clock, Files, View, ArrowLeft } from '@element-plus/icons-vue'
import { STORAGE_KEYS } from '@/constants'

const route = useRoute()
const resourceStore = useResourceStore()
const userStore = useUserStore()
const loading = ref(true)
const error = ref(false)

const types = RESOURCE_TYPES

async function load(): Promise<void> {
  loading.value = true; error.value = false
  try { await resourceStore.fetchResource(Number(route.params.id)) }
  catch { error.value = true } finally { loading.value = false }
}

async function handleDownload(fileId: number): Promise<void> {
  if (!resourceStore.currentResource) return
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const url = `/api/resources/${resourceStore.currentResource.id}/files/${fileId}/download`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = ''
    a.click()
    URL.revokeObjectURL(blobUrl)
  } catch {
    ElMessage.error('下载失败')
  }
}

onMounted(() => { load() })
</script>

<template>
  <div class="resource-detail-page">
    <PageLoading v-if="loading" />
    <ErrorState v-else-if="error" show-retry @retry="load" />
    <template v-else-if="resourceStore.currentResource">
      <div class="page-container">
        <div class="back-nav">
          <router-link to="/resource" class="back-link">
            <el-icon :size="16"><ArrowLeft /></el-icon> 返回资源中心
          </router-link>
        </div>

        <div class="detail-header card">
          <div class="card-body header-body">
            <div class="res-type-badge" :class="`type-${resourceStore.currentResource.type}`">
              {{ types.find((t) => t.value === resourceStore.currentResource!.type)?.label }}
            </div>
            <h1 class="res-title">{{ resourceStore.currentResource.title }}</h1>
            <p class="res-desc">{{ resourceStore.currentResource.description }}</p>
            <div class="res-meta-row">
              <span>作者：{{ resourceStore.currentResource.author.displayName }}</span>
              <span>许可：{{ resourceStore.currentResource.license }}</span>
              <span>更新于 {{ formatDate(resourceStore.currentResource.updatedAt, 'date') }}</span>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-main">
            <section class="detail-section card">
              <div class="card-body">
                <h3 class="section-heading"><el-icon :size="18"><Files /></el-icon> 文件列表</h3>
                <div class="file-table">
                  <div class="file-header">
                    <span class="col-name">文件名</span>
                    <span class="col-size">大小</span>
                    <span class="col-dl">下载</span>
                  </div>
                  <div
                    v-for="file in resourceStore.currentResource.files"
                    :key="file.id"
                    class="file-row"
                  >
                    <span class="col-name"><el-icon :size="14"><Document /></el-icon> {{ file.filename }}</span>
                    <span class="col-size">{{ formatFileSize(file.size) }}</span>
                    <span class="col-dl">
                      <button
                        v-if="userStore.hasPermission(PERMISSIONS.RESOURCE_DOWNLOAD)"
                        class="dl-btn"
                        @click.stop="handleDownload(file.id)"
                      >
                        <el-icon :size="14"><Download /></el-icon>
                      </button>
                      <span v-else class="no-perm">—</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="resourceStore.currentResource.versions.length" class="detail-section card">
              <div class="card-body">
                <h3 class="section-heading"><el-icon :size="18"><Clock /></el-icon> 版本历史</h3>
                <div class="version-list">
                  <div v-for="ver in resourceStore.currentResource.versions" :key="ver.id" class="version-item">
                    <div class="ver-header">
                      <span class="ver-tag">{{ ver.version }}</span>
                      <span class="ver-time">{{ formatDate(ver.createdAt, 'date') }}</span>
                    </div>
                    <p class="ver-changelog">{{ ver.changelog }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside class="detail-sidebar">
            <div class="card">
              <div class="card-body">
                <h4 class="sidebar-section-title">统计</h4>
                <div class="stat-list">
                  <div class="stat-item">
                    <el-icon :size="16"><View /></el-icon>
                    <span class="stat-label">查看</span>
                    <span class="stat-value">{{ resourceStore.currentResource.viewCount }}</span>
                  </div>
                  <div class="stat-item">
                    <el-icon :size="16"><Download /></el-icon>
                    <span class="stat-label">下载</span>
                    <span class="stat-value">{{ resourceStore.currentResource.downloadCount }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="resourceStore.currentResource.citation" class="card citation-card">
              <div class="card-body">
                <h4 class="sidebar-section-title">引用方式</h4>
                <p class="citation-text">{{ resourceStore.currentResource.citation }}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.resource-detail-page { min-height: calc(100vh - 56px); padding: 24px 0; }

.back-nav { margin-bottom: 20px; }
.back-link { font-size: 13px; color: #6c757d; text-decoration: none; display: flex; align-items: center; gap: 4px;
  &:hover { color: #212529; } }

.detail-header { margin-bottom: 24px; }
.header-body { padding: 28px 32px; }

.res-type-badge {
  display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 500; border-radius: 4px; margin-bottom: 12px;
  &.type-dataset { color: #2b8a3e; background: #ebfbee; }
  &.type-software { color: #1971c2; background: #e7f5ff; }
  &.type-model { color: #e67700; background: #fff9db; }
  &.type-paper { color: #c92a2a; background: #fff5f5; }
  &.type-other { color: #495057; background: #f1f3f5; }
}

.res-title { font-size: 22px; font-weight: 700; color: #212529; margin-bottom: 12px; }
.res-desc { font-size: 14px; color: #495057; line-height: 1.7; margin-bottom: 16px; }
.res-meta-row { display: flex; gap: 24px; font-size: 12px; color: #868e96; }

.detail-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
.detail-main { min-width: 0; }

.detail-section { margin-bottom: 20px; }
.section-heading { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

.file-table { font-size: 13px; }
.file-header {
  display: grid; grid-template-columns: 1fr 100px 80px; gap: 16px;
  padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: 500; color: #868e96;
}
.file-row {
  display: grid; grid-template-columns: 1fr 100px 80px; gap: 16px;
  padding: 10px 0; border-bottom: 1px solid #f1f3f5; align-items: center;
}
.col-name { display: flex; align-items: center; gap: 6px; color: #212529; }
.col-size { font-size: 12px; color: #868e96; }
.dl-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; background: #eef2ff; color: #4c6ef5;
  border: none; border-radius: 6px; cursor: pointer;
  &:hover { background: #dbe4ff; }
}

.version-list { display: flex; flex-direction: column; gap: 12px; }
.version-item { padding: 12px 0; border-bottom: 1px solid #f1f3f5; &:last-child { border-bottom: none; } }
.ver-header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.ver-tag { font-size: 12px; font-weight: 600; color: #4c6ef5; background: #eef2ff; padding: 2px 8px; border-radius: 4px; }
.ver-time { font-size: 11px; color: #adb5bd; }
.ver-changelog { font-size: 13px; color: #6c757d; }

.sidebar-section-title { font-size: 13px; font-weight: 600; color: #212529; margin-bottom: 12px; }
.stat-list { display: flex; flex-direction: column; gap: 10px; }
.stat-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #495057; }
.stat-value { margin-left: auto; font-weight: 500; }

.citation-card { margin-top: 20px; }
.citation-text { font-size: 12px; color: #6c757d; line-height: 1.6; font-style: italic; }
</style>
