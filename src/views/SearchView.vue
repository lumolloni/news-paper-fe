<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchArticles } from '@/api/strapi'
import { trackEvent } from '@/analytics'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useSeo } from '@/composables/useSeo'
import type { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

const route = useRoute()
const localeStore = useLocaleStore()
const { t } = useI18n({ useScope: 'global' })
const results = ref<Article[]>([])
const total = ref(0)
const loading = ref(false)
const query = ref('')

// Search result pages should not be indexed.
useSeo(() => ({
  title: query.value ? `“${query.value}” — ${t('search')}` : t('search'),
  rawTitle: true,
  noindex: true,
}))

async function run(q: string) {
  query.value = q
  if (!q) {
    results.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res = await searchArticles(q, 1, 24, localeStore.locale)
    results.value = res.data
    total.value = res.meta.pagination.total
    // GA4 recommended event for site search.
    trackEvent('search', { search_term: q, results: total.value })
  } finally {
    loading.value = false
  }
}

watch([() => route.query.q, () => localeStore.locale], () => run((route.query.q as string) ?? ''), {
  immediate: true,
})
</script>

<template>
  <div class="container search-page">
    <header class="search-page__head">
      <span class="kicker">{{ t('search') }}</span>
      <h1 class="search-page__title">“{{ query }}”</h1>
      <p v-if="!loading" class="muted">
        {{ total }} {{ total === 1 ? t('searchResult') : t('searchResults') }}
      </p>
    </header>

    <div class="grid">
      <ArticleCard
        v-for="(a, i) in results"
        :key="a.documentId"
        :article="a"
        source="search_results"
        :position="i + 1"
        :priority="i === 0"
        :heading-level="2"
      />
      <template v-if="loading">
        <SkeletonCard v-for="n in 6" :key="n" />
      </template>
    </div>

    <p v-if="!loading && query && !results.length" class="muted empty">
      {{ t('searchEmpty') }}
    </p>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/SearchView.scss"></style>
