<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useSeo } from '@/composables/useSeo'

const { t } = useI18n({ useScope: 'global' })
useSeo(() => ({ title: t('createAccount'), noindex: true }))
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.register(username.value.trim(), email.value.trim(), password.value)
    const redirect = (route.query.redirect as string) || '/live'
    router.replace(redirect)
  } catch {
    error.value = t('registerError')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container auth">
    <div class="auth__card">
      <h1 class="auth__title">{{ t('createAccount') }}</h1>

      <form class="auth__form" @submit.prevent="onSubmit">
        <label class="auth__field">
          <span>{{ t('username') }}</span>
          <input v-model="username" type="text" autocomplete="username" required />
        </label>
        <label class="auth__field">
          <span>{{ t('fieldEmail') }}</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label class="auth__field">
          <span>{{ t('password') }}</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>

        <p v-if="error" class="auth__error">{{ error }}</p>

        <button class="btn btn--accent auth__submit" type="submit" :disabled="submitting">
          {{ submitting ? t('signingIn') : t('createAccount') }}
        </button>
      </form>

      <p class="auth__alt">
        {{ t('haveAccount') }}
        <RouterLink :to="{ name: 'login', query: route.query }">{{ t('login') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss" src="@/styles/views/AuthView.scss"></style>
