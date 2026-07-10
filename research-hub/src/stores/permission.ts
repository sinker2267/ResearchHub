import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MenuItem } from '@/types'
import { useUserStore } from './user'
import { PERMISSIONS } from '@/constants'

export const usePermissionStore = defineStore('permission', () => {
  const userStore = useUserStore()
  const dynamicRoutesAdded = ref(false)

  // All registered menu items with required permissions
  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: '仪表盘', icon: 'HomeFilled', path: '/dashboard' },
    { id: 'blog', label: '博客', icon: 'Notebook', path: '/blog' },
    { id: 'resource', label: '资源', icon: 'FolderOpened', path: '/resource' },
    { id: 'notice', label: '通知', icon: 'Bell', path: '/notice' },
    {
      id: 'admin', label: '管理', icon: 'Setting', path: '/admin',
      permission: PERMISSIONS.ADMIN_ACCESS,
      children: [
        { id: 'admin-dashboard', label: '管理概览', icon: 'DataAnalysis', path: '/admin/dashboard', permission: PERMISSIONS.ADMIN_ACCESS },
        { id: 'admin-users', label: '用户管理', icon: 'User', path: '/admin/users', permission: PERMISSIONS.USER_MANAGE },
        { id: 'admin-roles', label: '角色管理', icon: 'Avatar', path: '/admin/roles', permission: PERMISSIONS.ROLE_MANAGE },
        { id: 'admin-permissions', label: '权限管理', icon: 'Lock', path: '/admin/permissions', permission: PERMISSIONS.PERMISSION_MANAGE },
        { id: 'admin-resources', label: '资源管理', icon: 'Files', path: '/admin/resources', permission: PERMISSIONS.RESOURCE_MANAGE },
        { id: 'admin-logs', label: '操作日志', icon: 'DocumentChecked', path: '/admin/logs', permission: PERMISSIONS.LOG_VIEW },
        { id: 'admin-tags', label: '标签管理', icon: 'CollectionTag', path: '/admin/tags', permission: PERMISSIONS.SETTING_MANAGE },
        { id: 'admin-categories', label: '分类管理', icon: 'Grid', path: '/admin/categories', permission: PERMISSIONS.SETTING_MANAGE },
        { id: 'admin-settings', label: '系统设置', icon: 'Tools', path: '/admin/settings', permission: PERMISSIONS.SETTING_MANAGE },
      ],
    },
  ]

  // Filter menu items based on current user's permissions
  const navMenuItems = computed<MenuItem[]>(() => {
    return allMenuItems
      .filter((item) => {
        if (!item.permission) return true
        return userStore.hasPermission(item.permission)
      })
      .map((item) => {
        if (!item.children) return item
        return {
          ...item,
          children: item.children.filter((child) => {
            if (!child.permission) return true
            return userStore.hasPermission(child.permission)
          }),
        }
      })
      .filter((item) => {
        // Remove parent if no visible children
        if (item.children && item.children.length === 0) return false
        return true
      })
  })

  // Sidebar menu items for admin layout
  const sidebarMenuItems = computed<MenuItem[]>(() => {
    const adminItem = navMenuItems.value.find((i) => i.id === 'admin')
    return adminItem?.children ?? []
  })

  function hasAccess(path: string): boolean {
    // Flatten all accessible paths
    const allPaths = navMenuItems.value.flatMap((item) => {
      const paths = [item.path]
      if (item.children) {
        paths.push(...item.children.map((c) => c.path))
      }
      return paths
    })
    return allPaths.includes(path)
  }

  return {
    dynamicRoutesAdded, allMenuItems, navMenuItems, sidebarMenuItems, hasAccess,
  }
})
