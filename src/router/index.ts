import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { trackPageview } from '@/analytics'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'default' | 'blank'
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/author/:slug', name: 'author', component: () => import('@/views/AuthorView.vue') },
  { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
  {
    path: '/article/:slug',
    name: 'article-legacy',
    component: () => import('@/views/ArticleView.vue'),
  },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
  {
    path: '/live',
    name: 'live',
    component: () => import('@/views/LiveView.vue'),
    meta: { requiresAuth: true },
  },
  // NOTE: keep static routes above — the greedy /:catSlug below catches any top-level path.
  { path: '/:catSlug', name: 'category', component: () => import('@/views/CategoryView.vue') },
  {
    path: '/:catSlug/:slug',
    name: 'category-child',
    component: () => import('@/views/CategoryChildView.vue'),
  },
  {
    path: '/:catSlug/:subSlug/:slug',
    name: 'article',
    component: () => import('@/views/ArticleView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { layout: 'blank' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true
  const auth = useAuthStore()
  if (auth.isAuthenticated) return true
  return { name: 'login', query: { redirect: to.fullPath } }
})

router.afterEach((to) => {
  setTimeout(() => trackPageview(to.fullPath), 350)
})

export default router
