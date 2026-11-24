<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { trackEvent } from '@/analytics'
const theme = useThemeStore()

function toggle() {
  theme.toggle()
  trackEvent('theme_change', { theme: theme.theme })
}
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="theme.theme === 'dark' ? $t('lightMode') : $t('darkMode')"
    @click="toggle"
  >
    <svg
      v-if="theme.theme === 'dark'"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
      </g>
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" />
    </svg>
  </button>
</template>

<style scoped lang="scss" src="@/styles/components/ThemeToggle.scss"></style>
