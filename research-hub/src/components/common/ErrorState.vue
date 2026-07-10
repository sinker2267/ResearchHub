<script setup lang="ts">
defineProps<{
  message?: string
  showRetry?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state">
    <div class="error-icon">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#fa5252" stroke-width="2" />
        <line x1="24" y1="14" x2="24" y2="28" stroke="#fa5252" stroke-width="2" stroke-linecap="round" />
        <circle cx="24" cy="34" r="1.5" fill="#fa5252" />
      </svg>
    </div>
    <h3 class="error-title">加载失败</h3>
    <p class="error-msg">{{ message || '发生了一些错误，请稍后重试。' }}</p>
    <button v-if="showRetry" class="error-retry" @click="$emit('retry')">
      重新加载
    </button>
  </div>
</template>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 48px 24px;
}

.error-icon {
  margin-bottom: 16px;
}

.error-title {
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.error-msg {
  font-size: 13px;
  color: #868e96;
  max-width: 360px;
  text-align: center;
  margin-bottom: 16px;
}

.error-retry {
  padding: 8px 20px;
  background: #fff;
  color: #4c6ef5;
  border: 1px solid #bac8ff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: #eef2ff;
    border-color: #4c6ef5;
  }
}
</style>
