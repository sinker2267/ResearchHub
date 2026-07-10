<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resourceApi } from '@/api'
import { RESOURCE_TYPES } from '@/constants'
import type { Resource, ResourceType, Category, Tag } from '@/types'

const router = useRouter()
const saving = ref(false)

const form = reactive({
  title: '',
  description: '',
  type: '' as ResourceType | '',
  categoryID: null as number | null,
  tagIds: [] as number[],
  license: 'CC BY 4.0',
  citation: '',
})

const categories = ref<Category[]>([])
const allTags = ref<Tag[]>([])

const types = RESOURCE_TYPES
const availableTags = computed(() => allTags.value.filter((t) => !form.tagIds.includes(t.id)))

async function loadMeta(): Promise<void> {
  const [catRes, tagRes] = await Promise.all([
    resourceApi.getCategories(),
    resourceApi.getTags(),
  ])
  categories.value = catRes.data
  allTags.value = tagRes.data
}

function toggleTag(tagId: number): void {
  const idx = form.tagIds.indexOf(tagId)
  if (idx >= 0) form.tagIds.splice(idx, 1)
  else form.tagIds.push(tagId)
}

async function handleSubmit(): Promise<void> {
  if (!form.title.trim()) { ElMessage.warning('请输入资源名称'); return }
  if (!form.type) { ElMessage.warning('请选择资源类型'); return }

  saving.value = true
  try {
    await resourceApi.create({
      title: form.title,
      description: form.description,
      type: form.type as ResourceType,
      license: form.license,
      citation: form.citation,
      categoryID: form.categoryID || 0,
      tags: allTags.value.filter((t) => form.tagIds.includes(t.id)),
    } as Partial<Resource>)
    ElMessage.success('资源上传成功')
    router.push('/resource')
  } catch {
    ElMessage.error('上传失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => { loadMeta() })
</script>

<template>
  <div class="upload-page">
    <div class="page-container--narrow">
      <div class="back-nav">
        <router-link to="/resource" class="back-link">&larr; 返回资源中心</router-link>
      </div>
      <h2 class="page-title">上传资源</h2>

      <div class="form-card card">
        <div class="card-body">
          <el-form label-position="top" size="default">
            <el-form-item label="资源名称" required>
              <el-input v-model="form.title" placeholder="输入资源名称..." />
            </el-form-item>
            <el-form-item label="资源类型" required>
              <el-select v-model="form.type" placeholder="选择类型" style="width:200px">
                <el-option v-for="t in types" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="分类">
              <el-select v-model="form.categoryID" placeholder="选择分类" style="width:200px" clearable>
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述资源内容、用途..." />
            </el-form-item>
            <el-form-item label="标签">
              <span v-for="tagId in form.tagIds" :key="tagId" class="tag-chip">
                {{ allTags.find((t) => t.id === tagId)?.name }}
                <button class="tag-remove" @click="toggleTag(tagId)">&times;</button>
              </span>
              <el-dropdown trigger="click">
                <button class="tag-add-btn">+ 标签</button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="t in availableTags" :key="t.id" @click="toggleTag(t.id)">{{ t.name }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
            <el-form-item label="许可证">
              <el-select v-model="form.license" style="width:200px">
                <el-option v-for="l in ['CC BY 4.0','CC BY-SA 4.0','MIT','GPL v3','Apache 2.0']" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item label="引用方式">
              <el-input v-model="form.citation" type="textarea" :rows="2" placeholder="如：作者 (年份) 标题. 期刊." />
            </el-form-item>
            <div class="form-actions">
              <button class="btn-cancel" @click="router.back()">取消</button>
              <button class="btn-submit" :disabled="saving" @click="handleSubmit">{{ saving ? '提交中...' : '提交资源' }}</button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-page { min-height: calc(100vh - 56px); padding: 24px 0; }
.back-nav { margin-bottom: 16px; }
.back-link { font-size: 13px; color: #6c757d; text-decoration: none; &:hover { color: #212529; } }
.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 24px; }
.form-card .card-body { padding: 32px; }

.tag-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; font-size: 12px; color: #4c6ef5; background: #eef2ff; border-radius: 4px; margin-right: 6px; }
.tag-remove { border: none; background: transparent; color: #91a7ff; font-size: 15px; cursor: pointer; padding: 0; line-height: 1; }
.tag-add-btn { padding: 2px 10px; font-size: 12px; color: #868e96; background: transparent; border: 1px dashed #dee2e6; border-radius: 4px; cursor: pointer; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f3f5; }
.btn-cancel { padding: 9px 22px; font-size: 13px; color: #6c757d; background: #fff; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 9px 28px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
</style>
