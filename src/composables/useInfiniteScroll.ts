import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useInfiniteScroll(sentinel: Ref<HTMLElement | null>, onLoadMore: () => void) {
  let observer: IntersectionObserver | null = null
  const enabled = ref(true)

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && enabled.value) onLoadMore()
      },
      { rootMargin: '400px 0px' },
    )
    if (sentinel.value) observer.observe(sentinel.value)
  })

  onUnmounted(() => observer?.disconnect())

  function setEnabled(value: boolean) {
    enabled.value = value
  }

  return { setEnabled }
}
