<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { mockGetProfile } from '@/mock'
import type { UserProfile } from '@/types'
import { formatDate } from '@/utils'
import PageLoading from '@/components/common/PageLoading.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import { User, Message, Star, Download } from '@element-plus/icons-vue'

const userStore = useUserStore()
const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref(false)

async function load(): Promise<void> {
  loading.value = true; error.value = false
  try { const res = await mockGetProfile(); profile.value = res.data }
  catch { error.value = true } finally { loading.value = false }
}

onMounted(() => { load() })
</script>

<template>
  <div class="profile-page">
    <PageLoading v-if="loading" />
    <ErrorState v-else-if="error" show-retry @retry="load" />
    <template v-else-if="profile">
      <div class="page-container--narrow">
        <!-- Profile card -->
        <div class="profile-card card">
          <div class="card-body profile-body">
            <div class="profile-avatar">
              <el-avatar :size="72" :src="profile.avatar">{{ profile.displayName[0] }}</el-avatar>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ profile.displayName }}</h2>
              <p class="profile-title">{{ profile.title }} · {{ profile.department }}</p>
              <p class="profile-bio">{{ profile.bio }}</p>
              <p class="profile-email">{{ profile.email }}</p>
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="profile-links">
          <router-link to="/profile/favorites" class="link-card card--hoverable">
            <el-icon :size="20"><Star /></el-icon>
            <span class="link-label">我的收藏</span>
            <span class="link-count">{{ profile.favorites.length }}</span>
          </router-link>
          <router-link to="/profile/downloads" class="link-card card--hoverable">
            <el-icon :size="20"><Download /></el-icon>
            <span class="link-label">下载历史</span>
            <span class="link-count">{{ profile.downloadHistory.length }}</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.profile-page { min-height: calc(100vh - 56px); padding: 32px 0; }

.profile-body {
  display: flex; gap: 24px;
  padding: 28px 32px;
}

.profile-name { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
.profile-title { font-size: 13px; color: #868e96; margin-bottom: 8px; }
.profile-bio { font-size: 13px; color: #495057; line-height: 1.6; margin-bottom: 8px; }
.profile-email { font-size: 12px; color: #adb5bd; }

.profile-links {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px;
}

.link-card {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 24px; text-decoration: none; color: inherit;
}
.link-label { font-size: 14px; font-weight: 500; }
.link-count { margin-left: auto; font-size: 13px; color: #868e96; }
</style>
