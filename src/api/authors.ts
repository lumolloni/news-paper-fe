import { http } from './client'
import type { Author, Locale, StrapiListResponse } from '@/types'

export async function getAuthorBySlug(slug: string, locale: Locale = 'en'): Promise<Author | null> {
  const { data } = await http.get<StrapiListResponse<Author>>('/api/authors', {
    params: {
      locale,
      populate: { avatar: true },
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    },
  })
  return data.data[0] ?? null
}
