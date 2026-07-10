<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="12" width="48" height="40" rx="4" stroke="#dee2e6" stroke-width="2" />
        <line x1="16" y1="24" x2="48" y2="24" stroke="#dee2e6" stroke-width="2" stroke-linecap="round" />
        <line x1="16" y1="32" x2="40" y2="32" stroke="#dee2e6" stroke-width="2" stroke-linecap="round" />
        <line x1="16" y1="40" x2="32" y2="40" stroke="#dee2e6" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <h3 class="empty-title">{{ title || '暂无数据' }}</h3>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <button v-if="actionLabel" class="empty-action" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 48px 24px;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 13px;
  color: #868e96;
  max-width: 320px;
  text-align: center;
  margin-bottom: 16px;
}

.empty-action {
  padding: 8px 20px;
  background: #4c6ef5;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: #4263eb;
  }
}
</style>
