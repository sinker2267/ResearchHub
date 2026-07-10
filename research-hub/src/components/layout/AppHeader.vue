<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElInput, ElBadge, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar } from 'element-plus'
import { Search, Plus, Bell, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useNoticeStore } from '@/stores/notice'
import { usePermissionStore } from '@/stores/permission'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const noticeStore = useNoticeStore()
const permissionStore = usePermissionStore()

const searchQuery = ref('')
const showCreateMenu = ref(false)

const createActions = computed(() => {
  const actions: { label: string; icon: string; path: string; show: boolean }[] = [
    { label: '写文章', icon: 'edit', path: '/blog/create', show: userStore.hasPermission('blog:create') },
    { label: '上传资源', icon: 'upload', path: '/resource/upload', show: userStore.hasPermission('resource:create') },
    { label: '发布公告', icon: 'notification', path: '/notice/create', show: userStore.hasPermission('notice:create') },
  ]
  return actions.filter((a) => a.show)
})

function handleSearch(): void {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

function goHome(): void {
  router.push('/dashboard')
}

function handleLogout(): void {
  userStore.logout()
  router.push('/login')
}

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="header-logo" @click="goHome">
          <span class="logo-icon">RH</span>
          <span class="logo-text">ResearchHub</span>
        </div>
        <nav class="header-nav">
          <router-link
            v-for="item in permissionStore.navMenuItems"
            :key="item.id"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章、资源..."
            :prefix-icon="Search"
            size="small"
            class="header-search"
            @keyup.enter="handleSearch"
          />
        </div>

        <el-dropdown v-if="createActions.length > 0" trigger="click">
          <button class="header-btn header-btn--primary">
            <el-icon :size="18"><Plus /></el-icon>
            <span class="btn-label">新增</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="action in createActions"
                :key="action.path"
                @click="router.push(action.path)"
              >
                {{ action.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link to="/notice" class="header-btn">
          <el-badge :value="noticeStore.unreadCount" :hidden="!noticeStore.hasUnread" :max="99">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
        </router-link>

        <el-dropdown trigger="click">
          <button class="header-btn header-btn--user">
            <el-avatar :size="28" :src="userStore.avatar" />
            <span class="btn-label">{{ userStore.displayName }}</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/profile')">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="router.push('/profile/favorites')">
                我的收藏
              </el-dropdown-item>
              <el-dropdown-item @click="router.push('/profile/downloads')">
                下载历史
              </el-dropdown-item>
              <el-dropdown-item
                v-if="userStore.hasPermission('admin:access')"
                @click="router.push('/admin/dashboard')"
                divided
              >
                后台管理
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 200;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #4c6ef5;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: 6px;
    letter-spacing: -0.5px;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: #212529;
  }
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;

  .nav-item {
    padding: 6px 12px;
    font-size: 13px;
    color: #6c757d;
    border-radius: 6px;
    transition: all 150ms ease;
    text-decoration: none;

    &:hover {
      color: #212529;
      background: #f1f3f5;
    }

    &.active {
      color: #212529;
      background: #f1f3f5;
    }

    &.router-link-active {
      color: #212529;
      background: #f1f3f5;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box {
  width: 260px;

  .header-search :deep(.el-input__wrapper) {
    background: #f1f3f5;
    border: 1px solid transparent;
    border-radius: 6px;
    box-shadow: none;
    transition: all 150ms ease;

    &:hover {
      background: #e9ecef;
    }

    &.is-focus {
      background: #fff;
      border-color: #4c6ef5;
      box-shadow: 0 0 0 1px rgba(76, 110, 245, 0.2);
    }
  }
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #495057;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;

  &:hover {
    background: #f1f3f5;
    color: #212529;
  }

  &--primary {
    background: #4c6ef5;
    color: #fff;

    &:hover {
      background: #4263eb;
      color: #fff;
    }
  }

  &--user {
    gap: 6px;
    padding: 4px 8px 4px 4px;
  }
}

.btn-label {
  font-size: 13px;
  font-weight: 500;
}
</style>
