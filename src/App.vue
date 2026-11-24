<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import { useLocaleStore } from '@/stores/locale'
import { useSettingsStore } from '@/stores/settings'
import { SITE_URL } from '@/composables/useSeo'

const layouts = {
  default: DefaultLayout,
  blank: BlankLayout,
}

const route = useRoute()
const localeStore = useLocaleStore()
const settings = useSettingsStore()

const layout = computed(
  () => layouts[(route.meta.layout as keyof typeof layouts) ?? 'default'] ?? DefaultLayout,
)

watch(
  () => localeStore.locale,
  (locale) => settings.load(locale),
  { immediate: true },
)

// Site-wide Organization + WebSite structured data (with a Sitelinks search box).
// Persistent across routes, so it lives outside the per-route useSeo manager.
const GLOBAL_LD = 'data-seo-global'
watch(
  () => settings.settings,
  (s) => {
    const origin = SITE_URL || window.location.origin
    const name = s?.siteName || 'Meridian'
    document.head.querySelectorAll(`[${GLOBAL_LD}]`).forEach((el) => el.remove())
    const blocks: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url: origin,
        ...(s?.logoUrl ? { logo: s.logoUrl } : {}),
        ...(s?.socialLinks?.length
          ? { sameAs: s.socialLinks.map((l) => l.url).filter(Boolean) }
          : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url: origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ]
    for (const block of blocks) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute(GLOBAL_LD, '')
      script.textContent = JSON.stringify(block)
      document.head.appendChild(script)
    }
  },
  { immediate: true },
)
</script>

<template>
  <component :is="layout" />
</template>
