<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import type { Role, Permission } from '@/types'

const roles = ref<Role[]>([])
const allPermissions = ref<Permission[]>([])
const loading = ref(true)

// Dialog
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ name: '', code: '', description: '', permIds: [] as number[] })

async function loadRoles(): Promise<void> {
  loading.value = true
  try {
    const [roleRes, permRes] = await Promise.all([
      adminApi.getRoles(),
      adminApi.getPermissions(),
    ])
    roles.value = roleRes.data
    allPermissions.value = permRes.data
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  isEdit.value = false; editId.value = null
  form.name = ''; form.code = ''; form.description = ''; form.permIds = []
  dialogVisible.value = true
}

function openEdit(role: Role): void {
  isEdit.value = true; editId.value = role.id
  form.name = role.name; form.code = role.code; form.description = role.description
  form.permIds = role.permissions?.map((p) => p.id) || []
  dialogVisible.value = true
}

async function handleSave(): Promise<void> {
  if (!form.name.trim()) { ElMessage.warning('请输入角色名称'); return }
  try {
    if (isEdit.value && editId.value) {
      await adminApi.updateRole(editId.value, { name: form.name, description: form.description, permissionIds: form.permIds } as any)
      ElMessage.success('角色更新成功')
    } else {
      await adminApi.createRole({ name: form.name, code: form.code, description: form.description, permissionIds: form.permIds } as any)
      ElMessage.success('角色创建成功')
    }
    dialogVisible.value = false
    await loadRoles()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(id: number, name: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除角色 "${name}"？`, '确认删除', { type: 'warning' })
    await adminApi.deleteRole(id)
    ElMessage.success('已删除')
    await loadRoles()
  } catch { /* cancelled */ }
}

function getPermName(id: number): string {
  return allPermissions.value.find((p) => p.id === id)?.name || ''
}

onMounted(() => { loadRoles() })
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">角色管理</h2>
      <button class="btn-create" @click="openCreate">+ 新建角色</button>
    </div>

    <div class="role-grid" v-loading="loading">
      <div v-for="role in roles" :key="role.id" class="role-card card">
        <div class="card-body">
          <div class="role-top">
            <h3 class="role-name">{{ role.name }}</h3>
            <span class="role-code">{{ role.code }}</span>
          </div>
          <p class="role-desc">{{ role.description }}</p>
          <div class="role-stats">
            <span class="role-stat">{{ role.permissions?.length || 0 }} 项权限</span>
          </div>
          <div class="role-perms">
            <span v-for="perm in (role.permissions || []).slice(0, 5)" :key="perm.id" class="perm-tag">{{ perm.name }}</span>
            <span v-if="(role.permissions || []).length > 5" class="perm-tag">+{{ role.permissions!.length - 5 }}</span>
          </div>
          <div class="role-actions">
            <button class="btn-edit" @click="openEdit(role)">编辑</button>
            <button class="btn-delete" v-if="role.code !== 'admin'" @click="handleDelete(role.id, role.name)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新建角色'" width="560px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.name" placeholder="如：内容编辑" />
        </el-form-item>
        <el-form-item label="角色编码" required v-if="!isEdit">
          <el-input v-model="form.code" placeholder="如：editor" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="角色说明..." />
        </el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="form.permIds">
            <div v-for="perm in allPermissions" :key="perm.id" style="margin-bottom:4px">
              <el-checkbox :value="perm.id">{{ perm.name }} <code style="font-size:11px;color:#adb5bd">{{ perm.code }}</code></el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; }
.btn-create { padding: 7px 16px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer; &:hover { background: #4263eb; } }

.role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.role-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.role-name { font-size: 16px; font-weight: 600; }
.role-code { font-size: 12px; color: #868e96; background: #f1f3f5; padding: 2px 8px; border-radius: 4px; }
.role-desc { font-size: 13px; color: #6c757d; margin-bottom: 12px; line-height: 1.5; }
.role-stats { display: flex; gap: 20px; margin-bottom: 12px; }
.role-stat { font-size: 12px; color: #adb5bd; }
.role-perms { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.perm-tag { font-size: 11px; color: #4c6ef5; background: #eef2ff; padding: 2px 8px; border-radius: 4px; }
.role-actions { display: flex; gap: 8px; }
.btn-edit { padding: 5px 14px; font-size: 12px; color: #495057; background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 5px; cursor: pointer; &:hover { background: #e9ecef; } }
.btn-delete { padding: 5px 14px; font-size: 12px; color: #fa5252; background: #fff; border: 1px solid #ffc9c9; border-radius: 5px; cursor: pointer; &:hover { background: #fff5f5; } }
</style>
