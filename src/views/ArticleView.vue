<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getArticleBySlug, getArticles, imageSrcset, imageUrl, incrementViews } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import type { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard.vue'
import ShareButtons from '@/components/ShareButtons.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ReactionBar from '@/components/ReactionBar.vue'
import PollCard from '@/components/PollCard.vue'
import { useReadingProgress } from '@/composables/useReadingProgress'
import { useSeo } from '@/composables/useSeo'
import { formatDate } from '@/utils/format'
import { articleRoute } from '@/utils/links'
import { trackArticleView, trackNavClick, trackReadProgress } from '@/analytics'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const article = ref<Article | null>(null)
const related = ref<Article[]>([])
const loading = ref(true)
const notFound = ref(false)
const body = ref<HTMLElement | null>(null)

const { progress } = useReadingProgress(body)

// Scroll-depth milestones, reported once each per article.
const READ_MILESTONES = [25, 50, 75, 100]
let reportedMilestones = new Set<number>()
watch(progress, (p) => {
  const a = article.value
  if (!a || loading.value) return
  for (const m of READ_MILESTONES) {
    if (p >= m && !reportedMilestones.has(m)) {
      reportedMilestones.add(m)
      trackReadProgress(a, m)
    }
  }
})

const paragraphs = computed(() =>
  (article.value?.content ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean),
)
const cover = computed(() => imageUrl(article.value?.cover, article.value?.coverUrl))
const coverSrcset = computed(() => imageSrcset(article.value?.cover))
// Optional video: prefer an uploaded media file, fall back to a URL/embed link.
const videoSrc = computed(() => imageUrl(article.value?.video, article.value?.videoUrl))
const authorAvatar = computed(() =>
  imageUrl(article.value?.author?.avatar, article.value?.author?.avatarUrl),
)

// SEO: per-article title/description/cover + NewsArticle structured data.
useSeo(() => {
  const a = article.value
  if (!a) return { title: undefined, noindex: notFound.value }
  return {
    title: a.title,
    description: a.excerpt || undefined,
    image: cover.value || undefined,
    type: 'article',
    publishedTime: a.publishedAt,
    author: a.author?.name,
    section: a.category?.name,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description: a.excerpt || undefined,
      image: cover.value ? [cover.value] : undefined,
      datePublished: a.publishedAt,
      articleSection: a.category?.name,
      keywords: a.tags?.map((t) => t.name).join(', ') || undefined,
      author: a.author ? { '@type': 'Person', name: a.author.name } : undefined,
      mainEntityOfPage: window.location.href,
    },
  }
})

async function load(slug: string) {
  loading.value = true
  notFound.value = false
  article.value = null
  try {
    const found = await getArticleBySlug(slug, localeStore.locale)
    if (!found) {
      notFound.value = true
      return
    }
    article.value = found
    incrementViews(found.documentId)

    // Redirect to the canonical section URL when reached via the legacy
    // /article/:slug route (or any non-canonical path). Compare resolved paths
    // to avoid a redirect loop.
    const canonical = router.resolve(articleRoute(found))
    if (canonical.name && canonical.path !== route.path) {
      router.replace(canonical)
      return
    }
    reportedMilestones = new Set()
    trackArticleView(found)
    if (found.category) {
      const rel = await getArticles({
        category: found.category.slug,
        excludeSlug: found.slug,
        pageSize: 3,
        locale: localeStore.locale,
      })
      related.value = rel.data
    }
  } finally {
    loading.value = false
    window.scrollTo({ top: 0 })
  }
}

watch(
  [() => route.params.slug, () => localeStore.locale],
  () => load(route.params.slug as string),
  { immediate: true },
)
</script>

<template>
  <div class="progress" :style="{ transform: `scaleX(${progress / 100})` }"></div>

  <div v-if="loading" class="container article article--loading">
    <div class="skeleton" style="height: 26px; width: 30%; border-radius: 4px"></div>
    <div
      class="skeleton"
      style="height: 60px; width: 90%; margin-top: 1rem; border-radius: 6px"
    ></div>
    <div class="skeleton" style="height: 360px; margin-top: 2rem; border-radius: 12px"></div>
  </div>

  <div v-else-if="notFound" class="container empty">
    <h1>{{ $t('articleNotFound') }}</h1>
    <p class="muted">{{ $t('articleNotFoundText') }}</p>
    <RouterLink to="/" class="btn btn--accent">{{ $t('backToHome') }}</RouterLink>
  </div>

  <article v-else-if="article" class="article">
    <header class="article__head container">
      <RouterLink
        v-if="article.category"
        :to="{ name: 'category', params: { catSlug: article.category.slug } }"
        class="kicker"
        :style="article.category.color ? { color: article.category.color } : undefined"
        @click="trackNavClick('article_category', article.category.name, article.category.slug)"
        >{{ article.category.name }}</RouterLink
      >

      <h1 class="article__title">{{ article.title }}</h1>
      <p v-if="article.excerpt" class="article__excerpt">{{ article.excerpt }}</p>

      <div class="article__byline">
        <RouterLink
          v-if="article.author"
          :to="{ name: 'author', params: { slug: article.author.slug } }"
          class="byline"
          @click="trackNavClick('article_author', article.author.name, article.author.slug)"
        >
          <img
            v-if="authorAvatar"
            v-img-fallback
            :src="authorAvatar"
            :alt="article.author.name"
            class="byline__avatar"
          />
          <span>
            <span class="byline__name">{{ article.author.name }}</span>
            <span v-if="article.author.role" class="byline__role muted">{{
              article.author.role
            }}</span>
          </span>
        </RouterLink>
        <div class="article__facts muted">
          <span>{{ formatDate(article.publishedAt) }}</span>
          <span class="dot">·</span>
          <span>{{ article.readingTime }} {{ $t('minRead') }}</span>
        </div>
      </div>
    </header>

    <figure class="article__cover container">
      <VideoPlayer v-if="videoSrc" :src="videoSrc" :title="article.title" :poster="cover" />
      <img
        v-else
        v-img-fallback
        :src="cover"
        :srcset="coverSrcset"
        :sizes="coverSrcset ? '(max-width: 1200px) 100vw, 1200px' : undefined"
        :alt="article.title"
        fetchpriority="high"
        decoding="async"
      />
    </figure>

    <div class="article__layout container">
      <aside class="article__share">
        <ShareButtons :title="article.title" :article="article" />
      </aside>

      <div ref="body" class="article__body">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>

        <div v-if="article.tags && article.tags.length" class="article__tags">
          <RouterLink
            v-for="t in article.tags"
            :key="t.id"
            :to="{ name: 'search', query: { q: t.name } }"
            class="tag"
            @click="trackNavClick('article_tag', t.name)"
            >#{{ t.name }}</RouterLink
          >
        </div>

        <ReactionBar :key="`r-${article.documentId}`" :article-id="article.documentId" />
        <PollCard :key="`p-${article.documentId}`" :article-id="article.documentId" />
      </div>
    </div>

    <section v-if="related.length" class="related container">
      <h2 class="section-title">{{ $t('relatedStories') }}</h2>
      <div class="related__grid">
        <ArticleCard
          v-for="(a, i) in related"
          :key="a.documentId"
          :article="a"
          source="article_related"
          :position="i + 1"
        />
      </div>
    </section>
  </article>
</template>

<style scoped lang="scss" src="@/styles/views/ArticleView.scss"></style>
