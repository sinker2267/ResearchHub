<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resourceApi } from '@/api'
import { RESOURCE_TYPES } from '@/constants'
import type { ResourceType, Category, Tag } from '@/types'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const saving = ref(false)

const form = reactive({
  title: '', description: '', type: '' as ResourceType | '',
  categoryID: null as number | null, tagIds: [] as number[],
  license: 'CC BY 4.0', citation: '',
})

const categories = ref<Category[]>([])
const allTags = ref<Tag[]>([])
const selectedFiles = ref<File[]>([])
const availableTags = computed(() => allTags.value.filter((t) => !form.tagIds.includes(t.id)))

async function loadMeta(): Promise<void> {
  const [catRes, tagRes] = await Promise.all([resourceApi.getCategories(), resourceApi.getTags()])
  categories.value = catRes.data; allTags.value = tagRes.data
}

function toggleTag(tagId: number): void {
  const idx = form.tagIds.indexOf(tagId)
  if (idx >= 0) form.tagIds.splice(idx, 1)
  else form.tagIds.push(tagId)
}

function removeFile(index: number): void { selectedFiles.value.splice(index, 1) }

function onFileChange(e: Event): void {
  const target = e.target as HTMLInputElement
  if (target.files) {
    for (let i = 0; i < target.files.length; i++) selectedFiles.value.push(target.files[i])
    target.value = ''
  }
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  if (e.dataTransfer?.files) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) selectedFiles.value.push(e.dataTransfer.files[i])
  }
}

async function handleSubmit(): Promise<void> {
  if (!form.title.trim()) { ElMessage.warning('请输入资源名称'); return }
  if (!form.type) { ElMessage.warning('请选择资源类型'); return }

  saving.value = true
  try {
    const res = await resourceApi.create({
      title: form.title, description: form.description, type: form.type as ResourceType,
      license: form.license, citation: form.citation, categoryID: form.categoryID || 0,
    } as any)
    const resourceId = res.data.id

    // Upload files
    if (selectedFiles.value.length > 0) {
      for (const file of selectedFiles.value) {
        const fd = new FormData()
        fd.append('file', file)
        await resourceApi.uploadFile(resourceId, fd)
      }
    }

    // Set tags
    if (form.tagIds.length > 0) {
      const tagObjs = allTags.value.filter((t) => form.tagIds.includes(t.id))
      await resourceApi.update(resourceId, { tags: tagObjs } as any)
    }

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
      <div class="back-nav"><router-link to="/resource" class="back-link">&larr; 返回资源中心</router-link></div>
      <h2 class="page-title">上传资源</h2>

      <div class="form-card card">
        <div class="card-body">
          <el-form label-position="top" size="default">
            <el-form-item label="资源名称" required>
              <el-input v-model="form.title" placeholder="输入资源名称..." />
            </el-form-item>
            <el-form-item label="资源类型" required>
              <el-select v-model="form.type" placeholder="选择类型" style="width:200px">
                <el-option v-for="t in RESOURCE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
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
                <button type="button" class="tag-remove" @click="toggleTag(tagId)">&times;</button>
              </span>
              <el-dropdown trigger="click">
                <button type="button" class="tag-add-btn">+ 标签</button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="t in availableTags" :key="t.id" @click="toggleTag(t.id)">{{ t.name }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>

            <!-- File upload area -->
            <el-form-item label="上传文件">
              <div
                class="drop-zone"
                @dragover.prevent
                @drop="onDrop"
                @click="($refs.fileInput as HTMLInputElement).click()"
              >
                <el-icon :size="36"><UploadFilled /></el-icon>
                <p class="drop-text">将文件拖拽到此处，或点击选择文件</p>
                <p class="drop-hint">支持任意格式，单个文件不超过 500MB</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                multiple
                style="display:none"
                @change="onFileChange"
              />
              <!-- File list -->
              <div v-if="selectedFiles.length > 0" class="file-list">
                <div v-for="(f, i) in selectedFiles" :key="i" class="file-row">
                  <span class="file-name">{{ f.name }}</span>
                  <span class="file-size">{{ (f.size / 1024 / 1024).toFixed(1) }} MB</span>
                  <button type="button" class="file-remove" @click="removeFile(i)">&times;</button>
                </div>
              </div>
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
              <button type="button" class="btn-cancel" @click="router.back()">取消</button>
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
.form-card .card-body { padding: 32px; }

.tag-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; font-size: 12px; color: #4c6ef5; background: #eef2ff; border-radius: 4px; margin-right: 6px; }
.tag-remove { border: none; background: transparent; color: #91a7ff; font-size: 15px; cursor: pointer; padding: 0; line-height: 1; }
.tag-add-btn { padding: 2px 10px; font-size: 12px; color: #868e96; background: transparent; border: 1px dashed #dee2e6; border-radius: 4px; cursor: pointer; }

.drop-zone {
  width: 100%; border: 2px dashed #dee2e6; border-radius: 8px;
  padding: 36px; text-align: center; cursor: pointer;
  transition: all 150ms ease;
  &:hover { border-color: #4c6ef5; background: #f8f9ff; }
}
.drop-text { font-size: 14px; color: #495057; margin-top: 8px; }
.drop-hint { font-size: 11px; color: #adb5bd; margin-top: 4px; }

.file-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.file-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #f8f9fa; border-radius: 6px; font-size: 13px; }
.file-name { flex: 1; color: #212529; }
.file-size { color: #868e96; font-size: 12px; }
.file-remove { border: none; background: transparent; color: #adb5bd; font-size: 18px; cursor: pointer; padding: 0; line-height: 1; &:hover { color: #fa5252; } }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f3f5; }
.btn-cancel { padding: 9px 22px; font-size: 13px; color: #6c757d; background: #fff; border: 1px solid #dee2e6; border-radius: 6px; cursor: pointer; }
.btn-submit { padding: 9px 28px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover:not(:disabled) { background: #4263eb; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
</style>
