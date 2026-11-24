<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { getContactPage, submitContactMessage } from '@/api/strapi'
import type { ContactPage } from '@/types'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import { useSeo } from '@/composables/useSeo'
import { trackEvent } from '@/analytics'

const localeStore = useLocaleStore()
const { t } = useI18n({ useScope: 'global' })

const page = ref<ContactPage | null>(null)

useSeo(() => ({
  title: page.value?.title || t('Contact'),
  description: page.value?.intro || undefined,
}))
const loading = ref(true)

const form = reactive({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')

let reqId = 0

async function load() {
  reqId += 1
  const myReq = reqId
  loading.value = true
  try {
    const p = await getContactPage(localeStore.locale)
    if (myReq !== reqId) return
    page.value = p
  } catch {
    /* page content is optional */
  } finally {
    if (myReq === reqId) loading.value = false
  }
}

watch(() => localeStore.locale, load, { immediate: true })

async function onSubmit() {
  errorMsg.value = ''
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    errorMsg.value = t('contactFillError')
    return
  }
  submitting.value = true
  try {
    await submitContactMessage({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || undefined,
      message: form.message.trim(),
    })
    success.value = true
    trackEvent('contact_submit')
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch {
    errorMsg.value = t('subscribeError')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="contact-view">
    <header class="contact-header">
      <h1>{{ page?.title || t('Contact') }}</h1>
      <p v-if="page?.intro" class="contact-intro">{{ page.intro }}</p>
    </header>

    <div class="contact-grid">
      <aside v-if="page?.email || page?.phone || page?.address" class="contact-details">
        <p v-if="page?.email">
          <span class="label">{{ t('fieldEmail') }}</span>
          <a
            :href="`mailto:${page.email}`"
            @click="trackEvent('contact_click', { method: 'email' })"
            >{{ page.email }}</a
          >
        </p>
        <p v-if="page?.phone">
          <span class="label">{{ t('fieldPhone') }}</span>
          <a
            :href="`tel:${page.phone}`"
            @click="trackEvent('contact_click', { method: 'phone' })"
            >{{ page.phone }}</a
          >
        </p>
        <p v-if="page?.address" class="contact-address">
          <span class="label">{{ t('fieldAddress') }}</span>
          {{ page.address }}
        </p>
      </aside>

      <form class="contact-form" @submit.prevent="onSubmit">
        <p v-if="success" class="form-success">
          {{ t('contactSuccess') }}
        </p>
        <template v-else>
          <label>
            <span>{{ t('fieldName') }}</span>
            <input v-model="form.name" type="text" required />
          </label>
          <label>
            <span>{{ t('fieldEmail') }}</span>
            <input v-model="form.email" type="email" required />
          </label>
          <label>
            <span>{{ t('fieldSubject') }}</span>
            <input v-model="form.subject" type="text" />
          </label>
          <label>
            <span>{{ t('fieldMessage') }}</span>
            <textarea v-model="form.message" rows="6" required></textarea>
          </label>

          <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

          <button type="submit" :disabled="submitting">
            {{ submitting ? t('sending') : t('sendMessage') }}
          </button>
        </template>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.contact-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
.contact-header {
  margin-bottom: 2rem;
  h1 {
    font-family: var(--font-serif, serif);
    font-size: clamp(2rem, 5vw, 3rem);
    margin: 0 0 0.5rem;
  }
}
.contact-intro {
  font-size: 1.15rem;
  color: var(--color-muted, #666);
}
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2.5rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}
.contact-details {
  p {
    margin: 0 0 1.25rem;
    display: flex;
    flex-direction: column;
  }
  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #888);
    margin-bottom: 0.25rem;
  }
  a {
    color: var(--color-accent, #c00);
    text-decoration: none;
  }
}
.contact-address {
  white-space: pre-line;
}
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
  }
  input,
  textarea {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 8px;
    background: var(--color-bg, #fff);
    color: inherit;
    font: inherit;
  }
  button {
    align-self: flex-start;
    padding: 0.7rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: var(--color-accent, #c00);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}
.form-success {
  font-size: 1.1rem;
  color: var(--color-accent, #c00);
}
.form-error {
  color: #c00;
  font-size: 0.9rem;
}
</style>
