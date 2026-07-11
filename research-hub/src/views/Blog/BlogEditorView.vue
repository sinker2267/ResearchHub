<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { blogApi, resourceApi } from '@/api'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import type { BlogPost, Category, Tag, Resource } from '@/types'

const route = useRoute()
const router = useRouter()

const isEditing = ref(false)
const saving = ref(false)
const editId = ref<number | null>(null)

const title = ref('')
const content = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedVisibility = ref("public")
const selectedTagIds = ref<number[]>([])

const categories = ref<Category[]>([])
const allTags = ref<Tag[]>([])
const loadingMeta = ref(true)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Resource link inserter
const resDialogVisible = ref(false)
const resourceSearch = ref('')
const resources = ref<Resource[]>([])
const loadingResources = ref(false)

const availableTags = computed(() => allTags.value.filter((t) => !selectedTagIds.value.includes(t.id)))

async function loadMeta(): Promise<void> {
  const [catRes, tagRes] = await Promise.all([resourceApi.getCategories(), resourceApi.getTags()])
  categories.value = catRes.data; allTags.value = tagRes.data; loadingMeta.value = false
}

function toggleTag(tagId: number): void {
  const idx = selectedTagIds.value.indexOf(tagId)
  if (idx >= 0) selectedTagIds.value.splice(idx, 1)
  else selectedTagIds.value.push(tagId)
}

async function openResourceDialog(): Promise<void> {
  resDialogVisible.value = true; resourceSearch.value = ''
  loadingResources.value = true
  try {
    const res = await resourceApi.getList({ page: 1, pageSize: 100 })
    resources.value = res.data.data
  } finally { loadingResources.value = false }
}

const filteredResources = computed(() => {
  if (!resourceSearch.value) return resources.value
  const q = resourceSearch.value.toLowerCase()
  return resources.value.filter((r) => r.title.toLowerCase().includes(q))
})

function insertResourceLink(res: Resource): void {
  const md = `[${res.title}](/resource/${res.id})`
  const ta = textareaRef.value
  if (ta) {
    const start = ta.selectionStart
    const end = ta.selectionEnd
    content.value = content.value.slice(0, start) + md + content.value.slice(end)
    nextTick(() => { ta.focus(); ta.setSelectionRange(start + md.length, start + md.length) })
  } else {
    content.value += '\n' + md
  }
  resDialogVisible.value = false
}

async function handleSave(status: 'draft' | 'published'): Promise<void> {
  if (!title.value.trim()) { ElMessage.warning('请输入文章标题'); return }
  if (!content.value.trim()) { ElMessage.warning('请输入文章内容'); return }

  saving.value = true
  try {
    const payload: Partial<BlogPost> = {
      title: title.value, content: content.value, summary: content.value.slice(0, 200),
      status, categoryID: selectedCategoryId.value || 0,
      visibility: selectedVisibility.value,
      tags: allTags.value.filter((t) => selectedTagIds.value.includes(t.id)),
    }
    if (isEditing.value && editId.value) { await blogApi.update(editId.value, payload); ElMessage.success('更新成功') }
    else { await blogApi.create(payload); ElMessage.success(status === 'published' ? '发布成功' : '保存草稿成功') }
    router.push('/blog')
  } catch { ElMessage.error('保存失败') } finally { saving.value = false }
}

onMounted(async () => {
  await loadMeta()
  const postId = Number(route.params.id)
  if (postId) {
    try {
      const res = await blogApi.getDetail(postId)
      const post = res.data
      isEditing.value = true; editId.value = post.id
      title.value = post.title; content.value = post.content
      selectedCategoryId.value = post.category?.id || null
      selectedTagIds.value = post.tags?.map((t: Tag) => t.id) || []
    } catch { /* new post */ }
  }
})
</script>

