import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** Tracks scroll progress (0–100) through a target element. */
export function useReadingProgress(target: Ref<HTMLElement | null>) {
  const progress = ref(0)

  function update() {
    const el = target.value
    if (!el) return
    const start = el.offsetTop
    const total = el.offsetHeight - window.innerHeight
    const scrolled = window.scrollY - start
    progress.value = total <= 0 ? 100 : Math.min(100, Math.max(0, (scrolled / total) * 100))
  }

  onMounted(() => {
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  })

  return { progress }
}
