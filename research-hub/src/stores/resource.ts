import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Resource, ResourceListParams, Pagination, Category, Tag } from '@/types'
import { PAGINATION_DEFAULTS } from '@/constants'
import { resourceApi } from '@/api'

export const useResourceStore = defineStore('resource', () => {
  const resources = ref<Resource[]>([])
  const currentResource = ref<Resource | null>(null)
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])
  const pagination = ref<Pagination>({ page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE, total: 0, totalPages: 0 })

  async function fetchResources(params: ResourceListParams): Promise<void> {
    const res = await resourceApi.getList(params)
    resources.value = res.data.data
    pagination.value = res.data.pagination
  }

  async function fetchResource(id: number): Promise<void> {
    const res = await resourceApi.getDetail(id)
    currentResource.value = res.data
  }

  async function fetchCategories(): Promise<void> {
    const res = await resourceApi.getCategories()
    categories.value = res.data
  }

  async function fetchTags(): Promise<void> {
    const res = await resourceApi.getTags()
    tags.value = res.data
  }

  return {
    resources, currentResource, categories, tags, pagination,
    fetchResources, fetchResource, fetchCategories, fetchTags,
  }
})
