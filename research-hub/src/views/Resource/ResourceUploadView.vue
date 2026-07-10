<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mockCategories, mockTags, mockResources } from '@/mock/data'
import { RESOURCE_TYPES } from '@/constants'
import type { Resource, ResourceType } from '@/types'

const router = useRouter()
const saving = ref(false)

const form = reactive({
  title: '',
  description: '',
  type: '' as ResourceType | '',
  categorySlug: '',
  tagSlugs: [] as string[],
  license: 'CC BY 4.0',
  citation: '',
})

const types = RESOURCE_TYPES
const categories = mockCategories
const availableTags = computed(() => mockTags.filter((t) => !form.tagSlugs.includes(t.slug)))

function addTag(slug: string): void {
  if (!form.tagSlugs.includes(slug)) form.tagSlugs.push(slug)
}

function removeTag(slug: string): void {
  form.tagSlugs = form.tagSlugs.filter((t) => t !== slug)
}

async function handleSubmit(): Promise<void> {
  if (!form.title.trim()) { ElMessage.warning('请输入资源名称'); return }
  if (!form.type) { ElMessage.warning('请选择资源类型'); return }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 500))
    const tagObjects = form.tagSlugs.map((s) => mockTags.find((t) => t.slug === s)!).filter(Boolean)
    const cat = mockCategories.find((c) => c.slug === form.categorySlug) || mockCategories[0]
    const newRes: Resource = {
      id: mockResources.length + 101,
      title: form.title,
      slug: form.title.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      type: form.type as ResourceType,
      category: cat,
      tags: tagObjects,
      files: [],
      versions: [{ id: 1, version: 'v1.0', changelog: '初始版本', files: [], createdAt: new Date().toISOString() }],
      author: { id: 1, username: 'admin', displayName: '当前用户', email: '', avatar: '', bio: '', department: '', title: '', roles: [], permissions: [], createdAt: '', updatedAt: '' },
      license: form.license,
      citation: form.citation,
      viewCount: 0, downloadCount: 0, likeCount: 0,
      isLiked: false, isFavorited: false,
      status: 'published',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockResources.push(newRes)
    ElMessage.success('资源上传成功')
    router.push('/resource')
  } finally {
    saving.value = false
  }
}

import { computed } from 'vue'
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
              <el-select v-model="form.categorySlug" placeholder="选择分类" style="width:200px" clearable>
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.slug" />
              </el-select>
            </el-form-item>

            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述资源内容、用途..." />
            </el-form-item>

            <el-form-item label="标签">
              <div class="tag-area">
                <span v-for="slug in form.tagSlugs" :key="slug" class="tag-chip">
                  {{ mockTags.find((t) => t.slug === slug)?.name }}
                  <button class="tag-remove" @click="removeTag(slug)">&times;</button>
                </span>
                <el-select
                  model-value=""
                  placeholder="添加标签"
                  size="small"
                  style="width:120px"
                  @change="addTag"
                >
                  <el-option v-for="t in availableTags" :key="t.id" :label="t.name" :value="t.slug" />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="许可证">
              <el-select v-model="form.license" style="width:200px">
                <el-option label="CC BY 4.0" value="CC BY 4.0" />
                <el-option label="CC BY-SA 4.0" value="CC BY-SA 4.0" />
                <el-option label="MIT" value="MIT" />
                <el-option label="GPL v3" value="GPL v3" />
                <el-option label="Apache 2.0" value="Apache 2.0" />
              </el-select>
            </el-form-item>

            <el-form-item label="引用方式">
              <el-input v-model="form.citation" type="textarea" :rows="2" placeholder="如：作者 (年份) 标题. 期刊." />
            </el-form-item>

            <div class="form-actions">
              <button class="btn-cancel" @click="router.back()">取消</button>
              <button class="btn-submit" :disabled="saving" @click="handleSubmit">
                {{ saving ? '提交中...' : '提交资源' }}
              </button>
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

.form-card { }
.form-card .card-body { padding: 32px; }

.tag-area { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 10px; font-size: 12px; color: #4c6ef5;
  background: #eef2ff; border-radius: 4px;
}
.tag-remove { border: none; background: transparent; color: #91a7ff; font-size: 15px; cursor: pointer; padding: 0; line-height: 1;
  &:hover { color: #4c6ef5; } }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f3f5; }
.btn-cancel {
  padding: 9px 22px; font-size: 13px; color: #6c757d;
  background: #fff; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer;
  &:hover { background: #f1f3f5; }
}
.btn-submit {
  padding: 9px 28px; font-size: 13px; font-weight: 500; color: #fff;
  background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
