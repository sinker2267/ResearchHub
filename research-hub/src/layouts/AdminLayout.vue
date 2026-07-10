<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { usePermissionStore } from '@/stores/permission'
import { useSettingStore } from '@/stores/setting'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const settingStore = useSettingStore()

const sidebarItems = computed(() => permissionStore.sidebarMenuItems)

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <div class="admin-layout">
    <AppHeader />
    <div class="admin-body">
      <aside class="admin-sidebar" :class="{ collapsed: settingStore.sidebarCollapsed }">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in sidebarItems"
            :key="item.id"
            :to="item.path"
            class="sidebar-item"
            :class="{ active: isActive(item.path) }"
          >
            <span class="sidebar-label">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-body {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 56px);
}

.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 24px 0;
  border-right: 1px solid #e9ecef;
  background: #fff;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
}

.sidebar-item {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: #495057;
  text-decoration: none;
  border-radius: 6px;
  transition: all 150ms ease;

  &:hover {
    background: #f1f3f5;
    color: #212529;
  }

  &.active {
    background: #eef2ff;
    color: #4c6ef5;
    font-weight: 500;
  }
}

.admin-content {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
}
</style>
