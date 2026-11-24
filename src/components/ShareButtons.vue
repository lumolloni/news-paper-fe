<script setup lang="ts">
import { ref } from 'vue'
import type { Article } from '@/types'
import { trackShare } from '@/analytics'

const props = defineProps<{ title: string; article?: Article }>()
const copied = ref(false)
const url = () => window.location.href

function open(target: 'x' | 'facebook' | 'linkedin') {
  const u = encodeURIComponent(url())
  const t = encodeURIComponent(props.title)
  const map = {
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  }
  trackShare(target, props.article)
  window.open(map[target], '_blank', 'noopener,width=600,height=520')
}

async function copy() {
  await navigator.clipboard.writeText(url())
  trackShare('copy_link', props.article)
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <div class="share">
    <span class="share__label">{{ $t('share') }}</span>
    <button class="share__btn" :aria-label="$t('shareOnX')" @click="open('x')">
      <span class="share__glyph" data-glyph="𝕏" aria-hidden="true"></span>
    </button>
    <button class="share__btn" :aria-label="$t('shareOnFacebook')" @click="open('facebook')">
      <span class="share__glyph" data-glyph="f" aria-hidden="true"></span>
    </button>
    <button class="share__btn" :aria-label="$t('shareOnLinkedIn')" @click="open('linkedin')">
      <span class="share__glyph" data-glyph="in" aria-hidden="true"></span>
    </button>
    <button
      class="share__btn share__btn--copy"
      :class="{ ok: copied }"
      :aria-label="$t('copyLink')"
      @click="copy"
    >
      <span aria-hidden="true">{{ copied ? '✓' : '🔗' }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss" src="@/styles/components/ShareButtons.scss"></style>
