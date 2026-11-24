<script setup lang="ts">
// Vidstack player (v0.6) with the community skin for a polished, responsive UI.
// `src` may be a direct file URL (MP4/HLS) or a YouTube/Vimeo link — Vidstack
// picks the right provider automatically.
import 'vidstack/styles/defaults.css'
import 'vidstack/styles/community-skin/video.css'
import 'vidstack/define/media-player'
import 'vidstack/define/media-outlet'
import 'vidstack/define/media-community-skin'
import { ref } from 'vue'
import { trackEvent } from '@/analytics'

const props = defineProps<{ src: string; title?: string; poster?: string }>()

let started = false
function onPlay() {
  if (started) return
  started = true
  trackEvent('video_start', { video_title: props.title, video_url: props.src })
}
function onEnded() {
  trackEvent('video_complete', { video_title: props.title, video_url: props.src })
}

// Vidstack dispatches an `error` event when the media can't be loaded/decoded
// (bad URL, 404, unsupported source). We swap the player for a friendly box.
const failed = ref(false)
function onError() {
  failed.value = true
  trackEvent('video_error', { video_title: props.title, video_url: props.src })
}
</script>

<template>
  <div v-if="failed" class="video-fallback" role="img" aria-label="Video unavailable">
    <svg
      class="video-fallback__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M21 7l-5 4v2" />
      <path d="M16 16H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
    </svg>
    <p class="video-fallback__text">Video unavailable</p>
    <p class="video-fallback__hint">This video couldn’t be loaded.</p>
  </div>

  <media-player
    v-else
    class="video-player"
    :title="title"
    :src="src"
    :poster="poster"
    playsinline
    load="visible"
    @error="onError"
    @play="onPlay"
    @ended="onEnded"
  >
    <media-outlet></media-outlet>
    <media-community-skin></media-community-skin>
  </media-player>
</template>

<style scoped lang="scss" src="@/styles/components/VideoPlayer.scss"></style>
