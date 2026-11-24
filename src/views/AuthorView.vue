<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticlesByAuthor, getAuthorBySlug, imageUrl } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import type { Article, Author } from '@/types'
import ArticleCard from '@/components/ArticleCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const localeStore = useLocaleStore()
const author = ref<Author | null>(null)
const articles = ref<Article[]>([])
const loading = ref(true)

const avatar = computed(() => imageUrl(author.value?.avatar, author.value?.avatarUrl))

useSeo(() => ({
  title: author.value?.name,
  description: author.value?.bio || undefined,
  image: avatar.value || undefined,
  jsonLd: author.value
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: author.value.name,
          jobTitle: author.value.role || undefined,
          description: author.value.bio || undefined,
        },
      }
    : undefined,
}))

async function load(slug: string) {
  loading.value = true
  articles.value = []
  author.value = await getAuthorBySlug(slug, localeStore.locale)
  if (author.value) {
    const res = await getArticlesByAuthor(slug, 1, 12, localeStore.locale)
    articles.value = res.data
  }
  loading.value = false
}

watch(
  [() => route.params.slug, () => localeStore.locale],
  () => load(route.params.slug as string),
  { immediate: true },
)
</script>

<template>
  <div class="container author">
    <header v-if="author" class="author__head">
      <img v-if="avatar" v-img-fallback :src="avatar" :alt="author.name" class="author__avatar" />
      <div>
        <span class="kicker">{{ author.role }}</span>
        <h1 class="author__name">{{ author.name }}</h1>
        <p v-if="author.bio" class="author__bio">{{ author.bio }}</p>
      </div>
    </header>

    <h2 class="section-title">{{ $t('latestBy') }} {{ author?.name ?? $t('thisAuthor') }}</h2>
    <div class="grid">
      <ArticleCard
        v-for="(a, i) in articles"
        :key="a.documentId"
        :article="a"
        source="author"
        :position="i + 1"
        :priority="i === 0"
      />
      <template v-if="loading">
        <SkeletonCard v-for="n in 6" :key="n" />
      </template>
    </div>
    <p v-if="!loading && !articles.length" class="muted empty">{{ $t('noArticlesYet') }}</p>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/AuthorView.scss"></style>
