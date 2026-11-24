<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { subscribeEmail } from '@/api/strapi'
import { trackEvent, trackNavClick } from '@/analytics'

const { t } = useI18n({ useScope: 'global' })
const settings = useSettingsStore()
const email = ref('')
const done = ref(false)
const failed = ref(false)
const errorMsg = ref('')
const submitting = ref(false)
const year = new Date().getFullYear()

const s = computed(() => settings.settings)
const siteName = computed(() => s.value?.siteName || 'Meridian')

const socialLabels: Record<string, string> = {
  x: 'X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
}

async function subscribe() {
  if (submitting.value) return
  failed.value = false
  done.value = false

  // Validate the format client-side before hitting the API.
  // zod is loaded on demand so it stays out of the initial bundle.
  const { z } = await import('zod')
  const parsed = z.string().trim().email().safeParse(email.value)
  if (!parsed.success) {
    failed.value = true
    errorMsg.value = t('emailInvalid')
    return
  }

  submitting.value = true
  try {
    await subscribeEmail(parsed.data)
    trackEvent('newsletter_subscribe', { location: 'footer' })
    done.value = true
    email.value = ''
  } catch {
    failed.value = true
    errorMsg.value = t('subscribeError')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <span class="footer__logo">{{ siteName }}</span>
        <p class="muted">{{ s?.footerText || t('footerDefault') }}</p>

        <nav v-if="s?.footerLinks?.length" class="footer__links">
          <a
            v-for="(l, i) in s.footerLinks"
            :key="l.id ?? i"
            :href="l.url"
            class="footer__link"
            @click="trackNavClick('footer', l.label, l.url)"
            >{{ l.label }}</a
          >
        </nav>

        <div v-if="s?.socialLinks?.length" class="footer__social">
          <a
            v-for="(soc, i) in s.socialLinks"
            :key="soc.id ?? i"
            :href="soc.url"
            class="footer__soc"
            target="_blank"
            rel="noopener"
            @click="trackEvent('social_click', { platform: soc.platform, link_url: soc.url })"
            >{{ socialLabels[soc.platform] ?? soc.platform }}</a
          >
        </div>
      </div>

      <div class="footer__news">
        <h2 class="footer__news-title">{{ t('newsletterTitle') }}</h2>
        <p class="muted">{{ t('newsletterText') }}</p>
        <form class="footer__form" novalidate @submit.prevent="subscribe">
          <input
            v-model="email"
            type="email"
            :placeholder="t('emailPlaceholder')"
            :aria-label="t('emailAddress')"
            required
          />
          <button class="btn btn--accent" type="submit" :disabled="submitting">
            {{ t('subscribe') }}
          </button>
        </form>
        <p v-if="done" class="footer__ok">{{ t('subscribeOk') }}</p>
        <p v-else-if="failed" class="footer__err">{{ errorMsg }}</p>
      </div>
    </div>
    <div class="container footer__bottom">
      <span>© {{ year }} {{ siteName }}</span>
      <span class="muted">{{ t('rights') }}</span>
    </div>
  </footer>
</template>

<style scoped lang="scss" src="@/styles/components/AppFooter.scss"></style>
