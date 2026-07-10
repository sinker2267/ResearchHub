<script setup lang="ts">
import { ref } from 'vue'
import { formatDate } from '@/utils'
import type { OperationLog } from '@/types'

const logs = ref<OperationLog[]>([
  { id: 1, userId: 1, username: 'admin', action: '登录', resource: '系统', detail: '用户登录成功', ip: '192.168.1.100', createdAt: '2026-07-10T08:30:00Z' },
  { id: 2, userId: 1, username: 'admin', action: '创建', resource: '博客', detail: '创建文章：AlphaFold3最新功能解读', ip: '192.168.1.100', createdAt: '2026-07-09T08:30:00Z' },
  { id: 3, userId: 2, username: 'liming', action: '下载', resource: '资源', detail: '下载文件：hpa_v23_normal_tissue.h5', ip: '192.168.1.101', createdAt: '2026-07-09T10:30:00Z' },
  { id: 4, userId: 1, username: 'admin', action: '更新', resource: '系统设置', detail: '更新站点标题为 ResearchHub', ip: '192.168.1.100', createdAt: '2026-07-08T14:00:00Z' },
  { id: 5, userId: 2, username: 'liming', action: '创建', resource: '博客', detail: '创建文章：单细胞RNA测序数据质控', ip: '192.168.1.101', createdAt: '2026-07-05T14:20:00Z' },
  { id: 6, userId: 3, username: 'wangfang', action: '登录', resource: '系统', detail: '用户登录成功', ip: '192.168.1.102', createdAt: '2026-07-04T09:15:00Z' },
])

function getActionColor(action: string): string {
  const map: Record<string, string> = { '创建': '#40c057', '更新': '#4c6ef5', '删除': '#fa5252', '下载': '#339af0', '登录': '#868e96' }
  return map[action] || '#868e96'
}
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">操作日志</h2>
    <div class="card table-card">
      <div class="card-body">
        <el-table :data="logs" stripe size="small">
          <el-table-column prop="username" label="用户" width="100" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <span class="action-badge" :style="{ color: getActionColor(row.action), background: getActionColor(row.action) + '15' }">
                {{ row.action }}
              </span>
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
.action-badge {
  font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 4px;
}
</style>
