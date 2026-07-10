<script setup lang="ts">
import { ref } from 'vue'
import { mockResources } from '@/mock/data'
import { formatDate } from '@/utils'
import type { Resource } from '@/types'

const resources = ref<Resource[]>(mockResources)

function getTypeLabel(type: string): string {
  const map: Record<string, string> = { dataset: '数据集', software: '软件', model: '模型', paper: '论文', other: '其他' }
  return map[type] || type
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">资源管理</h2>
      <button class="btn-create">+ 上传资源</button>
    </div>
    <div class="card table-card">
      <div class="card-body">
        <el-table :data="resources" stripe size="small">
          <el-table-column prop="title" label="资源名称" min-width="200" />
          <el-table-column label="类型" width="80">
            <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
          </el-table-column>
          <el-table-column label="作者" width="100">
            <template #default="{ row }">{{ row.author.displayName }}</template>
          </el-table-column>
          <el-table-column prop="downloadCount" label="下载" width="70" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <span class="status-tag" :class="row.status">{{ row.status === 'published' ? '已发布' : row.status === 'draft' ? '草稿' : '已归档' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="110">
            <template #default="{ row }">{{ formatDate(row.createdAt, 'date') }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default>
              <button class="action-link">编辑</button>
              <button class="action-link danger">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; }
.btn-create { padding: 7px 16px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer; &:hover { background: #4263eb; } }
.table-card { overflow: hidden; }
.status-tag {
  font-size: 11px; padding: 1px 6px; border-radius: 4px;
  &.published { color: #2b8a3e; background: #ebfbee; }
  &.draft { color: #e67700; background: #fff9db; }
  &.archived { color: #868e96; background: #f1f3f5; }
}
.action-link { border: none; background: transparent; font-size: 12px; color: #4c6ef5; cursor: pointer; margin-right: 8px; &:hover { text-decoration: underline; }
  &.danger { color: #fa5252; } }
</style>
