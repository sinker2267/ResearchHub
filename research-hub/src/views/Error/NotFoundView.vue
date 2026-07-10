<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <p class="error-code">404</p>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">您访问的页面不存在或已被移除。</p>
      <div class="error-actions">
        <button class="btn-primary" @click="router.push('/dashboard')">返回首页</button>
        <button class="btn-secondary" @click="router.back()">返回上页</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 56px); }
.error-content { text-align: center; }
.error-code { font-size: 72px; font-weight: 700; color: #dee2e6; line-height: 1; margin-bottom: 8px; }
.error-title { font-size: 20px; font-weight: 600; color: #212529; margin-bottom: 8px; }
.error-desc { font-size: 13px; color: #868e96; margin-bottom: 24px; }
.error-actions { display: flex; gap: 12px; justify-content: center; }
.btn-primary { padding: 10px 24px; background: #4c6ef5; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-primary:hover { background: #4263eb; }
.btn-secondary { padding: 10px 24px; background: #f1f3f5; color: #495057; border: 1px solid #dee2e6; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-secondary:hover { background: #e9ecef; }
</style>
