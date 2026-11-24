<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { trackEvent } from '@/analytics'

const router = useRouter()
const q = ref('')

function submit() {
  const term = q.value.trim()
  if (!term) return
  trackEvent('search_submit', { search_term: term, search_location: 'header' })
  router.push({ name: 'search', query: { q: term } })
}
</script>

<template>
  <form class="search" role="search" @submit.prevent="submit">
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <line
        x1="16.5"
        y1="16.5"
        x2="21"
        y2="21"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    <input
      v-model="q"
      type="search"
      :placeholder="$t('searchPlaceholder')"
      :aria-label="$t('searchArticles')"
    />
  </form>
</template>

<style scoped lang="scss" src="@/styles/components/SearchBar.scss"></style>
