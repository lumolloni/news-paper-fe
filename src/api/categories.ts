import { http } from './client'
import type { Category, Locale, StrapiListResponse } from '@/types'

export async function getCategories(locale: Locale = 'en'): Promise<Category[]> {
  const { data } = await http.get<StrapiListResponse<Category>>('/api/categories', {
    params: {
      locale,
      populate: { subcategories: true },
      sort: 'name:asc',
      pagination: { pageSize: 50 },
    },
  })
  return data.data
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale = 'en',
): Promise<Category | null> {
  const { data } = await http.get<StrapiListResponse<Category>>('/api/categories', {
    params: {
      locale,
      populate: { subcategories: true },
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    },
  })
  return data.data[0] ?? null
}
