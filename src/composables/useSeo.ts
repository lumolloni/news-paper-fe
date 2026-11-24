import { onScopeDispose, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export interface SeoInput {
  /** Page title (site name is appended automatically unless `rawTitle`). */
  title?: string
  rawTitle?: boolean
  description?: string
  /** Absolute or site-relative image URL for social cards. */
  image?: string | null
  /** og:type — 'website' (default) or 'article'. */
  type?: 'website' | 'article'
  /** Canonical path or absolute URL. Defaults to the current location. */
  canonical?: string
  /** Tell crawlers not to index this route (search, account, live, 404). */
  noindex?: boolean
  /** JSON-LD structured data object(s) for this route. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  // Article-specific Open Graph metadata.
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
}

const MANAGED = 'data-seo'

/** Configurable absolute origin used for canonical URLs and og:url. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '')

function absoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) {
    return SITE_URL ? `${SITE_URL}${window.location.pathname}` : window.location.href
  }
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL || window.location.origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute(MANAGED, '')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function clearManaged() {
  // Remove only the tags this composable added on the previous run, so route
  // changes never leak stale OG/JSON-LD into the next page.
  document.head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove())
}

/**
 * Reactive document head / SEO manager. Sets title, meta description, canonical,
 * Open Graph + Twitter card tags, robots, and JSON-LD for the calling route —
 * with CMS site settings (name, tagline, logo) as fallbacks. Re-runs when its
 * input changes and cleans up its tags when the owning component unmounts.
 */
export function useSeo(input: MaybeRefOrGetter<SeoInput>) {
  const settings = useSettingsStore()

  watchEffect(() => {
    const seo = toValue(input)
    const s = settings.settings
    const siteName = s?.siteName || 'Meridian'
    const description = seo.description || s?.tagline || ''
    const image = absoluteUrl(seo.image || s?.logoUrl || undefined)
    const url = absoluteUrl(seo.canonical)
    const fullTitle =
      !seo.title || seo.rawTitle ? seo.title || siteName : `${seo.title} — ${siteName}`

    // Rebuild managed tags from scratch each run.
    clearManaged()

    document.title = fullTitle

    // Canonical link.
    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', url)
    canonical.setAttribute(MANAGED, '')
    document.head.appendChild(canonical)

    if (description) upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', seo.noindex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph.
    upsertMeta('property', 'og:site_name', siteName)
    upsertMeta('property', 'og:title', fullTitle)
    if (description) upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', seo.type || 'website')
    upsertMeta('property', 'og:url', url)
    if (image) upsertMeta('property', 'og:image', image)

    if (seo.type === 'article') {
      if (seo.publishedTime) upsertMeta('property', 'article:published_time', seo.publishedTime)
      if (seo.modifiedTime) upsertMeta('property', 'article:modified_time', seo.modifiedTime)
      if (seo.author) upsertMeta('property', 'article:author', seo.author)
      if (seo.section) upsertMeta('property', 'article:section', seo.section)
    }

    // Twitter card.
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', fullTitle)
    if (description) upsertMeta('name', 'twitter:description', description)
    if (image) upsertMeta('name', 'twitter:image', image)

    // JSON-LD structured data.
    if (seo.jsonLd) {
      const blocks = Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]
      for (const block of blocks) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute(MANAGED, '')
        script.textContent = JSON.stringify(block)
        document.head.appendChild(script)
      }
    }
  })

  onScopeDispose(clearManaged)
}
