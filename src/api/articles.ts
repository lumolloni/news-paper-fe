import { http, ARTICLE_POPULATE } from './client'
import type { Article, Locale, StrapiListResponse } from '@/types'

export async function getArticles(
  params: {
    page?: number
    pageSize?: number
    category?: string
    subcategory?: string
    sort?: string
    featured?: boolean
    breaking?: boolean
    excludeSlug?: string
    locale?: Locale
  } = {},
): Promise<StrapiListResponse<Article>> {
  const filters: Record<string, unknown> = {}
  if (params.category) filters.category = { slug: { $eq: params.category } }
  if (params.subcategory) filters.subcategory = { slug: { $eq: params.subcategory } }
  if (params.featured) filters.featured = { $eq: true }
  if (params.breaking) filters.breaking = { $eq: true }
  if (params.excludeSlug) filters.slug = { $ne: params.excludeSlug }

  const { data } = await http.get<StrapiListResponse<Article>>('/api/articles', {
    params: {
      ...ARTICLE_POPULATE,
      locale: params.locale ?? 'en',
      filters,
      sort: params.sort ?? 'publishedAt:desc',
      pagination: { page: params.page ?? 1, pageSize: params.pageSize ?? 9 },
    },
  })
  return data
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale = 'en',
): Promise<Article | null> {
  const { data } = await http.get<StrapiListResponse<Article>>('/api/articles', {
    params: {
      ...ARTICLE_POPULATE,
      locale,
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    },
  })
  return data.data[0] ?? null
}

/**
 * Search via the dedicated backend endpoint, which matches title, tag name and
 * category name only (no richtext `content` scan) so it stays viable at scale.
 */
export async function searchArticles(
  query: string,
  page = 1,
  pageSize = 12,
  locale: Locale = 'en',
): Promise<StrapiListResponse<Article>> {
  const { data } = await http.get<StrapiListResponse<Article>>('/api/search', {
    params: { q: query, page, pageSize, locale },
  })
  return data
}

export async function getTrending(limit = 5, locale: Locale = 'en'): Promise<Article[]> {
  const { data } = await http.get<StrapiListResponse<Article>>('/api/articles', {
    params: {
      ...ARTICLE_POPULATE,
      locale,
      sort: 'views:desc',
      pagination: { pageSize: limit },
    },
  })
  return data.data
}

export async function getArticlesByAuthor(
  authorSlug: string,
  page = 1,
  pageSize = 9,
  locale: Locale = 'en',
): Promise<StrapiListResponse<Article>> {
  const { data } = await http.get<StrapiListResponse<Article>>('/api/articles', {
    params: {
      ...ARTICLE_POPULATE,
      locale,
      filters: { author: { slug: { $eq: authorSlug } } },
      sort: 'publishedAt:desc',
      pagination: { page, pageSize },
    },
  })
  return data
}
