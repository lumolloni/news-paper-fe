import { http } from './client'
import type { Subcategory, Locale, StrapiListResponse } from '@/types'

export async function getSubcategoryBySlug(
  slug: string,
  locale: Locale = 'en',
): Promise<Subcategory | null> {
  const { data } = await http.get<StrapiListResponse<Subcategory>>('/api/subcategories', {
    params: {
      locale,
      populate: { category: true },
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    },
  })
  return data.data[0] ?? null
}
