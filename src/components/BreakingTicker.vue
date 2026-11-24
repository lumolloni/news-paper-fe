<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Article } from '@/types'
import { articleRoute } from '@/utils/links'
import { trackArticleClick } from '@/analytics'

defineProps<{ items: Article[]; loading?: boolean }>()
</script>

<template>
  <div v-if="items.length || loading" class="ticker" role="region" :aria-label="$t('breakingNews')">
    <span class="ticker__label">{{ $t('breaking') }}</span>
    <div class="ticker__viewport">
      <div class="ticker__track">
        <RouterLink
          v-for="a in [...items, ...items]"
          :key="a.documentId + Math.random()"
          :to="articleRoute(a)"
          class="ticker__item"
          @click="trackArticleClick(a, 'breaking_ticker')"
        >
          {{ a.title }}
          <span class="ticker__dot">●</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="@/styles/components/BreakingTicker.scss"></style>
