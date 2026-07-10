<script setup lang="ts">
import { ref } from 'vue'
import { PERMISSIONS } from '@/constants'

interface PermGroup { resource: string; label: string; items: { code: string; label: string }[] }

const groups = ref<PermGroup[]>([
  { resource: 'blog', label: '博客', items: [
    { code: PERMISSIONS.BLOG_VIEW, label: '查看博客' },
    { code: PERMISSIONS.BLOG_CREATE, label: '创建博客' },
    { code: PERMISSIONS.BLOG_EDIT, label: '编辑博客' },
    { code: PERMISSIONS.BLOG_DELETE, label: '删除博客' },
    { code: PERMISSIONS.BLOG_PUBLISH, label: '发布博客' },
  ]},
  { resource: 'resource', label: '资源', items: [
    { code: PERMISSIONS.RESOURCE_VIEW, label: '查看资源' },
    { code: PERMISSIONS.RESOURCE_CREATE, label: '创建资源' },
    { code: PERMISSIONS.RESOURCE_EDIT, label: '编辑资源' },
    { code: PERMISSIONS.RESOURCE_DELETE, label: '删除资源' },
    { code: PERMISSIONS.RESOURCE_DOWNLOAD, label: '下载资源' },
  ]},
  { resource: 'notice', label: '通知', items: [
    { code: PERMISSIONS.NOTICE_VIEW, label: '查看通知' },
    { code: PERMISSIONS.NOTICE_CREATE, label: '创建通知' },
    { code: PERMISSIONS.NOTICE_MANAGE, label: '管理通知' },
  ]},
  { resource: 'admin', label: '后台管理', items: [
    { code: PERMISSIONS.ADMIN_ACCESS, label: '访问后台' },
    { code: PERMISSIONS.USER_MANAGE, label: '用户管理' },
    { code: PERMISSIONS.ROLE_MANAGE, label: '角色管理' },
    { code: PERMISSIONS.PERMISSION_MANAGE, label: '权限管理' },
    { code: PERMISSIONS.RESOURCE_MANAGE, label: '资源管理' },
    { code: PERMISSIONS.LOG_VIEW, label: '查看日志' },
    { code: PERMISSIONS.SETTING_MANAGE, label: '系统设置' },
  ]},
])
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">权限管理</h2>
    <p class="admin-desc">所有系统权限列表，按资源模块分组展示。</p>

    <div class="perm-grid">
      <div v-for="group in groups" :key="group.resource" class="perm-group card">
        <div class="card-body">
          <h3 class="group-name">{{ group.label }}</h3>
          <div class="perm-list">
            <div v-for="perm in group.items" :key="perm.code" class="perm-row">
              <span class="perm-label">{{ perm.label }}</span>
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
