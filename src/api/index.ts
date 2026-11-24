// Barrel for the Strapi API layer.
export { http, BASE, ARTICLE_POPULATE, imageUrl, imageSrcset } from './client'
export {
  getArticles,
  getArticleBySlug,
  searchArticles,
  getTrending,
  getArticlesByAuthor,
} from './articles'
export { incrementViews } from './views'
export { getCategories, getCategoryBySlug } from './categories'
export { getSubcategoryBySlug } from './subcategories'
export { getAuthorBySlug } from './authors'
export { getSiteSettings } from './siteSettings'
export { subscribeEmail } from './subscriptions'
export { getAboutPage, getContactPage, submitContactMessage } from './pages'
export { login, register, getMe } from './auth'
export { getLiveStreams, getLiveStreamBySlug } from './liveStreams'
export { getReactionSummary, react } from './reactions'
export { getPollForArticle, votePoll } from './polls'

// Convenience type re-exports (preserves the original strapi.ts surface).
export type { Article, Author, Category, Subcategory, SiteSettings, Tag } from '@/types'