<template>
  <div class="editor-page">
    <div class="editor-container">
      <div class="editor-header">
        <div class="header-left">
          <el-input v-model="title" placeholder="文章标题..." class="title-input" />
        </div>
        <div class="header-right">
          <el-select v-model="selectedCategoryId" placeholder="选择分类" size="small" class="cat-select" clearable :loading="loadingMeta">
          <el-select v-model="selectedVisibility" size="small" class="vis-select" placeholder="可见性">
            <el-option label="公开" value="public" />
            <el-option label="仅管理员" value="admin" />
          </el-select>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </div>
      </div>

      <div class="editor-tags">
        <span v-for="tagId in selectedTagIds" :key="tagId" class="tag-chip">
          {{ allTags.find((t) => t.id === tagId)?.name }}
          <button type="button" class="tag-remove" @click="toggleTag(tagId)">&times;</button>
        </span>
        <el-dropdown trigger="click">
          <button type="button" class="tag-add-btn">+ 添加标签</button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="t in availableTags" :key="t.id" @click="toggleTag(t.id)">{{ t.name }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <span class="toolbar-sep" />
        <button type="button" class="toolbar-btn" @click="openResourceDialog">📎 插入资源链接</button>
      </div>

      <div class="editor-body">
        <div class="editor-pane editor-input-pane">
          <div class="pane-label">编辑</div>
          <textarea
            ref="textareaRef"
            v-model="content"
            class="editor-textarea"
            placeholder="开始用 Markdown 写作..."
          />
        </div>
        <div class="editor-pane editor-preview-pane">
          <div class="pane-label">预览</div>
          <div class="preview-scroll">
            <MarkdownRenderer v-if="content" :content="content" />
            <div v-else class="preview-empty"><p>在左侧输入 Markdown 内容</p></div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <button class="btn-cancel" @click="router.back()">取消</button>
        <div class="footer-right">
          <button class="btn-draft" :disabled="saving" @click="handleSave('draft')">保存草稿</button>
          <button class="btn-publish" :disabled="saving" @click="handleSave('published')">发布</button>
        </div>
      </div>
    </div>

    <!-- Resource Link Dialog -->
    <el-dialog v-model="resDialogVisible" title="插入资源链接" width="520px" destroy-on-close>
      <el-input v-model="resourceSearch" placeholder="搜索资源..." clearable style="margin-bottom:16px" />
      <div v-loading="loadingResources" style="max-height:400px;overflow-y:auto">
        <div v-for="res in filteredResources" :key="res.id" class="res-select-item" @click="insertResourceLink(res)">
          <div class="res-select-info">
            <span class="res-select-title">{{ res.title }}</span>
            <span class="res-select-type">{{ ({dataset:'数据集',software:'软件',model:'模型',paper:'论文',other:'其他'})[res.type] }}</span>
          </div>
          <span class="res-select-id">/resource/{{ res.id }}</span>
        </div>
        <p v-if="filteredResources.length === 0 && !loadingResources" style="text-align:center;color:#adb5bd;padding:20px">无匹配资源</p>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.editor-page { min-height: calc(100vh - 56px); background: #fff; }
.editor-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; height: calc(100vh - 56px); }

.editor-header { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid #e9ecef; }
.header-left { flex: 1; }
.title-input :deep(.el-input__wrapper) { border: none; box-shadow: none; padding: 0; }
.title-input :deep(.el-input__inner) { font-size: 22px; font-weight: 600; }
.cat-select { width: 160px; flex-shrink: 0; }

.editor-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 24px; border-bottom: 1px solid #e9ecef; }
.tag-chip { display: flex; align-items: center; gap: 4px; padding: 2px 10px; font-size: 12px; color: #4c6ef5; background: #eef2ff; border-radius: 4px; }
.tag-remove { border: none; background: transparent; color: #91a7ff; font-size: 15px; cursor: pointer; padding: 0; line-height: 1; &:hover { color: #4c6ef5; } }
.tag-add-btn { padding: 2px 10px; font-size: 12px; color: #868e96; background: transparent; border: 1px dashed #dee2e6; border-radius: 4px; cursor: pointer; &:hover { border-color: #4c6ef5; color: #4c6ef5; } }

.toolbar-sep { width: 1px; height: 20px; background: #dee2e6; margin: 0 4px; }
.toolbar-btn { padding: 3px 10px; font-size: 12px; color: #495057; background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; &:hover { background: #e9ecef; } }

.editor-body { display: flex; flex: 1; overflow: hidden; }
.editor-pane { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.editor-input-pane { border-right: 1px solid #e9ecef; }
.pane-label { padding: 8px 16px; font-size: 11px; font-weight: 500; color: #adb5bd; text-transform: uppercase; letter-spacing: 0.5px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }

.editor-textarea { flex: 1; border: none; resize: none; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #212529; outline: none; tab-size: 2;
  &::placeholder { color: #adb5bd; } }

.preview-scroll { flex: 1; overflow-y: auto; padding: 20px 24px; }
.preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #adb5bd; text-align: center; }

.editor-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid #e9ecef; background: #fff; }
.footer-right { display: flex; gap: 8px; }

.btn-cancel { padding: 8px 18px; font-size: 13px; color: #6c757d; background: #fff; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer; &:hover { background: #f1f3f5; } }
.btn-draft { padding: 8px 18px; font-size: 13px; font-weight: 500; color: #495057; background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #e9ecef; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
.btn-publish { padding: 8px 18px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; } &:disabled { opacity: 0.5; cursor: not-allowed; } }

.res-select-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: pointer; border-radius: 6px; &:hover { background: #f1f3f5; } }
.res-select-info { display: flex; flex-direction: column; gap: 2px; }
.res-select-title { font-size: 13px; font-weight: 500; color: #212529; }
.res-select-type { font-size: 11px; color: #868e96; }
.res-select-id { font-size: 11px; color: #adb5bd; }
</style>
