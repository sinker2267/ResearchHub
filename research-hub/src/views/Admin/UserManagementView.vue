<script setup lang="ts">
import { ref } from 'vue'
import { mockUsers } from '@/mock/data'
import type { UserListItem } from '@/types'
import { formatDate } from '@/utils'

const users = ref<UserListItem[]>(mockUsers.map((u) => ({
  id: u.id, username: u.username, displayName: u.displayName,
  email: u.email, department: u.department, roles: u.roles,
  status: 'active' as const, lastLoginAt: '2026-07-10T08:00:00Z', createdAt: u.createdAt,
})))

const columns = [
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'displayName', label: '姓名', width: 100 },
  { prop: 'email', label: '邮箱', width: 180 },
  { prop: 'department', label: '部门', width: 160 },
  { prop: 'status', label: '状态', width: 80 },
  { prop: 'createdAt', label: '创建时间', width: 140 },
]
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">用户管理</h2>
    <div class="card table-card">
      <div class="card-body">
        <el-table :data="users" stripe style="width: 100%" size="small">
          <el-table-column prop="username" label="用户名" width="100" />
          <el-table-column prop="displayName" label="姓名" width="100" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="department" label="部门" min-width="150" />
          <el-table-column label="角色" width="120">
            <template #default="{ row }">
              <span v-for="r in row.roles" :key="r.id" class="role-tag">{{ r.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="70">
            <template #default="{ row }">
              <span class="status-dot" :class="row.status" />
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="120">
            <template #default="{ row }">{{ formatDate(row.createdAt, 'date') }}</template>
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
.role-tag {
  display: inline-block; padding: 1px 6px; margin-right: 4px;
  font-size: 11px; color: #4c6ef5; background: #eef2ff; border-radius: 4px;
}
.status-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px;
  &.active { background: #40c057; }
  &.disabled { background: #adb5bd; }
}
</style>
