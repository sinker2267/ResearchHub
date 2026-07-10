<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'
import type { UserListItem, Role } from '@/types'

const users = ref<UserListItem[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)

const form = reactive({
  username: '',
  password: '',
  displayName: '',
  email: '',
  department: '',
  title: '',
  roleIds: [] as number[],
})

const allRoles = ref<Role[]>([])
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function loadUsers(): Promise<void> {
  loading.value = true
  try {
    const res = await adminApi.getUsers({ page: 1, pageSize: 100 })
    const roleRes = await adminApi.getRoles(); allRoles.value = roleRes.data
    users.value = res.data.data
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  isEdit.value = false
  editId.value = null
  form.username = ''; form.password = ''; form.displayName = ''
  form.email = ''; form.department = ''; form.title = ''
  dialogVisible.value = true
}

function openEdit(user: UserListItem): void {
  isEdit.value = true
  editId.value = user.id
  form.username = user.username; form.password = ''
  form.displayName = user.displayName; form.email = user.email
  form.department = user.department; form.title = user.title || ''
  form.roleIds = user.roles?.map((r) => r.id) || []
  dialogVisible.value = true
}

async function handleSave(): Promise<void> {
  if (!form.username.trim()) { ElMessage.warning('请输入用户名'); return }
  if (!isEdit.value && !form.password) { ElMessage.warning('请输入密码'); return }

  try {
    const payload: Record<string, string> = {
      username: form.username, displayName: form.displayName,
      email: form.email, department: form.department, title: form.title,
    }
    if (form.password) payload.password = form.password
    payload.roleIds = form.roleIds

    if (isEdit.value && editId.value) {
      await adminApi.updateUser(editId.value, payload as any)
      ElMessage.success('用户更新成功')
    } else {
      await adminApi.createUser(payload as any)
      ElMessage.success('用户创建成功')
    }
    dialogVisible.value = false
    await loadUsers()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(id: number, name: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${name}" 吗？此操作不可撤销。`, '确认删除', { type: 'warning' })
    await adminApi.deleteUser(id)
    ElMessage.success('已删除')
    await loadUsers()
  } catch { /* cancelled */ }
}

onMounted(() => { loadUsers() })
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">用户管理</h2>
      <button class="btn-create" @click="openCreate">+ 新建用户</button>
    </div>

    <div class="card table-card">
      <div class="card-body">
        <el-table :data="users" stripe size="small" v-loading="loading">
          <el-table-column prop="username" label="用户名" width="100" />
          <el-table-column prop="displayName" label="姓名" width="100" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="department" label="部门" min-width="140" />
          <el-table-column label="角色" width="120">
            <template #default="{ row }">
              <span v-for="r in row.roles" :key="r.id" class="role-tag">{{ r.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <span class="status-dot" :class="row.status" />
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <button class="action-link" @click="openEdit(row)">编辑</button>
              <button class="action-link danger" @click="handleDelete(row.id, row.displayName)">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新建用户'" width="500px" destroy-on-close>
      <el-form :model="form" label-position="top" size="default">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" placeholder="登录用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" :required="!isEdit">
          <el-input v-model="form.password" type="password" :placeholder="isEdit ? '留空则不修改密码' : '设置密码'" show-password />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.displayName" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱地址" />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox v-for="r in allRoles" :key="r.id" :value="r.id">{{ r.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="form.department" placeholder="所属部门" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.title" placeholder="职位/职称" />
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
.table-card { overflow: hidden; }
.role-tag { display: inline-block; padding: 1px 6px; margin-right: 4px; font-size: 11px; color: #4c6ef5; background: #eef2ff; border-radius: 4px; }
.status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px;
  &.active { background: #40c057; } &.disabled { background: #adb5bd; } }
.action-link { border: none; background: transparent; font-size: 12px; color: #4c6ef5; cursor: pointer; margin-right: 10px; &:hover { text-decoration: underline; }
  &.danger { color: #fa5252; } }
</style>
