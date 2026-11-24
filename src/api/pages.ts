import { http } from './client'
import type { AboutPage, ContactPage, ContactForm, Locale, StrapiSingleResponse } from '@/types'

export async function getAboutPage(locale: Locale = 'en'): Promise<AboutPage | null> {
  const { data } = await http.get<StrapiSingleResponse<AboutPage>>('/api/about-page', {
    params: { locale, populate: { heroImage: true } },
  })
  return data.data ?? null
}

export async function getContactPage(locale: Locale = 'en'): Promise<ContactPage | null> {
  const { data } = await http.get<StrapiSingleResponse<ContactPage>>('/api/contact-page', {
    params: { locale },
  })
  return data.data ?? null
}

/** Submit the public contact form. Throws on validation/network errors. */
export async function submitContactMessage(form: ContactForm): Promise<void> {
  await http.post('/api/contact-messages/submit', form)
}
