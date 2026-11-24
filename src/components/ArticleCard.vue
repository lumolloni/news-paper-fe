<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { Article } from '@/types'
import { imageSrcset, imageUrl } from '@/api/strapi'
import { timeAgo } from '@/utils/format'
import { articleRoute } from '@/utils/links'
import { trackArticleClick, trackNavClick } from '@/analytics'

const props = withDefaults(
  defineProps<{
    article: Article
    variant?: 'hero' | 'default' | 'compact' | 'text'
    /** Where the card is shown (e.g. `home_latest`), sent to GA as `click_source`. */
    source?: string
    /** 1-based position within its list, sent to GA as `position`. */
    position?: number
    /** Above-the-fold card (likely LCP): load eagerly with high fetch priority. */
    priority?: boolean
    /** Title heading level; use 2 when the list sits directly under the page h1. */
    headingLevel?: 2 | 3
  }>(),
  {
    variant: 'default',
    source: undefined,
    position: undefined,
    priority: false,
    headingLevel: 3,
  },
)

const route = useRoute()
const clickSource = computed(() => props.source ?? String(route.name ?? 'unknown'))

function onArticleClick(target: 'image' | 'title') {
  trackArticleClick(props.article, clickSource.value, {
    click_target: target,
    card_variant: props.variant,
    position: props.position,
  })
}

const cover = computed(() => imageUrl(props.article.cover, props.article.coverUrl))
const srcset = computed(() => imageSrcset(props.article.cover))
// Rendered width per variant: hero spans ~2/3 of the 1200px container on
// desktop, other cards ~1/3; all go full-width on phones.
const sizes = computed(() =>
  props.variant === 'hero'
    ? '(max-width: 900px) 100vw, 800px'
    : '(max-width: 640px) 100vw, (max-width: 900px) 50vw, 400px',
)
const to = computed(() => articleRoute(props.article))
</script>

<template>
  <article class="card" :class="`card--${variant}`">
    <RouterLink
      v-if="variant !== 'text'"
      :to="to"
      class="card__media"
      @click="onArticleClick('image')"
    >
      <img
        v-img-fallback
        :src="cover"
        :srcset="srcset"
        :sizes="srcset ? sizes : undefined"
        :alt="article.title"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
      />
      <span v-if="article.breaking" class="card__flag">{{ $t('breaking') }}</span>
    </RouterLink>

    <div class="card__body">
      <RouterLink
        v-if="article.category"
        :style="article.category.color ? { color: article.category.color } : undefined"
        :to="{ name: 'category', params: { catSlug: article.category.slug } }"
        class="kicker card__cat"
        @click="
          trackNavClick('article_card_category', article.category.name, article.category.slug)
        "
        >{{ article.category.name }}</RouterLink
      >

      <component :is="`h${headingLevel}`" class="card__title">
        <RouterLink :to="to" @click="onArticleClick('title')">{{ article.title }}</RouterLink>
      </component>

      <p v-if="variant !== 'compact'" class="card__excerpt">{{ article.excerpt }}</p>

      <div class="card__meta">
        <RouterLink
          v-if="article.author"
          :to="{ name: 'author', params: { slug: article.author.slug } }"
          class="card__author"
          @click="trackNavClick('article_card_author', article.author.name, article.author.slug)"
          >{{ article.author.name }}</RouterLink
        >
        <span v-if="article.author" class="card__sep">·</span>
        <span>{{ article.readingTime }} {{ $t('minRead') }}</span>
        <span class="card__sep">·</span>
        <span>{{ timeAgo(article.publishedAt) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss" src="@/styles/components/ArticleCard.scss"></style>
