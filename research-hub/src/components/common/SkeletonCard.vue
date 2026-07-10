<script setup lang="ts">
defineProps<{
  lines?: number
  image?: boolean
}>()
</script>

<template>
  <div class="skeleton-card">
    <div v-if="image" class="skeleton-image skeleton" />
    <div class="skeleton-body">
      <div class="skeleton skeleton-title" />
      <div
        v-for="i in (lines || 3)"
        :key="i"
        class="skeleton skeleton-line"
        :style="{ width: `${100 - (i * 15)}%` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 160px;
  border-radius: 0;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-title {
  height: 18px;
  width: 60%;
}

.skeleton-line {
  height: 12px;
}
</style>
