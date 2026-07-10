import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const userStore = useUserStore()
    const permission = binding.value

    if (!permission) return

    const hasAccess = Array.isArray(permission)
      ? userStore.hasAnyPermission(permission)
      : userStore.hasPermission(permission)

    if (!hasAccess) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default permissionDirective
