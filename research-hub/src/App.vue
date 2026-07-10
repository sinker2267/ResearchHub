<script setup lang="ts">
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
const route = useRoute()
</script>
<template>
  <router-view v-if="route.meta.public" />
  <admin-layout v-else-if="route.meta.layout === 'admin'" />
  <default-layout v-else />
</template>
