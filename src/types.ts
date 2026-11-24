export interface StrapiMediaFormat {
  url: string
  width: number
  height: number
}

export interface StrapiMedia {
  id: number
  url: string
  width?: number
  height?: number
  alternativeText?: string | null
  formats?: Record<string, StrapiMediaFormat> | null
}

export type Locale = 'en' | 'sq'

export interface Subcategory {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  category?: Category | null
}

export interface Category {
  id: number
  documentId: string
  name: string
  slug: string
  description?: string
  color?: string
  subcategories?: Subcategory[]
}

export interface Author {
  id: number
  documentId: string
  name: string
  slug: string
  role?: string
  bio?: string
  avatar?: StrapiMedia | null
  avatarUrl?: string | null
}

export interface Tag {
  id: number
  documentId: string
  name: string
  slug: string
}

export interface Article {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover?: StrapiMedia | null
  coverUrl?: string | null
  video?: StrapiMedia | null
  videoUrl?: string | null
  featured: boolean
  breaking: boolean
  readingTime: number
  views: number
  publishedAt: string
  category?: Category | null
  subcategory?: Subcategory | null
  author?: Author | null
  tags?: Tag[]
}

export interface SiteLink {
  id?: number
  label: string
  url: string
}

export interface SocialLink {
  id?: number
  platform: 'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok'
  url: string
}

export interface SiteSettings {
  siteName?: string
  tagline?: string
  logo?: StrapiMedia | null
  logoUrl?: string | null
  backgroundColor?: string | null
  accentColor?: string | null
  footerText?: string | null
  footerLinks?: SiteLink[]
  socialLinks?: SocialLink[]
  translations?: Record<string, Record<string, string>>
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
  meta: Record<string, unknown>
}

export interface AboutPage {
  title?: string
  subtitle?: string
  body?: string
  mission?: string
  heroImage?: StrapiMedia | null
  heroImageUrl?: string | null
}

export interface ContactPage {
  title?: string
  intro?: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface ContactForm {
  name: string
  email: string
  subject?: string
  message: string
}

export interface User {
  id: number
  documentId?: string
  username: string
  email: string
  confirmed?: boolean
  blocked?: boolean
}

export interface AuthResponse {
  jwt: string
  user: User
}

export type ReactionType = 'like' | 'love' | 'insightful' | 'sad' | 'angry'

export interface ReactionSummary {
  counts: Record<ReactionType, number>
  total: number
  userReaction: ReactionType | null
}

export interface PollOption {
  index: number
  label: string
  votes: number
}

export interface Poll {
  documentId: string
  question: string
  options: PollOption[]
  total: number
  /** Index the current user voted for, or null if they haven't voted. */
  userVote: number | null
}

export type StreamProvider = 'hls' | 'dash' | 'youtube' | 'vimeo' | 'file'

export interface LiveStream {
  id: number
  documentId: string
  title: string
  slug: string
  description?: string | null
  streamUrl: string
  provider?: StreamProvider
  poster?: StrapiMedia | null
  posterUrl?: string | null
  isLive: boolean
  startsAt?: string | null
}
