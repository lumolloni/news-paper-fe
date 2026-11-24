<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getArticles, getCategoryBySlug } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import type { Article, Category } from '@/types'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const localeStore = useLocaleStore()
const category = ref<Category | null>(null)
const notFound = ref(false)
const articles = ref<Article[]>([])
const page = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const done = ref(false)
const sentinel = ref<HTMLElement | null>(null)
let currentSlug = ''

useSeo(() => ({
  title: category.value?.name,
  description: category.value?.description || undefined,
  noindex: notFound.value,
}))

async function loadMore() {
  if (loadingMore.value || done.value || !currentSlug) return
  loadingMore.value = true
  try {
    const res = await getArticles({
      category: currentSlug,
      page: page.value,
      pageSize: 9,
      locale: localeStore.locale,
    })
    articles.value.push(...res.data)
    if (page.value >= res.meta.pagination.pageCount) done.value = true
    else page.value += 1
  } finally {
    loadingMore.value = false
  }
}

useInfiniteScroll(sentinel, loadMore)

async function load(slug: string) {
  currentSlug = slug
  loading.value = true
  notFound.value = false
  articles.value = []
  page.value = 1
  done.value = false
  category.value = await getCategoryBySlug(slug, localeStore.locale)
  if (category.value) {
    await loadMore()
  } else {
    notFound.value = true
  }
  loading.value = false
}

watch(
  [() => route.params.catSlug, () => localeStore.locale],
  () => load(route.params.catSlug as string),
  { immediate: true },
)
</script>

<template>
  <div v-if="notFound" class="container empty">
    <h1>{{ $t('pageNotFound') }}</h1>
    <p class="muted">{{ $t('sectionNotExist') }}</p>
    <RouterLink to="/" class="btn btn--accent">{{ $t('backToHome') }}</RouterLink>
  </div>

  <div v-else class="container cat">
    <header class="cat__head" :style="category?.color ? { '--cat': category.color } : undefined">
      <h1 class="cat__title">{{ category?.name ?? '…' }}</h1>
      <p v-if="!category || category.description" class="cat__desc muted">
        {{ category?.description || '\u00a0' }}
      </p>
    </header>

    <div class="grid">
      <ArticleCard
        v-for="(a, i) in articles"
        :key="a.documentId"
        :article="a"
        source="category"
        :position="i + 1"
        :priority="i === 0"
        :heading-level="2"
      />
      <template v-if="loading || loadingMore">
        <SkeletonCard v-for="n in 6" :key="'s' + n" />
      </template>
    </div>

    <p v-if="!loading && !articles.length" class="muted empty">
      {{ $t('noStoriesSection') }}
    </p>
    <div ref="sentinel" class="sentinel"></div>
    <p v-if="done && articles.length" class="muted end">{{ $t('endOfSection') }}</p>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/CategoryView.scss"></style>
