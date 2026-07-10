<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { mockUsers, mockBlogs, mockResources, mockNotices } from '@/mock/data'
import { User, Notebook, FolderOpened, Bell, TrendCharts } from '@element-plus/icons-vue'

const userStore = useUserStore()

const stats = ref([
  { label: '用户数', value: mockUsers.length, icon: User, color: '#4c6ef5' },
  { label: '博客', value: mockBlogs.length, icon: Notebook, color: '#40c057' },
  { label: '资源', value: mockResources.length, icon: FolderOpened, color: '#f59f00' },
  { label: '通知', value: mockNotices.length, icon: Bell, color: '#339af0' },
])
</script>

<template>
  <div class="admin-dashboard">
    <h2 class="admin-page-title">管理概览</h2>
    <p class="admin-page-subtitle">欢迎回来，{{ userStore.displayName }}</p>

    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card card">
        <div class="card-body stat-body">
          <div class="stat-icon" :style="{ background: s.color + '15', color: s.color }">
            <el-icon :size="22"><component :is="s.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ s.value }}</p>
            <p class="stat-label">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="overview-grid">
      <div class="card">
        <div class="card-body">
          <h3 class="card-heading">最近用户</h3>
          <div class="user-list">
            <div v-for="u in mockUsers.slice(0, 5)" :key="u.id" class="user-row">
              <span class="user-name">{{ u.displayName }}</span>
              <span class="user-role">{{ u.roles[0]?.name || '普通用户' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <h3 class="card-heading">最新博客</h3>
          <div class="user-list">
            <div v-for="b in mockBlogs.slice(0, 5)" :key="b.id" class="user-row">
              <span class="user-name truncate">{{ b.title }}</span>
              <span class="user-role">{{ b.author.displayName }}</span>
            </div>
          </div>
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

.overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card-heading { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #212529; }

.user-list { display: flex; flex-direction: column; gap: 8px; }
.user-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f1f3f5;
  &:last-child { border-bottom: none; } }
.user-name { color: #495057; max-width: 200px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-role { font-size: 12px; color: #adb5bd; }
</style>
