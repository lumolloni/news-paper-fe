import { createI18n } from 'vue-i18n'
import type { Locale } from '@/types'

/**
 * vue-i18n instance. Message catalogues are NOT bundled — they are loaded at
 * runtime from the CMS (Site Settings → translations) by the settings store.
 *
 * `messageCompiler` returns every entry as a literal string. CMS copy is free
 * text and may contain characters vue-i18n would otherwise treat as syntax
 * (`@` linked messages, `|` plural separators, `{}` interpolation). We don't use
 * those features (values are interpolated in templates), so compiling literally
 * keeps arbitrary editor copy safe and removes the need for the runtime compiler.
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: {},
  messageCompiler: (message) =>
    typeof message === 'string' ? () => message : (message as () => string),
})

/** Replace a locale's catalogue with the CMS-managed dictionary. */
export function setLocaleMessages(locale: string, dict: Record<string, string>) {
  i18n.global.setLocaleMessage(locale, dict)
}

/** Keep the active vue-i18n locale in sync with the app locale store. */
export function setI18nLocale(locale: Locale) {
  i18n.global.locale.value = locale
}
