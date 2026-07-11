<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { resourceApi, adminApi } from '@/api'
import type { Category } from '@/types'

const categories = ref<Category[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ name: '', slug: '', description: '' })

async function load(): Promise<void> { loading.value = true; try { const res = await resourceApi.getCategories(); categories.value = res.data } finally { loading.value = false } }
function openCreate(): void { isEdit.value = false; editId.value = null; form.name = ''; form.slug = ''; form.description = ''; dialogVisible.value = true }
function openEdit(cat: Category): void { isEdit.value = true; editId.value = cat.id; form.name = cat.name; form.slug = cat.slug; form.description = cat.description; dialogVisible.value = true }

async function handleSave(): Promise<void> {
  if (!form.name.trim()) { ElMessage.warning('请输入分类名称'); return }
  try {
    if (isEdit.value && editId.value) { await adminApi.updateCategory(editId.value, { name: form.name, slug: form.slug, description: form.description } as any); ElMessage.success('分类更新成功') }
    else { await adminApi.createCategory({ name: form.name, slug: form.slug, description: form.description } as any); ElMessage.success('分类创建成功') }
    dialogVisible.value = false; await load()
  } catch { ElMessage.error('操作失败') }
}

async function handleDelete(id: number, name: string): Promise<void> {
  try { await ElMessageBox.confirm(`确定删除分类 "${name}"？`, '确认删除', { type: 'warning' }); await adminApi.deleteCategory(id); ElMessage.success('已删除'); await load() } catch { /* cancelled */ }
}

onMounted(() => { load() })
</script>

<template>
  <div class="admin-page">
    <div class="admin-header"><h2 class="admin-page-title">分类管理</h2><button class="btn-create" @click="openCreate">+ 新建分类</button></div>
    <div class="cat-list" v-loading="loading">
      <div v-for="cat in categories" :key="cat.id" class="cat-item card--hoverable">
        <div class="cat-item-body">
          <div class="cat-info"><h4 class="cat-name">{{ cat.name }}</h4><span class="cat-slug">{{ cat.slug }}</span><p class="cat-desc" v-if="cat.description">{{ cat.description }}</p></div>
          <div class="cat-actions"><button class="btn-sm" @click="openEdit(cat)">编辑</button><button class="btn-sm danger" @click="handleDelete(cat.id, cat.name)">删除</button></div>
        </div>
      </div>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新建分类'" width="450px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="分类名称" required><el-input v-model="form.name" placeholder="如：计算生物学" /></el-form-item>
        <el-form-item label="Slug" required><el-input v-model="form.slug" placeholder="如：comp-bio" :disabled="isEdit" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" placeholder="分类说明..." /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSave">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; }
.btn-create { padding: 7px 16px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer; &:hover { background: #4263eb; } }
.cat-list { display: flex; flex-direction: column; gap: 8px; }
.cat-item-body { display: flex; align-items: center; padding: 14px 20px; gap: 16px; }
.cat-info { flex: 1; } .cat-name { font-size: 14px; font-weight: 500; margin-bottom: 2px; } .cat-slug { font-size: 11px; color: #adb5bd; } .cat-desc { font-size: 12px; color: #6c757d; margin-top: 4px; }
.cat-actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; font-size: 11px; border: 1px solid #dee2e6; border-radius: 4px; background: #fff; color: #495057; cursor: pointer; &:hover { background: #f1f3f5; } &.danger { color: #fa5252; border-color: #ffc9c9; &:hover { background: #fff5f5; } } }
</style>
