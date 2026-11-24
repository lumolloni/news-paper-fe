<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getPollForArticle, votePoll } from '@/api/strapi'
import { useAuthStore } from '@/stores/auth'
import type { Poll } from '@/types'
import { trackEvent } from '@/analytics'

const props = defineProps<{ articleId: string }>()

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const poll = ref<Poll | null>(null)
const pending = ref(false)

const voted = computed(() => poll.value?.userVote != null)

function pct(votes: number): number {
  const total = poll.value?.total ?? 0
  return total > 0 ? Math.round((votes / total) * 100) : 0
}

onMounted(async () => {
  try {
    poll.value = await getPollForArticle(props.articleId)
  } catch {
    poll.value = null
  }
})

async function vote(index: number) {
  if (!auth.isAuthenticated) {
    trackEvent('login_prompt', { trigger: 'poll', article_id: props.articleId })
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (pending.value || voted.value || !poll.value) return
  pending.value = true
  try {
    const pollId = poll.value.documentId
    poll.value = await votePoll(pollId, index)
    trackEvent('poll_vote', { article_id: props.articleId, poll_id: pollId, option_index: index })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section v-if="poll" class="poll">
    <h3 class="poll__q">{{ poll.question }}</h3>

    <ul class="poll__options">
      <li v-for="opt in poll.options" :key="opt.index">
        <button
          class="poll__opt"
          :class="{
            'poll__opt--voted': poll.userVote === opt.index,
            'poll__opt--results': voted,
          }"
          :disabled="voted || pending"
          @click="vote(opt.index)"
        >
          <span v-if="voted" class="poll__bar" :style="{ width: pct(opt.votes) + '%' }"></span>
          <span class="poll__label">{{ opt.label }}</span>
          <span v-if="voted" class="poll__pct">{{ pct(opt.votes) }}%</span>
        </button>
      </li>
    </ul>

    <p class="poll__foot muted">
      <template v-if="voted"
        >{{ t('pollThanks') }} · {{ poll.total }} {{ t('votesLabel') }}</template
      >
      <template v-else-if="!auth.isAuthenticated">{{ t('signInToVote') }}</template>
      <template v-else>{{ poll.total }} {{ t('votesLabel') }}</template>
    </p>
  </section>
</template>

<style scoped lang="scss" src="@/styles/components/PollCard.scss"></style>
