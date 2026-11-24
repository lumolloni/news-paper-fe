<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAboutPage, imageUrl } from '@/api/strapi'
import type { AboutPage } from '@/types'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useSeo } from '@/composables/useSeo'

const localeStore = useLocaleStore()
const { t } = useI18n({ useScope: 'global' })

const page = ref<AboutPage | null>(null)

useSeo(() => ({
  title: page.value?.title || t('aboutDefault'),
  description: page.value?.subtitle || page.value?.mission || undefined,
}))
const loading = ref(true)
const error = ref(false)

let reqId = 0

async function load() {
  reqId += 1
  const myReq = reqId
  loading.value = true
  error.value = false
  try {
    const p = await getAboutPage(localeStore.locale)
    if (myReq !== reqId) return
    page.value = p
  } catch {
    if (myReq === reqId) error.value = true
  } finally {
    if (myReq === reqId) loading.value = false
  }
}

watch(() => localeStore.locale, load, { immediate: true })
</script>

<template>
  <div class="about-view">
    <p v-if="loading" class="about-state">{{ t('loading') }}</p>
    <p v-else-if="error" class="about-state">{{ t('couldNotLoad') }}</p>

    <article v-else class="about">
      <header
        class="about-hero"
        :style="
          page?.heroImage || page?.heroImageUrl
            ? { backgroundImage: `url(${imageUrl(page?.heroImage, page?.heroImageUrl)})` }
            : undefined
        "
      >
        <h1>{{ page?.title || t('aboutDefault') }}</h1>
        <p v-if="page?.subtitle" class="about-subtitle">{{ page.subtitle }}</p>
      </header>

      <section v-if="page?.mission" class="about-mission">
        <p>{{ page.mission }}</p>
      </section>

      <section v-if="page?.body" class="about-body" v-html="page.body"></section>
    </article>
  </div>
</template>

<style scoped lang="scss">
.about-view {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
.about-state {
  text-align: center;
  color: var(--color-muted, #888);
  padding: 4rem 0;
}
.about-hero {
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  h1 {
    font-family: var(--font-serif, serif);
    font-size: clamp(2rem, 5vw, 3rem);
    margin: 0;
  }
}
.about-subtitle {
  font-size: 1.15rem;
  color: var(--color-muted, #666);
  margin-top: 0.5rem;
}
.about-mission {
  font-size: 1.2rem;
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.about-body {
  line-height: 1.8;
  font-size: 1.05rem;
  :deep(p) {
    margin: 0 0 1.25rem;
  }
}
</style>
