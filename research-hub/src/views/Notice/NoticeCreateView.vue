<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mockNotices, mockUsers } from '@/mock/data'
import { NOTICE_LEVEL_MAP } from '@/constants'
import type { NoticeLevel } from '@/types'

const router = useRouter()
const saving = ref(false)

const form = reactive({
  title: '',
  content: '',
  level: 'info' as NoticeLevel,
})

const levels = Object.entries(NOTICE_LEVEL_MAP).map(([value, info]) => ({ value: value as NoticeLevel, ...info }))

async function handleSubmit(): Promise<void> {
  if (!form.title.trim()) { ElMessage.warning('请输入公告标题'); return }
  if (!form.content.trim()) { ElMessage.warning('请输入公告内容'); return }

  saving.value = true
  try {
    await new Promise((r) => setTimeout(r, 400))
    mockNotices.unshift({
      id: mockNotices.length + 201,
      title: form.title,
      content: form.content,
      type: 'announcement',
      level: form.level,
      isRead: true,
      publisher: mockUsers[0],
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    ElMessage.success('公告发布成功')
    router.push('/notice')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <div class="page-container--narrow">
      <div class="back-nav">
        <router-link to="/notice" class="back-link">&larr; 返回通知列表</router-link>
      </div>
      <h2 class="page-title">发布公告</h2>

      <div class="form-card card">
        <div class="card-body">
          <el-form label-position="top" size="default">
            <el-form-item label="公告标题" required>
              <el-input v-model="form.title" placeholder="输入公告标题..." />
            </el-form-item>

            <el-form-item label="公告内容" required>
              <el-input v-model="form.content" type="textarea" :rows="6" placeholder="输入公告正文内容..." />
            </el-form-item>

            <el-form-item label="紧急程度">
              <el-radio-group v-model="form.level">
                <el-radio-button v-for="lvl in levels" :key="lvl.value" :value="lvl.value">
                  {{ lvl.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <div class="form-actions">
              <button class="btn-cancel" @click="router.back()">取消</button>
              <button class="btn-submit" :disabled="saving" @click="handleSubmit">
                {{ saving ? '发布中...' : '发布公告' }}
              </button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-page { min-height: calc(100vh - 56px); padding: 24px 0; }
.back-nav { margin-bottom: 16px; }
.back-link { font-size: 13px; color: #6c757d; text-decoration: none; &:hover { color: #212529; } }
.page-title { font-size: 22px; font-weight: 600; color: #212529; margin-bottom: 24px; }

.form-card { }
.form-card .card-body { padding: 32px; }

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
