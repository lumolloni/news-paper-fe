import { http } from './client'
import type { LiveStream, StrapiListResponse } from '@/types'

const LIVE_POPULATE = { populate: { poster: true } }

/**
 * Fetch live streams. Requires a logged-in user — the backend grants the
 * `find`/`findOne` actions to the authenticated role only, so an anonymous
 * request returns 403.
 */
export async function getLiveStreams(): Promise<LiveStream[]> {
  const { data } = await http.get<StrapiListResponse<LiveStream>>('/api/live-streams', {
    params: {
      ...LIVE_POPULATE,
      sort: ['isLive:desc', 'startsAt:asc'],
    },
  })
  return data.data
}

export async function getLiveStreamBySlug(slug: string): Promise<LiveStream | null> {
  const { data } = await http.get<StrapiListResponse<LiveStream>>('/api/live-streams', {
    params: {
      ...LIVE_POPULATE,
      filters: { slug: { $eq: slug } },
      pagination: { pageSize: 1 },
    },
  })
  return data.data[0] ?? null
}
