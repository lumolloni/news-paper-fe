import type { RouteLocationRaw } from 'vue-router'
import type { Article } from '@/types'

export function articleRoute(
  article: Pick<Article, 'slug' | 'category' | 'subcategory'>,
): RouteLocationRaw {
  const catSlug = article.category?.slug
  const subSlug = article.subcategory?.slug

  if (catSlug && subSlug) {
    return { name: 'article', params: { catSlug, subSlug, slug: article.slug } }
  }
  if (catSlug) {
    return { name: 'category-child', params: { catSlug, slug: article.slug } }
  }
  return { name: 'article-legacy', params: { slug: article.slug } }
}
