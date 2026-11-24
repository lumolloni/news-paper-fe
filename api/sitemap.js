/* global process, fetch, Response */
/**
 * Vercel serverless function behind /sitemap.xml (see vercel.json).
 * Strapi generates the sitemap at <VITE_STRAPI_URL>/api/sitemap.xml; this proxies
 * it so search engines find it on the site's own domain.
 */
export async function GET() {
  const base = (process.env.VITE_STRAPI_URL || '').replace(/\/$/, '')
  if (!base) return new Response('VITE_STRAPI_URL is not set', { status: 500 })

  const res = await fetch(`${base}/api/sitemap.xml`)
  return new Response(await res.text(), {
    status: res.status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
