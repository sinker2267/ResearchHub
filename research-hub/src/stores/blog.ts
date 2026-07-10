import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BlogPost, BlogListParams, BlogComment, Pagination } from '@/types'
import { PAGINATION_DEFAULTS } from '@/constants'
import { blogApi } from '@/api'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPost[]>([])
  const currentPost = ref<BlogPost | null>(null)
  const comments = ref<BlogComment[]>([])
  const recommendations = ref<BlogPost[]>([])
  const pagination = ref<Pagination>({ page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE, total: 0, totalPages: 0 })

  async function fetchPosts(params: BlogListParams): Promise<void> {
    const res = await blogApi.getList(params)
    posts.value = res.data.data
    pagination.value = res.data.pagination
  }

  async function fetchPost(id: number): Promise<void> {
    const res = await blogApi.getDetail(id)
    currentPost.value = res.data
  }

  async function fetchComments(blogId: number): Promise<void> {
    const res = await blogApi.getComments(blogId, { page: 1, pageSize: 50 })
    comments.value = res.data.data
  }

  async function fetchRecommendations(blogId: number): Promise<void> {
    const res = await blogApi.getRecommendations(blogId)
    recommendations.value = res.data
  }

  async function toggleLike(postId: number): Promise<void> {
    const res = await blogApi.like(postId)
    if (currentPost.value?.id === postId) {
      currentPost.value.isLiked = res.data.liked
      currentPost.value.likeCount += res.data.liked ? 1 : -1
    }
    const p = posts.value.find((p) => p.id === postId)
    if (p) { p.isLiked = res.data.liked; p.likeCount += res.data.liked ? 1 : -1 }
  }

  async function toggleFavorite(postId: number): Promise<void> {
    const res = await blogApi.favorite(postId)
    if (currentPost.value?.id === postId) currentPost.value.isFavorited = res.data.favorited
  }

  return {
    posts, currentPost, comments, recommendations, pagination,
    fetchPosts, fetchPost, fetchComments, fetchRecommendations,
    toggleLike, toggleFavorite,
  }
})
