<script setup lang="ts">
defineProps<{ text?: string }>()
</script>

<template>
  <div class="page-loading">
    <div class="loading-spinner" />
    <p class="loading-text">{{ text || '加载中...' }}</p>
  </div>
</template>

<style lang="scss" scoped>
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top-color: #4c6ef5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 13px;
  color: #868e96;
}
</style>
