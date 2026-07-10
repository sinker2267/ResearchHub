<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mockCategories, mockTags, mockBlogs } from '@/mock/data'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import { Plus, Edit } from '@element-plus/icons-vue'
import type { BlogPost } from '@/types'

const route = useRoute()
const router = useRouter()

const isEditing = ref(false)
const saving = ref(false)

const title = ref('')
const content = ref('')
const selectedCategory = ref('')
const selectedTags = ref<string[]>([])
const tagInput = ref('')

const categories = mockCategories
const availableTags = computed(() => mockTags.filter((t) => !selectedTags.value.includes(t.slug)))

function addTag(tagSlug: string): void {
  if (!selectedTags.value.includes(tagSlug)) {
    selectedTags.value.push(tagSlug)
  }
  tagInput.value = ''
}

function removeTag(tagSlug: string): void {
  selectedTags.value = selectedTags.value.filter((t) => t !== tagSlug)
}

async function handleSave(status: 'draft' | 'published'): Promise<void> {
  if (!title.value.trim()) { ElMessage.warning('请输入文章标题'); return }
  if (!content.value.trim()) { ElMessage.warning('请输入文章内容'); return }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 600))
    const tagObjects = selectedTags.value.map((s) => mockTags.find((t) => t.slug === s)!).filter(Boolean)
    const cat = mockCategories.find((c) => c.slug === selectedCategory.value) || mockCategories[0]
    const newPost: BlogPost = {
      id: mockBlogs.length + 1, title: title.value, slug: title.value.toLowerCase().replace(/\s+/g, '-'),
      summary: content.value.slice(0, 150) + (content.value.length > 150 ? '...' : ''),
      content: content.value, coverImage: '',
      tags: tagObjects, category: cat,
      author: { id: 1, username: 'admin', displayName: '当前用户', email: '', avatar: '', bio: '', department: '', title: '', roles: [], permissions: [], createdAt: '', updatedAt: '' },
      status,
      viewCount: 0, likeCount: 0, commentCount: 0, isLiked: false, isFavorited: false,
      publishedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    mockBlogs.push(newPost)
    ElMessage.success(status === 'published' ? '发布成功' : '保存草稿成功')
    router.push('/blog')
  } finally {
    saving.value = false
  }
}

// Load existing post if editing
onMounted(() => {
  const postId = Number(route.params.id)
  if (postId) {
    const post = mockBlogs.find((b) => b.id === postId)
    if (post) {
      isEditing.value = true
      title.value = post.title
      content.value = post.content
      selectedCategory.value = post.category.slug
      selectedTags.value = post.tags.map((t) => t.slug)
    }
  }
})
</script>

<template>
  <div class="editor-page">
    <div class="editor-container">
      <!-- Header -->
      <div class="editor-header">
        <div class="header-left">
          <el-input
            v-model="title"
            placeholder="文章标题..."
            class="title-input"
            :class="{ empty: !title }"
          />
        </div>
        <div class="header-right">
          <el-select v-model="selectedCategory" placeholder="选择分类" size="small" class="cat-select">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.slug" />
          </el-select>
        </div>
      </div>

      <!-- Tags -->
      <div class="editor-tags">
        <div v-if="selectedTags.length" class="tag-chips">
          <span v-for="tagSlug in selectedTags" :key="tagSlug" class="tag-chip">
            {{ mockTags.find((t) => t.slug === tagSlug)?.name }}
            <button class="tag-remove" @click="removeTag(tagSlug)">&times;</button>
          </span>
        </div>
        <el-select
          v-model="tagInput"
          placeholder="添加标签..."
          size="small"
          class="tag-select"
          @change="addTag"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.slug"
          />
        </el-select>
      </div>

      <!-- Editor body: split pane -->
      <div class="editor-body">
        <div class="editor-pane editor-input-pane">
          <div class="pane-label">编辑</div>
          <textarea
            v-model="content"
            class="editor-textarea"
            placeholder="开始用 Markdown 写作...&#10;&#10;## 二级标题&#10;**加粗** *斜体* &#10;- 列表项&#10;1. 有序列表&#10;&#10;&#96;&#96;&#96;python&#10;print('hello')&#10;&#96;&#96;&#96;"
          />
        </div>
        <div class="editor-pane editor-preview-pane">
          <div class="pane-label">预览</div>
          <div class="preview-scroll">
            <MarkdownRenderer v-if="content" :content="content" />
            <div v-else class="preview-empty">
              <p>在左侧输入 Markdown 内容</p>
              <p class="preview-hint">实时预览将显示在这里</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="editor-footer">
        <button class="btn-cancel" @click="router.back()">取消</button>
        <div class="footer-right">
          <button class="btn-draft" :disabled="saving" @click="handleSave('draft')">
            <el-icon :size="14"><Edit /></el-icon> 保存草稿
          </button>
          <button class="btn-publish" :disabled="saving" @click="handleSave('published')">
            <el-icon :size="14"><Plus /></el-icon> 发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor-page {
  min-height: calc(100vh - 56px);
  background: #fff;
}
.editor-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; height: calc(100vh - 56px); }

.editor-header {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 24px; border-bottom: 1px solid #e9ecef;
}
.header-left { flex: 1; }
.title-input :deep(.el-input__wrapper) {
  border: none; box-shadow: none; padding: 0;
  font-size: 22px; font-weight: 600;
  &.empty { box-shadow: none; }
}
.title-input :deep(.el-input__inner) { font-size: 22px; font-weight: 600; }
.cat-select { width: 160px; flex-shrink: 0; }

.editor-tags {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 24px; border-bottom: 1px solid #e9ecef;
}
.tag-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 2px 10px; font-size: 12px; color: #4c6ef5;
  background: #eef2ff; border-radius: 4px;
}
.tag-remove {
  border: none; background: transparent; font-size: 16px; color: #91a7ff;
  cursor: pointer; padding: 0; line-height: 1;
  &:hover { color: #4c6ef5; }
}
.tag-select { width: 140px; }

.editor-body {
  display: flex; flex: 1; overflow: hidden;
}
.editor-pane {
  flex: 1; display: flex; flex-direction: column;
  min-width: 0;
}
.editor-input-pane { border-right: 1px solid #e9ecef; }
.pane-label {
  padding: 8px 16px; font-size: 11px; font-weight: 500; color: #adb5bd;
  text-transform: uppercase; letter-spacing: 0.5px;
  background: #f8f9fa; border-bottom: 1px solid #e9ecef;
}

.editor-textarea {
  flex: 1; border: none; resize: none; padding: 20px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px; line-height: 1.7; color: #212529;
  outline: none; tab-size: 2;
  &::placeholder { color: #adb5bd; }
}

.preview-scroll { flex: 1; overflow-y: auto; padding: 20px 24px; }
.preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #adb5bd; text-align: center; }
.preview-hint { font-size: 11px; margin-top: 8px; }

.editor-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; border-top: 1px solid #e9ecef; background: #fff;
}
.footer-right { display: flex; gap: 8px; }

.btn-cancel {
  padding: 8px 18px; font-size: 13px; color: #6c757d;
  background: #fff; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer;
  &:hover { background: #f1f3f5; }
}

.btn-draft {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; font-size: 13px; font-weight: 500; color: #495057;
  background: #f1f3f5; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #e9ecef; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-publish {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; font-size: 13px; font-weight: 500; color: #fff;
  background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
