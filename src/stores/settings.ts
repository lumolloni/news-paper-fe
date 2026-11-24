import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getSiteSettings } from '@/api/strapi'
import type { SiteSettings, Locale } from '@/types'
import { useThemeStore } from './theme'
import { setLocaleMessages } from '@/i18n'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SiteSettings | null>(null)
  const theme = useThemeStore()

  /**
   * Push the CMS-managed translation catalogue into vue-i18n. The JSON lives in
   * Site Settings (one object, every locale) so editors can adjust UI copy
   * without a deploy. Components consume it via `$t` / `useI18n().t`.
   */
  function loadTranslations() {
    const dict = settings.value?.translations
    if (!dict) return
    for (const [loc, messages] of Object.entries(dict)) {
      setLocaleMessages(loc, messages)
    }
  }

  // Apply the admin-configured brand colors as CSS variables. The accent is a
  // brand colour and applies in both themes; a custom background only makes
  // sense in light mode (dark mode keeps its own palette).
  function apply() {
    const root = document.documentElement
    const s = settings.value
    if (s?.accentColor) root.style.setProperty('--accent', s.accentColor)
    else root.style.removeProperty('--accent')
    if (s?.backgroundColor && theme.theme === 'light') {
      root.style.setProperty('--bg', s.backgroundColor)
    } else {
      root.style.removeProperty('--bg')
    }
  }

  async function load(locale: Locale) {
    try {
      settings.value = await getSiteSettings(locale)
    } catch {
      settings.value = null
    }
    loadTranslations()
    apply()
  }

  watch(() => theme.theme, apply)

  return { settings, load, apply }
})
