<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import type { Permission } from '@/types'

const permissions = ref<Permission[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await adminApi.getPermissions()
    permissions.value = res.data
  } finally { loading.value = false }
}

// Group by resource
function groupedPerms(): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const p of permissions.value) {
    if (!groups[p.resource]) groups[p.resource] = []
    groups[p.resource].push(p)
  }
  return groups
}

const groupLabels: Record<string, string> = {
  blog: '博客', resource: '资源', notice: '通知', admin: '后台管理',
}

onMounted(() => { load() })
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">权限管理</h2>
    <p class="admin-desc">所有系统权限列表，按资源模块分组展示。</p>

    <div class="perm-grid" v-loading="loading">
      <div v-for="(perms, resource) in groupedPerms()" :key="resource" class="perm-group card">
        <div class="card-body">
          <h3 class="group-name">{{ groupLabels[resource] || resource }}</h3>
          <div class="perm-list">
            <div v-for="perm in perms" :key="perm.id" class="perm-row">
              <span class="perm-label">{{ perm.name }}</span>
              <code class="perm-code">{{ perm.code }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; margin-bottom: 4px; }
.admin-desc { font-size: 13px; color: #868e96; margin-bottom: 24px; }

.perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.group-name { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 14px; }
.perm-list { display: flex; flex-direction: column; gap: 8px; }
.perm-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f3f5;
  &:last-child { border-bottom: none; } }
.perm-label { font-size: 13px; color: #495057; }
.perm-code { font-size: 11px; color: #868e96; background: #f1f3f5; padding: 2px 6px; border-radius: 4px; }
</style>
