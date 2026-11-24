<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getArticles, getTrending } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import type { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useSeo } from '@/composables/useSeo'
import { timeAgo } from '@/utils/format'
import { articleRoute } from '@/utils/links'
import { trackArticleClick } from '@/analytics'

const localeStore = useLocaleStore()

// Home uses the site name as title with the CMS tagline as description.
useSeo(() => ({ canonical: '/' }))
const featured = ref<Article[]>([])
const trending = ref<Article[]>([])
const latest = ref<Article[]>([])
const loadingTop = ref(true)
const page = ref(1)
const loadingMore = ref(false)
const done = ref(false)
const sentinel = ref<HTMLElement | null>(null)

async function loadMore() {
  if (loadingMore.value || done.value) return
  loadingMore.value = true
  try {
    const res = await getArticles({ page: page.value, pageSize: 6, locale: localeStore.locale })
    latest.value.push(...res.data)
    if (page.value >= res.meta.pagination.pageCount) done.value = true
    else page.value += 1
  } finally {
    loadingMore.value = false
  }
}

useInfiniteScroll(sentinel, loadMore)

async function load() {
  loadingTop.value = true
  featured.value = []
  trending.value = []
  latest.value = []
  page.value = 1
  done.value = false
  try {
    const [feat, trend] = await Promise.all([
      getArticles({ featured: true, pageSize: 5, locale: localeStore.locale }),
      getTrending(5, localeStore.locale),
    ])
    featured.value = feat.data
    trending.value = trend
  } finally {
    loadingTop.value = false
  }
  await loadMore()
}

watch(() => localeStore.locale, load, { immediate: true })
</script>

<template>
  <div class="container home">
    <section class="hero" :aria-label="$t('topStories')">
      <template v-if="loadingTop">
        <div class="hero__lead"><SkeletonCard /></div>
        <div class="hero__rail">
          <SkeletonCard v-for="n in 3" :key="n" />
        </div>
      </template>
      <template v-else-if="featured.length">
        <div class="hero__lead">
          <ArticleCard
            :article="featured[0]"
            variant="hero"
            source="home_hero"
            :position="1"
            priority
          />
        </div>
        <aside class="hero__rail">
          <ArticleCard
            v-for="(a, i) in featured.slice(1, 4)"
            :key="a.documentId"
            :article="a"
            variant="default"
            source="home_featured_rail"
            :position="i + 2"
          />
        </aside>
      </template>
    </section>

    <div class="layout">
      <section class="feed" :aria-label="$t('latestNews')">
        <h2 class="section-title">{{ $t('latest') }}</h2>
        <div class="grid">
          <ArticleCard
            v-for="(a, i) in latest"
            :key="a.documentId"
            :article="a"
            source="home_latest"
            :position="i + 1"
          />
        </div>
        <div v-if="loadingMore" class="grid grid--loading">
          <SkeletonCard v-for="n in 3" :key="n" />
        </div>
        <div ref="sentinel" class="sentinel"></div>
        <p v-if="done && latest.length" class="feed__end muted">{{ $t('allCaughtUp') }}</p>
      </section>

      <aside class="rail" :aria-label="$t('mostRead')">
        <div class="rail__sticky">
          <h2 class="section-title">{{ $t('mostRead') }}</h2>
          <ol class="most">
            <li v-for="(a, i) in trending" :key="a.documentId" class="most__item">
              <span class="most__num">{{ i + 1 }}</span>
              <div>
                <RouterLink
                  :to="articleRoute(a)"
                  class="most__title"
                  @click="trackArticleClick(a, 'home_most_read', { position: i + 1 })"
                >
                  {{ a.title }}
                </RouterLink>
                <div class="most__meta muted">
                  {{ a.views.toLocaleString() }} {{ $t('views') }} ·
                  {{ timeAgo(a.publishedAt) }}
                </div>
              </div>
            </li>
          </ol>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/HomeView.scss"></style>
