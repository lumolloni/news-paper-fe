<script setup lang="ts">
import { defineAsyncComponent, shallowRef, watch, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryBySlug } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'

// Resolver for the ambiguous /:catSlug/:slug route. If the slug names a
// subcategory of the category it's a subcategory feed; otherwise it's an article.
// Children are async-imported so each stays in its own lazy chunk.
const SubcategoryView = defineAsyncComponent(() => import('./SubcategoryView.vue'))
const ArticleView = defineAsyncComponent(() => import('./ArticleView.vue'))

const route = useRoute()
const localeStore = useLocaleStore()
const view = shallowRef<Component | null>(null)

async function resolve() {
  const catSlug = route.params.catSlug as string
  const slug = route.params.slug as string
  const category = await getCategoryBySlug(catSlug, localeStore.locale)
  const isSubcategory = category?.subcategories?.some((s) => s.slug === slug) ?? false
  view.value = isSubcategory ? SubcategoryView : ArticleView
}

watch([() => route.params.catSlug, () => route.params.slug, () => localeStore.locale], resolve, {
  immediate: true,
})
</script>

<template>
  <component :is="view" v-if="view" />
</template>
