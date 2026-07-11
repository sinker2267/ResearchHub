<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { User, Notebook, FolderOpened, Bell } from '@element-plus/icons-vue'

const userStore = useUserStore()
const stats = ref({ users: 0, blogs: 0, resources: 0, notices: 0 })
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await adminApi.getDashboardStats()
    stats.value = res.data as any
  } finally { loading.value = false }
}

onMounted(() => { load() })
</script>

<template>
  <div class="admin-dashboard">
    <h2 class="admin-page-title">管理概览</h2>
    <p class="admin-page-subtitle">欢迎回来，{{ userStore.displayName }}</p>

    <div class="stats-grid" v-loading="loading">
      <div class="stat-card card">
        <div class="card-body stat-body">
          <div class="stat-icon" style="background:#eef2ff;color:#4c6ef5"><el-icon :size="22"><User /></el-icon></div>
          <div class="stat-info"><p class="stat-value">{{ stats.users }}</p><p class="stat-label">用户数</p></div>
        </div>
      </div>
      <div class="stat-card card">
        <div class="card-body stat-body">
          <div class="stat-icon" style="background:#ebfbee;color:#40c057"><el-icon :size="22"><Notebook /></el-icon></div>
          <div class="stat-info"><p class="stat-value">{{ stats.blogs }}</p><p class="stat-label">博客</p></div>
        </div>
      </div>
      <div class="stat-card card">
        <div class="card-body stat-body">
          <div class="stat-icon" style="background:#fff9db;color:#f59f00"><el-icon :size="22"><FolderOpened /></el-icon></div>
          <div class="stat-info"><p class="stat-value">{{ stats.resources }}</p><p class="stat-label">资源</p></div>
        </div>
      </div>
      <div class="stat-card card">
        <div class="card-body stat-body">
          <div class="stat-icon" style="background:#e7f5ff;color:#339af0"><el-icon :size="22"><Bell /></el-icon></div>
          <div class="stat-info"><p class="stat-value">{{ stats.notices }}</p><p class="stat-label">通知</p></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-dashboard { }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; margin-bottom: 4px; }
.admin-page-subtitle { font-size: 13px; color: #868e96; margin-bottom: 24px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-body { display: flex; align-items: center; gap: 16px; padding: 20px; }
.stat-icon { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.stat-value { font-size: 22px; font-weight: 700; color: #212529; }
.stat-label { font-size: 12px; color: #868e96; }
</style>
