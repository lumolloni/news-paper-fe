import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Socket } from 'socket.io-client'
import { BASE, imageUrl } from '@/api/client'
import { articleRoute } from '@/utils/links'
import { useToasts } from '@/composables/useToasts'
import { useI18n } from 'vue-i18n'

/** Shape of the `article:new` payload broadcast by the Strapi backend. */
interface NewArticleEvent {
  documentId: string
  title: string
  slug: string
  excerpt?: string | null
  coverUrl?: string | null
  category?: { slug: string; name?: string } | null
  subcategory?: { slug: string } | null
}

export function useArticleSocket() {
  const router = useRouter()
  const { push } = useToasts()
  const { t } = useI18n({ useScope: 'global' })

  let socket: Socket | null = null
  let disposed = false

  // socket.io-client (~13 KB gz) is loaded after the page is interactive so it
  // stays out of the initial bundle; toasts are not needed for first paint.
  onMounted(() => {
    const start = async () => {
      const { io } = await import('socket.io-client')
      if (disposed) return
      socket = io(BASE || undefined, { path: '/socket.io' })
      bind(socket)
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => void start())
    else setTimeout(() => void start(), 1500)
  })

  function bind(socket: Socket) {
    socket.on('article:new', (article: NewArticleEvent) => {
      push({
        title: article.category?.name ? `${t('newIn')} ${article.category.name}` : t('newArticle'),
        body: article.title,
        image: article.coverUrl ? imageUrl({ url: article.coverUrl }) : null,
        onClick: () =>
          router.push(
            articleRoute({
              slug: article.slug,
              category: article.category as never,
              subcategory: article.subcategory as never,
            }),
          ),
      })
    })

    socket.on('article:updated', (article: NewArticleEvent) => {
      push({
        title: article.category?.name ? `Updated in ${article.category.name}` : 'Updated article',
        body: article.title,
        image: article.coverUrl ? imageUrl({ url: article.coverUrl }) : null,
        onClick: () =>
          router.push(
            articleRoute({
              slug: article.slug,
              category: article.category as never,
              subcategory: article.subcategory as never,
            }),
          ),
      })
    })
  }

  onBeforeUnmount(() => {
    disposed = true
    socket?.disconnect()
  })
}
