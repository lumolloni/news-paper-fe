<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import BreakingTicker from '@/components/BreakingTicker.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { getArticles } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import { useArticleSocket } from '@/composables/useArticleSocket'
import type { Article } from '@/types'

const localeStore = useLocaleStore()

useArticleSocket()
const breaking = ref<Article[]>([])
const breakingLoading = ref(true)

watch(
  () => localeStore.locale,
  async (locale) => {
    try {
      const res = await getArticles({ breaking: true, pageSize: 6, locale })
      breaking.value = res.data
    } catch {
      breaking.value = []
    } finally {
      breakingLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <BreakingTicker :items="breaking" :loading="breakingLoading" />
  <AppHeader />
  <main class="main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
  <ToastContainer />
</template>

<style scoped lang="scss" src="@/styles/layouts/DefaultLayout.scss"></style>
