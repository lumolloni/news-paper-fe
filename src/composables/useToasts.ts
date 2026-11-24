import { ref } from 'vue'

export interface Toast {
  id: number
  title: string
  body?: string
  image?: string | null
  onClick?: () => void
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToasts() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }): number {
    const id = nextId++
    const duration = toast.duration ?? 8000
    toasts.value.push({ ...toast, id, duration })
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  return { toasts, push, dismiss }
}
