import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Locale } from '@/types'
import { setI18nLocale } from '@/i18n'

const STORAGE_KEY = 'meridian-locale'

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'sq', label: 'SQ' },
]

function initialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'sq') return saved
  return document.documentElement.lang === 'sq' ? 'sq' : 'en'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(initialLocale())

  function set(value: Locale) {
    locale.value = value
  }

  watch(
    locale,
    (value) => {
      localStorage.setItem(STORAGE_KEY, value)
      document.documentElement.setAttribute('lang', value)
      setI18nLocale(value)
    },
    { immediate: true },
  )

  return { locale, set }
})
