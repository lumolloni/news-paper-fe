<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getCategories, imageUrl } from '@/api/strapi'
import { useLocaleStore } from '@/stores/locale'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import type { Category } from '@/types'
import { trackEvent, trackNavClick } from '@/analytics'
import SearchBar from './SearchBar.vue'
import ThemeToggle from './ThemeToggle.vue'
import LangSwitcher from './LangSwitcher.vue'

const route = useRoute()
const router = useRouter()
const localeStore = useLocaleStore()
const settings = useSettingsStore()
const auth = useAuthStore()

function logout() {
  trackEvent('logout')
  auth.logout()
  router.push('/')
}
const categories = ref<Category[]>([])
const menuOpen = ref(false)

const activeCategory = computed(() => categories.value.find((c) => c.slug === route.params.catSlug))
const subcategories = computed(() => activeCategory.value?.subcategories ?? [])

const siteName = computed(() => settings.settings?.siteName || 'Meridian')
const logo = computed(() => imageUrl(settings.settings?.logo, settings.settings?.logoUrl))

const today = computed(() =>
  new Date().toLocaleDateString(localeStore.locale === 'sq' ? 'sq-AL' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

watch(
  () => localeStore.locale,
  async (locale) => {
    try {
      categories.value = await getCategories(locale)
    } catch {
      categories.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <header class="header">
    <div class="header__top container">
      <span class="header__date">{{ today }}</span>
      <div class="header__tools">
        <template v-if="auth.isAuthenticated">
          <span class="header__user">{{ auth.user?.username }}</span>
          <button class="header__auth" type="button" @click="logout">{{ $t('logout') }}</button>
        </template>
        <RouterLink v-else class="header__auth" :to="{ name: 'login' }">{{
          $t('login')
        }}</RouterLink>
        <LangSwitcher />
        <ThemeToggle />
      </div>
    </div>

    <div class="header__brand container">
      <button class="header__burger" :aria-label="$t('toggleMenu')" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
      <RouterLink to="/" class="logo" @click="trackNavClick('header_logo', siteName, '/')">
        <img v-if="logo" :src="logo" :alt="siteName" class="logo__img" />
        <template v-else>
          <span class="logo__mark">{{ siteName.charAt(0) }}</span>
          <span class="logo__word">{{ siteName }}</span>
        </template>
      </RouterLink>
      <div class="header__search"><SearchBar /></div>
    </div>

    <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }">
      <div class="container header__nav-inner">
        <div class="navitem">
          <RouterLink
            to="/"
            class="navlink"
            @click="((menuOpen = false), trackNavClick('header_nav', 'home', '/'))"
          >
            {{ $t('home') }}
          </RouterLink>
        </div>
        <div class="navitem">
          <RouterLink
            to="/live"
            class="navlink navlink--live"
            @click="((menuOpen = false), trackNavClick('header_nav', 'live', '/live'))"
          >
            <span class="navlink__livedot"></span>{{ $t('live') }}
          </RouterLink>
        </div>
        <div v-for="c in categories" :key="c.id" class="navitem">
          <RouterLink
            :to="{ name: 'category', params: { catSlug: c.slug } }"
            class="navlink"
            @click="((menuOpen = false), trackNavClick('header_nav', c.name, c.slug))"
            >{{ c.name }}</RouterLink
          >
        </div>
      </div>
    </nav>

    <nav v-if="subcategories.length" class="header__subnav">
      <div class="container header__subnav-inner">
        <RouterLink
          v-for="s in subcategories"
          :key="s.id"
          :to="{ name: 'category-child', params: { catSlug: activeCategory!.slug, slug: s.slug } }"
          class="subnavlink"
          @click="trackNavClick('header_subnav', s.name, `${activeCategory!.slug}/${s.slug}`)"
          >{{ s.name }}</RouterLink
        >
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss" src="@/styles/components/AppHeader.scss"></style>
