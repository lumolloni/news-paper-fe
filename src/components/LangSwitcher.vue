<script setup lang="ts">
import { useLocaleStore, LOCALES } from '@/stores/locale'
import type { Locale } from '@/types'
import { trackEvent } from '@/analytics'
const locale = useLocaleStore()

function choose(code: Locale) {
  if (code !== locale.locale) trackEvent('language_change', { from: locale.locale, to: code })
  locale.set(code)
}
</script>

<template>
  <div class="lang" role="group" :aria-label="$t('language')">
    <button
      v-for="l in LOCALES"
      :key="l.code"
      class="lang__btn"
      :class="{ 'lang__btn--active': locale.locale === l.code }"
      :aria-pressed="locale.locale === l.code"
      @click="choose(l.code)"
    >
      {{ l.label }}
    </button>
  </div>
</template>

<style scoped lang="scss" src="@/styles/components/LangSwitcher.scss"></style>
