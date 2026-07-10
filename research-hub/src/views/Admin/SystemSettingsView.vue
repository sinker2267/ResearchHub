<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const settings = ref([
  { key: 'site_title', label: '站点标题', value: 'ResearchHub', group: '基础设置', description: '显示在浏览器标题栏和页眉' },
  { key: 'site_description', label: '站点描述', value: '科研知识管理平台', group: '基础设置', description: 'SEO和站点元标签' },
  { key: 'max_upload_size', label: '最大上传大小（MB）', value: '500', group: '上传设置', description: '单个文件的最大上传体积' },
  { key: 'allow_registration', label: '允许注册', value: 'true', group: '安全设置', description: '是否开放用户自主注册' },
  { key: 'session_timeout', label: '会话超时（分钟）', value: '120', group: '安全设置', description: '无操作后自动登出' },
  { key: 'cache_ttl', label: '缓存时间（秒）', value: '3600', group: '性能设置', description: '前端数据缓存有效期' },
])

function handleSave(): void {
  ElMessage.success('设置已保存')
}
</script>

<template>
  <div class="admin-page">
    <h2 class="admin-page-title">系统设置</h2>
    <p class="admin-desc">全局系统参数配置，修改后立即生效。</p>

    <div class="settings-list">
      <div v-for="group in [...new Set(settings.map((s) => s.group))]" :key="group" class="settings-group card">
        <div class="card-body">
          <h3 class="group-name">{{ group }}</h3>
          <div class="setting-rows">
            <div v-for="s in settings.filter((x) => x.group === group)" :key="s.key" class="setting-row">
              <div class="setting-info">
                <label class="setting-label">{{ s.label }}</label>
                <span class="setting-desc">{{ s.description }}</span>
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
.settings-group { }
.group-name { font-size: 15px; font-weight: 600; color: #212529; margin-bottom: 16px; }
.setting-rows { display: flex; flex-direction: column; gap: 16px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.setting-info { flex: 1; }
.setting-label { display: block; font-size: 13px; font-weight: 500; color: #212529; margin-bottom: 2px; }
.setting-desc { font-size: 11px; color: #adb5bd; }
.setting-control { width: 200px; flex-shrink: 0; }

.save-bar { margin-top: 24px; display: flex; justify-content: flex-end; }
.btn-save {
  padding: 9px 28px; font-size: 13px; font-weight: 500; color: #fff;
  background: #4c6ef5; border: none; border-radius: 6px; cursor: pointer;
  &:hover { background: #4263eb; }
}
</style>
