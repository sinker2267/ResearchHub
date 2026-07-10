<script setup lang="ts">
import { ref } from 'vue'
import type { Role } from '@/types'
import { mockUsers } from '@/mock/data'

const roles = ref<Role[]>([
  { id: 1, name: '系统管理员', code: 'admin', description: '拥有所有权限，管理整个平台', permissions: [
    { id: 1, name: '管理后台', code: 'admin:access', resource: 'admin', action: 'access' },
    { id: 2, name: '用户管理', code: 'admin:user:manage', resource: 'admin', action: 'user' },
    { id: 3, name: '角色管理', code: 'admin:role:manage', resource: 'admin', action: 'role' },
    { id: 4, name: '博客管理', code: 'blog:create', resource: 'blog', action: 'create' },
  ]},
  { id: 2, name: '普通用户', code: 'user', description: '基本访问权限，可浏览和下载资源', permissions: [
    { id: 5, name: '查看博客', code: 'blog:view', resource: 'blog', action: 'view' },
    { id: 6, name: '资源下载', code: 'resource:download', resource: 'resource', action: 'download' },
    { id: 7, name: '查看通知', code: 'notice:view', resource: 'notice', action: 'view' },
  ]},
  { id: 3, name: '内容编辑', code: 'editor', description: '可发布和管理内容', permissions: [
    { id: 8, name: '创建博客', code: 'blog:create', resource: 'blog', action: 'create' },
    { id: 9, name: '编辑博客', code: 'blog:edit', resource: 'blog', action: 'edit' },
    { id: 10, name: '创建资源', code: 'resource:create', resource: 'resource', action: 'create' },
  ]},
])

const userCount = (roleCode: string) => mockUsers.filter((u) => u.roles.some((r) => r.code === roleCode)).length
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">角色管理</h2>
      <button class="btn-create">+ 新建角色</button>
    </div>

    <div class="role-grid">
      <div v-for="role in roles" :key="role.id" class="role-card card">
        <div class="card-body">
          <div class="role-top">
            <h3 class="role-name">{{ role.name }}</h3>
            <span class="role-code">{{ role.code }}</span>
          </div>
          <p class="role-desc">{{ role.description }}</p>
          <div class="role-stats">
            <span class="role-stat">{{ userCount(role.code) }} 个用户</span>
            <span class="role-stat">{{ role.permissions.length }} 项权限</span>
          </div>
          <div class="role-perms">
            <span v-for="perm in role.permissions" :key="perm.id" class="perm-tag">{{ perm.name }}</span>
          </div>
          <div class="role-actions">
            <button class="btn-edit">编辑</button>
            <button class="btn-delete" v-if="role.code !== 'admin'">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; }

.btn-create {
  padding: 7px 16px; font-size: 13px; font-weight: 500; color: #fff;
  background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover { background: #4263eb; }
}

.role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.role-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.role-name { font-size: 16px; font-weight: 600; }
.role-code { font-size: 12px; color: #868e96; background: #f1f3f5; padding: 2px 8px; border-radius: 4px; }
.role-desc { font-size: 13px; color: #6c757d; margin-bottom: 12px; line-height: 1.5; }
.role-stats { display: flex; gap: 20px; margin-bottom: 12px; }
.role-stat { font-size: 12px; color: #adb5bd; }
.role-perms { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.perm-tag {
  font-size: 11px; color: #4c6ef5; background: #eef2ff; padding: 2px 8px; border-radius: 4px;
}
.role-actions { display: flex; gap: 8px; }
.btn-edit {
  padding: 5px 14px; font-size: 12px; color: #495057;
  background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer;
  &:hover { background: #e9ecef; }
}
.btn-delete {
  padding: 5px 14px; font-size: 12px; color: #fa5252;
  background: #fff; border: 1px solid #ffc9c9; border-radius: 5px; cursor: pointer;
  &:hover { background: #fff5f5; }
}
</style>
