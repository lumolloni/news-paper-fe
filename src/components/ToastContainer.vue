<script setup lang="ts">
import { useToasts } from '@/composables/useToasts'

// Renders the live toast queue. Mounted once near the app root (DefaultLayout).
const { toasts, dismiss } = useToasts()

function activate(id: number, onClick?: () => void) {
  onClick?.()
  dismiss(id)
}
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="{ 'toast--clickable': !!toast.onClick }"
        role="status"
        @click="activate(toast.id, toast.onClick)"
      >
        <img v-if="toast.image" v-img-fallback class="toast__img" :src="toast.image" alt="" />
        <div class="toast__body">
          <p class="toast__title">{{ toast.title }}</p>
          <p v-if="toast.body" class="toast__text">{{ toast.body }}</p>
        </div>
        <button
          class="toast__close"
          type="button"
          :aria-label="$t('dismiss')"
          @click.stop="dismiss(toast.id)"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss" src="@/styles/components/ToastContainer.scss"></style>
