<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'
import type { SystemSetting } from '@/types'

const settings = ref<SystemSetting[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  try {
    const res = await adminApi.getSettings()
    settings.value = res.data
  } finally { loading.value = false }
}

async function handleSave(): Promise<void> {
  try {
    await adminApi.updateSettings(settings.value)
    ElMessage.success('设置已保存')
  } catch { ElMessage.error('保存失败') }
}

function grouped(): Record<string, SystemSetting[]> {
  const g: Record<string, SystemSetting[]> = {}
  for (const s of settings.value) {
    if (!g[s.group]) g[s.group] = []
    g[s.group].push(s)
  }
  return g
}

onMounted(() => { load() })
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">系统设置</h2>
    <p class="admin-desc">全局系统参数配置，修改后点击保存生效。</p>

    <div class="settings-list" v-loading="loading">
      <div v-for="(items, group) in grouped()" :key="group" class="settings-group card">
        <div class="card-body">
          <h3 class="group-name">{{ group }}</h3>
          <div class="setting-rows">
            <div v-for="s in items" :key="s.key" class="setting-row">
              <div class="setting-info">
                <label class="setting-label">{{ s.description || s.key }}</label>
                <span class="setting-desc">{{ s.key }}</span>
              </div>
              <div class="setting-control">
                <el-input v-model="s.value" size="small" class="setting-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="save-bar">
      <button class="btn-save" @click="handleSave">保存设置</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page { }
.admin-page-title { font-size: 20px; font-weight: 600; color: #212529; margin-bottom: 4px; }
.admin-desc { font-size: 13px; color: #868e96; margin-bottom: 24px; }

.settings-list { display: flex; flex-direction: column; gap: 16px; }
.group-name { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 16px; }
.setting-rows { display: flex; flex-direction: column; gap: 16px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.setting-info { flex: 1; }
.setting-label { display: block; font-size: 13px; font-weight: 500; color: #212529; margin-bottom: 2px; }
.setting-desc { font-size: 11px; color: #adb5bd; }
.setting-control { width: 200px; flex-shrink: 0; }

.save-bar { margin-top: 24px; display: flex; justify-content: flex-end; }
.btn-save { padding: 9px 28px; font-size: 13px; font-weight: 500; color: #fff; background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer; &:hover { background: #4263eb; } }
</style>
