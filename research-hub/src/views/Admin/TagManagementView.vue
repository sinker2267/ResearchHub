<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import type { Tag } from '@/types'

const tags = ref<Tag[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ name: '', slug: '', color: '#4c6ef5' })

async function loadTags(): Promise<void> {
  loading.value = true
  try { const res = await adminApi.getTags(); tags.value = res.data } finally { loading.value = false }
}

function openCreate(): void {
  isEdit.value = false; editId.value = null
  form.name = ''; form.slug = ''; form.color = '#4c6ef5'
  dialogVisible.value = true
}

function openEdit(tag: Tag): void {
  isEdit.value = true; editId.value = tag.id
  form.name = tag.name; form.slug = tag.slug; form.color = tag.color
  dialogVisible.value = true
}

async function handleSave(): Promise<void> {
  if (!form.name.trim()) { ElMessage.warning('请输入标签名称'); return }
  try {
    if (isEdit.value && editId.value) {
      await adminApi.updateTag(editId.value, { name: form.name, slug: form.slug, color: form.color } as any)
      ElMessage.success('标签更新成功')
    } else {
      await adminApi.createTag({ name: form.name, slug: form.slug, color: form.color } as any)
      ElMessage.success('标签创建成功')
    }
    dialogVisible.value = false
    await loadTags()
  } catch { ElMessage.error('操作失败') }
}

async function handleDelete(id: number, name: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除标签 "${name}"？`, '确认删除', { type: 'warning' })
    await adminApi.deleteTag(id)
    ElMessage.success('已删除')
    await loadTags()
  } catch { /* cancelled */ }
}

onMounted(() => { loadTags() })
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">标签管理</h2>
      <button class="btn-create" @click="openCreate">+ 新建标签</button>
    </div>

    <div class="tag-grid" v-loading="loading">
      <div v-for="tag in tags" :key="tag.id" class="tag-card card--hoverable">
        <div class="tag-card-body">
          <span class="tag-swatch" :style="{ background: tag.color }" />
          <div class="tag-info">
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-slug">{{ tag.slug }}</span>
          </div>
          <div class="tag-actions">
            <button class="btn-sm" @click="openEdit(tag)">编辑</button>
            <button class="btn-sm danger" @click="handleDelete(tag.id, tag.name)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '新建标签'" width="420px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="标签名称" required>
          <el-input v-model="form.name" placeholder="如：深度学习" />
        </el-form-item>
        <el-form-item label="Slug" required>
          <el-input v-model="form.slug" placeholder="如：deep-learning" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="颜色">
          <div style="display:flex;align-items:center;gap:12px">
            <span class="color-preview" :style="{ background: form.color }" />
            <el-input v-model="form.color" placeholder="#4c6ef5" style="flex:1" />
          </div>
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

.tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.tag-card-body { display: flex; align-items: center; gap: 12px; padding: 14px 18px; }
.tag-swatch { width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0; }
.tag-info { flex: 1; display: flex; flex-direction: column; }
.tag-name { font-size: 14px; font-weight: 500; }
.tag-slug { font-size: 11px; color: #adb5bd; }
.tag-actions { display: flex; gap: 6px; }

.btn-sm { padding: 4px 10px; font-size: 11px; border: 1px solid #dee2e6; border-radius: 4px; background: #fff; color: #495057; cursor: pointer; &:hover { background: #f1f3f5; }
  &.danger { color: #fa5252; border-color: #ffc9c9; &:hover { background: #fff5f5; } } }

.color-preview { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e9ecef; flex-shrink: 0; }
</style>
