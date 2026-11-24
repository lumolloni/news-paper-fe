<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeo } from '@/composables/useSeo'

const { t } = useI18n({ useScope: 'global' })
useSeo(() => ({ title: t('pageNotFound'), noindex: true }))
</script>

<template>
  <div class="container nf">
    <span class="nf__code">404</span>
    <h1 class="nf__title">{{ $t('pageNotFound') }}</h1>
    <p class="muted">{{ $t('pageNotFoundText') }}</p>
    <RouterLink to="/" class="btn btn--accent">{{ $t('backToHome') }}</RouterLink>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/NotFound.scss"></style>
