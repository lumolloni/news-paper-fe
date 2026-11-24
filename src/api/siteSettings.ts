import { http } from './client'
import type { SiteSettings, Locale, StrapiSingleResponse } from '@/types'

export async function getSiteSettings(locale: Locale = 'en'): Promise<SiteSettings | null> {
  const { data } = await http.get<StrapiSingleResponse<SiteSettings>>('/api/site-setting', {
    params: {
      locale,
      populate: { logo: true, footerLinks: true, socialLinks: true },
    },
  })
  return data.data ?? null
}
