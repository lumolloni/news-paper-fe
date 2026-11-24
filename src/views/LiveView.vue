<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLiveStreams, imageUrl } from '@/api/strapi'
import { trackEvent } from '@/analytics'
import { useSeo } from '@/composables/useSeo'
import type { LiveStream } from '@/types'
import VideoPlayer from '@/components/VideoPlayer.vue'

const { t } = useI18n({ useScope: 'global' })

// Live is behind auth — keep it out of the index.
useSeo(() => ({ title: t('live'), noindex: true }))

const streams = ref<LiveStream[]>([])
const loading = ref(true)
const activeId = ref<number | null>(null)

const active = computed(
  () => streams.value.find((s) => s.id === activeId.value) ?? streams.value[0] ?? null,
)

function poster(s: LiveStream): string {
  return imageUrl(s.poster, s.posterUrl)
}

onMounted(async () => {
  try {
    streams.value = await getLiveStreams()
    activeId.value = streams.value[0]?.id ?? null
    if (active.value) {
      trackEvent('live_stream_view', {
        stream_title: active.value.title,
        stream_slug: active.value.slug,
      })
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container live">
    <header class="live__head">
      <h1 class="live__title">{{ t('live') }}</h1>
    </header>

    <p v-if="loading" class="muted">{{ t('loading') }}</p>

    <p v-else-if="!active" class="muted live__empty">{{ t('liveEmpty') }}</p>

    <template v-else>
      <div class="live__player">
        <span v-if="active.isLive" class="live__badge">
          <span class="live__dot"></span>{{ t('liveNow') }}
        </span>
        <VideoPlayer :src="active.streamUrl" :title="active.title" :poster="poster(active)" />
      </div>

      <div class="live__meta">
        <h2 class="live__name">{{ active.title }}</h2>
        <p v-if="active.description" class="muted">{{ active.description }}</p>
      </div>

      <div v-if="streams.length > 1" class="live__list">
        <button
          v-for="s in streams"
          :key="s.id"
          class="live__item"
          :class="{ 'live__item--active': s.id === active.id }"
          @click="
            ((activeId = s.id),
            trackEvent('live_stream_view', { stream_title: s.title, stream_slug: s.slug }))
          "
        >
          <span class="live__item-thumb">
            <img v-img-fallback :src="poster(s)" :alt="s.title" loading="lazy" />
            <span v-if="s.isLive" class="live__item-flag">{{ t('live') }}</span>
          </span>
          <span class="live__item-title">{{ s.title }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/LiveView.scss"></style>
