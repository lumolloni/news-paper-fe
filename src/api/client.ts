import axios from 'axios'

export const BASE = import.meta.env.VITE_STRAPI_URL ?? ''

/** localStorage key holding the logged-in user's Strapi JWT. */
export const AUTH_TOKEN_KEY = 'meridian-jwt'

export const http = axios.create({
  baseURL: BASE,
})

// Attach auth on every request: prefer the logged-in user's JWT (set by the auth
// store), falling back to the optional build-time API token for public reads.
// Reading from localStorage here keeps this module free of a store import cycle.
http.interceptors.request.use((config) => {
  const jwt = localStorage.getItem(AUTH_TOKEN_KEY)
  const token = jwt || import.meta.env.VITE_STRAPI_API_TOKEN
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const ARTICLE_POPULATE = {
  populate: {
    cover: true,
    video: true,
    category: true,
    subcategory: true,
    author: { populate: { avatar: true } },
    tags: true,
  },
}

/**
 * Build a `srcset` from Strapi's generated formats (thumbnail/small/medium/large)
 * plus the original, so phones download a small rendition instead of the full
 * upload. Returns undefined for external URLs (no known renditions).
 */
export function imageSrcset(
  media:
    | {
        url?: string
        width?: number
        formats?: Record<string, { url: string; width: number }> | null
      }
    | null
    | undefined,
): string | undefined {
  if (!media?.url) return undefined
  const abs = (u: string) => (u.startsWith('http') ? u : `${BASE}${u}`)
  const entries = Object.entries(media.formats ?? {})
    .filter(([name]) => name !== 'thumbnail')
    .map(([, f]) => [abs(f.url), f.width] as const)
  if (media.width) entries.push([abs(media.url), media.width])
  if (entries.length < 2) return undefined
  return entries
    .sort((a, b) => a[1] - b[1])
    .map(([u, w]) => `${u} ${w}w`)
    .join(', ')
}

export function imageUrl(
  media: { url?: string } | null | undefined,
  fallback?: string | null,
): string {
  if (media?.url) {
    return media.url.startsWith('http') ? media.url : `${BASE}${media.url}`
  }
  return fallback ?? ''
}
