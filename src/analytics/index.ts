/**
 * Google Analytics 4 (gtag.js) integration.
 *
 * No-ops entirely when `VITE_GA_ID` is unset, so dev builds and forks without a
 * measurement ID stay clean. SPA page views are sent manually on each route
 * change (we disable gtag's automatic `page_view`), which is the correct pattern
 * for a client-side-routed app.
 */

const GA_ID = import.meta.env.VITE_GA_ID

type GtagArgs = [string, ...unknown[]]

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: GtagArgs) => void
  }
}

let enabled = false

export function isAnalyticsEnabled(): boolean {
  return enabled
}

/** Inject gtag.js once and configure GA4 with manual page-view control. */
export function initAnalytics(): void {
  if (enabled || !GA_ID || typeof window === 'undefined') return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: GtagArgs) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  // We dispatch page_view ourselves on every route change.
  window.gtag('config', GA_ID, { send_page_view: false })

  enabled = true
}

/** Record a virtual page view for the current SPA route. */
export function trackPageview(path: string, title?: string): void {
  if (!enabled) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  })
}

/** Record a custom GA4 event (search, login, video play, …). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!enabled) return
  window.gtag('event', name, params)
}

// ---------------------------------------------------------------------------
// Typed helpers for the news portal's events. Keeping event names/params here
// means GA4 custom dimensions stay consistent across components.
// ---------------------------------------------------------------------------

/** Minimal article shape so callers can pass full `Article` objects. */
interface ArticleLike {
  documentId: string
  slug: string
  title: string
  category?: { slug: string; name: string } | null
  subcategory?: { slug: string } | null
  author?: { name: string } | null
}

function articleParams(a: ArticleLike): Record<string, unknown> {
  return {
    article_id: a.documentId,
    article_slug: a.slug,
    article_title: a.title,
    article_category: a.category?.slug,
    article_subcategory: a.subcategory?.slug,
    article_author: a.author?.name,
  }
}

/**
 * A click on a news item in any list (home hero, latest feed, most read,
 * breaking ticker, related, category, search, author…). Uses GA4's
 * recommended `select_content` event plus a dedicated `article_click`.
 */
export function trackArticleClick(
  article: ArticleLike,
  source: string,
  extra: Record<string, unknown> = {},
): void {
  const params = { ...articleParams(article), click_source: source, ...extra }
  trackEvent('select_content', { content_type: 'article', item_id: article.documentId, ...params })
  trackEvent('article_click', params)
}

/** An article page finished loading (fires once per article per visit). */
export function trackArticleView(article: ArticleLike & { readingTime?: number }): void {
  trackEvent('article_view', { ...articleParams(article), reading_time: article.readingTime })
}

export function trackReadProgress(article: ArticleLike, percent: number): void {
  trackEvent('article_read_progress', { ...articleParams(article), percent })
}

export function trackShare(method: string, article?: ArticleLike): void {
  trackEvent('share', {
    method,
    content_type: 'article',
    item_id: article?.documentId,
    ...(article ? articleParams(article) : {}),
  })
}

/** Navigation click (header nav, subnav, footer, tags, category kickers…). */
export function trackNavClick(location: string, label: string, target?: string): void {
  trackEvent('nav_click', { nav_location: location, link_text: label, link_target: target })
}
