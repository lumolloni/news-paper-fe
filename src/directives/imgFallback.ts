import type { Directive } from 'vue'

/** Public asset shown when an image is missing or fails to load. */
export const IMG_PLACEHOLDER = '/placeholder.svg'

// Tracks elements we've already swapped so a failing placeholder can't loop.
const swapped = new WeakSet<HTMLImageElement>()

function applyPlaceholder(el: HTMLImageElement) {
  if (swapped.has(el)) return
  swapped.add(el)
  el.src = IMG_PLACEHOLDER
  el.classList.add('img--fallback')
}

function onError(this: HTMLImageElement) {
  applyPlaceholder(this)
}

/**
 * `v-img-fallback` — drop a placeholder in whenever an <img> has no usable source
 * or fails to load (broken URL, 404, network error, etc.). Works for both cases:
 * an empty/whitespace `src` is treated as a failure up front.
 */
export const vImgFallback: Directive<HTMLImageElement> = {
  mounted(el) {
    el.addEventListener('error', onError)
    const src = el.getAttribute('src')
    if (!src || !src.trim()) applyPlaceholder(el)
  },
  updated(el) {
    const src = el.getAttribute('src')
    // A real source was (re)assigned after a previous failure — let it retry.
    if (src && src.trim() && src !== IMG_PLACEHOLDER) swapped.delete(el)
    if (!src || !src.trim()) applyPlaceholder(el)
  },
  unmounted(el) {
    el.removeEventListener('error', onError)
  },
}
