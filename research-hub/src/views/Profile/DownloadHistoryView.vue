<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatFileSize, formatDate } from '@/utils'
import PageLoading from '@/components/common/PageLoading.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { Download } from '@element-plus/icons-vue'

const loading = ref(true)
const records = ref<{ id: number; resourceTitle: string; resourceId: number; fileName: string; fileSize: number; downloadedAt: string }[]>([])

async function load(): Promise<void> {
  loading.value = true
  await new Promise((r) => setTimeout(r, 300))
  records.value = [
    { id: 1, resourceTitle: 'Human Protein Atlas v23 数据集', resourceId: 101, fileName: 'hpa_v23_normal_tissue.h5', fileSize: 2.4 * 1024 * 1024 * 1024, downloadedAt: '2026-07-09T10:30:00Z' },
    { id: 2, resourceTitle: 'MolDock Pro — 分子对接分析工具包', resourceId: 102, fileName: 'moldock_pro_v2.1.0_linux.tar.gz', fileSize: 156 * 1024 * 1024, downloadedAt: '2026-07-07T16:20:00Z' },
    { id: 3, resourceTitle: 'scRNA-seq Benchmark 数据集', resourceId: 103, fileName: 'pbmc_10x_v3_filtered.h5ad', fileSize: 1.2 * 1024 * 1024 * 1024, downloadedAt: '2026-07-02T09:00:00Z' },
  ]
  loading.value = false
}

onMounted(() => { load() })
</script>

<template>
  <div class="dl-page">
    <div class="page-container--narrow">
      <h2 class="page-title">下载历史</h2>
      <PageLoading v-if="loading" />
      <EmptyState v-else-if="records.length === 0" title="暂无下载记录" />
      <div v-else class="dl-list">
        <div v-for="rec in records" :key="rec.id" class="dl-item card--hoverable">
          <router-link :to="`/resource/${rec.resourceId}`" class="dl-link">
            <div class="dl-body">
              <div class="dl-icon"><el-icon :size="20"><Download /></el-icon></div>
              <div class="dl-info">
                <h4 class="dl-resource">{{ rec.resourceTitle }}</h4>
                <p class="dl-file">{{ rec.fileName }} · {{ formatFileSize(rec.fileSize) }}</p>
              </div>
              <span class="dl-time">{{ formatDate(rec.downloadedAt, 'date') }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dl-page { min-height: calc(100vh - 56px); padding: 24px 0; }
.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 24px; }

.dl-list { display: flex; flex-direction: column; gap: 8px; }
.dl-link { text-decoration: none; color: inherit; display: block; }
.dl-body { padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
.dl-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #eef2ff; color: #4c6ef5; border-radius: 8px; flex-shrink: 0; }
.dl-info { flex: 1; min-width: 0; }
.dl-resource { font-size: 14px; font-weight: 500; color: #212529; margin-bottom: 2px; }
.dl-file { font-size: 12px; color: #868e96; }
.dl-time { font-size: 12px; color: #adb5bd; flex-shrink: 0; }
</style>
