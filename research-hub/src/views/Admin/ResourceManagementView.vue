<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { resourceApi } from '@/api'
import { formatDate } from '@/utils'
import type { Resource, ResourceType, Category, Tag } from '@/types'

const resources = ref<Resource[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const categories = ref<Category[]>([])
const allTags = ref<Tag[]>([])

const form = reactive({
  title: '',
  description: '',
  type: '' as ResourceType | '',
  categoryID: null as number | null,
  tagIds: [] as number[],
  license: 'CC BY 4.0',
  citation: '',
})

function getTypeLabel(type: string): string {
  const map: Record<string, string> = { dataset: '数据集', software: '软件', model: '模型', paper: '论文', other: '其他' }
  return map[type] || type
}

async function loadData(): Promise<void> {
  loading.value = true
  try {
    const [resRes, catRes, tagRes] = await Promise.all([
      resourceApi.getList({ page: 1, pageSize: 100 }),
      resourceApi.getCategories(),
      resourceApi.getTags(),
    ])
    resources.value = resRes.data.data
    categories.value = catRes.data
    allTags.value = tagRes.data
  } finally {
    loading.value = false
  }
}

function openEdit(res: Resource): void {
  isEdit.value = true; editId.value = res.id
  form.title = res.title; form.description = res.description
  form.type = res.type; form.categoryID = res.category?.id || null
  form.tagIds = res.tags?.map((t) => t.id) || []
  form.license = res.license; form.citation = res.citation
  dialogVisible.value = true
}

async function handleSave(): Promise<void> {
  if (!form.title.trim()) { ElMessage.warning('请输入资源名称'); return }
  try {
    if (isEdit.value && editId.value) {
      await resourceApi.update(editId.value, {
        title: form.title, description: form.description, type: form.type,
        license: form.license, citation: form.citation,
        categoryID: form.categoryID || 0,
        tags: allTags.value.filter((t) => form.tagIds.includes(t.id)),
      } as Partial<Resource>)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch {
    ElMessage.error('保存失败')
  }
}

async function handleDelete(id: number, title: string): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除资源 "${title}" 吗？`, '确认删除', { type: 'warning' })
    await resourceApi.delete(id)
    ElMessage.success('已删除')
    await loadData()
  } catch { /* cancelled */ }
}

onMounted(() => { loadData() })
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-page-title">资源管理</h2>
    </div>
    <div class="card table-card">
      <div class="card-body">
        <el-table :data="resources" stripe size="small" v-loading="loading">
          <el-table-column prop="title" label="资源名称" min-width="200" />
          <el-table-column label="类型" width="80">
            <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
          </el-table-column>
          <el-table-column label="作者" width="100">
            <template #default="{ row }">{{ row.author?.displayName }}</template>
          </el-table-column>
          <el-table-column prop="downloadCount" label="下载" width="70" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <span class="status-tag" :class="row.status">{{ row.status === 'published' ? '已发布' : row.status === 'draft' ? '草稿' : '已归档' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="110">
            <template #default="{ row }">{{ formatDate(row.createdAt, 'date') }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <button class="action-link" @click="openEdit(row)">编辑</button>
              <button class="action-link danger" @click="handleDelete(row.id, row.title)">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" title="编辑资源" width="560px" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="资源名称" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:160px">
            <el-option v-for="t in [{v:'dataset',l:'数据集'},{v:'software',l:'软件'},{v:'model',l:'模型'},{v:'paper',l:'论文'},{v:'other',l:'其他'}]" :key="t.v" :label="t.l" :value="t.v" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryID" style="width:200px" clearable>
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="许可证">
          <el-select v-model="form.license" style="width:200px">
            <el-option v-for="l in ['CC BY 4.0','MIT','GPL v3','Apache 2.0']" :key="l" :label="l" :value="l" />
          </el-select>
        </el-form-item>
        <el-form-item label="引用方式">
          <el-input v-model="form.citation" type="textarea" :rows="2" />
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
.table-card { overflow: hidden; }
.status-tag { font-size: 11px; padding: 1px 6px; border-radius: 4px;
  &.published { color: #2b8a3e; background: #ebfbee; }
  &.draft { color: #e67700; background: #fff9db; }
  &.archived { color: #868e96; background: #f1f3f5; } }
.action-link { border: none; background: transparent; font-size: 12px; color: #4c6ef5; cursor: pointer; margin-right: 10px; &:hover { text-decoration: underline; }
  &.danger { color: #fa5252; } }
</style>
