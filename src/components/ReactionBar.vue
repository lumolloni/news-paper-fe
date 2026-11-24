<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getReactionSummary, react } from '@/api/strapi'
import { useAuthStore } from '@/stores/auth'
import type { ReactionSummary, ReactionType } from '@/types'
import { trackEvent } from '@/analytics'

const props = defineProps<{ articleId: string }>()

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'insightful', emoji: '💡' },
  { type: 'sad', emoji: '😢' },
  { type: 'angry', emoji: '😠' },
]

const summary = ref<ReactionSummary | null>(null)
const pending = ref(false)

onMounted(async () => {
  try {
    summary.value = await getReactionSummary(props.articleId)
  } catch {
    summary.value = null
  }
})

async function choose(type: ReactionType) {
  if (!auth.isAuthenticated) {
    trackEvent('login_prompt', { trigger: 'reaction', article_id: props.articleId })
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (pending.value) return
  pending.value = true
  try {
    summary.value = await react(props.articleId, type)
    trackEvent('article_reaction', { article_id: props.articleId, reaction: type })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section v-if="summary" class="reactions">
    <h2 class="reactions__title">{{ t('reactionsTitle') }}</h2>
    <div class="reactions__row">
      <button
        v-for="r in REACTIONS"
        :key="r.type"
        class="reactions__btn"
        :class="{ 'reactions__btn--on': summary.userReaction === r.type }"
        :title="t(`react${r.type.charAt(0).toUpperCase() + r.type.slice(1)}`)"
        :aria-label="`${t(`react${r.type.charAt(0).toUpperCase() + r.type.slice(1)}`)} ${summary.counts[r.type]}`"
        :disabled="pending"
        @click="choose(r.type)"
      >
        <span class="reactions__emoji" aria-hidden="true">{{ r.emoji }}</span>
        <span class="reactions__count">{{ summary.counts[r.type] }}</span>
      </button>
    </div>
    <p v-if="!auth.isAuthenticated" class="reactions__hint muted">{{ t('signInToReact') }}</p>
  </section>
</template>

<style scoped lang="scss" src="@/styles/components/ReactionBar.scss"></style>
