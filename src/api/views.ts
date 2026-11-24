import { http } from './client'
import type { StrapiSingleResponse } from '@/types'

/** Increment an article's view counter (custom backend route, no auth). */
export async function incrementViews(documentId: string): Promise<void> {
  try {
    await http.put<StrapiSingleResponse<{ views: number }>>(`/api/articles/${documentId}/views`)
  } catch {
    /* non-critical */
  }
}
