<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'
import type { OperationLog } from '@/types'

const logs = ref<OperationLog[]>([])
const loading = ref(true)

function getActionColor(action: string): string {
  const map: Record<string, string> = { '创建': '#40c057', '更新': '#4c6ef5', '删除': '#fa5252', '下载': '#339af0', '登录': '#868e96' }
  return map[action] || '#868e96'
}

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await adminApi.getLogs({ page: 1, pageSize: 100 })
    logs.value = res.data.data
  } finally { loading.value = false }
}

onMounted(() => { load() })
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">操作日志</h2>
    <div class="card table-card">
      <div class="card-body">
        <el-table :data="logs" stripe size="small" v-loading="loading">
          <el-table-column prop="username" label="用户" width="100" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <span class="action-badge" :style="{ color: getActionColor(row.action), background: getActionColor(row.action) + '15' }">{{ row.action }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="resource" label="资源" width="90" />
          <el-table-column prop="detail" label="详情" min-width="280" />
          <el-table-column prop="ip" label="IP地址" width="140" />
          <el-table-column label="时间" width="160">
            <template #default="{ row }">{{ formatDate(row.createdAt, 'full') }}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; margin-bottom: 20px; }
.table-card { overflow: hidden; }
.action-badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 4px; }
</style>
