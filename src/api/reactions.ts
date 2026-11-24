import { http } from './client'
import type { ReactionSummary, ReactionType } from '@/types'

/** Public reaction counts for an article (+ the user's own choice if logged in). */
export async function getReactionSummary(articleDocumentId: string): Promise<ReactionSummary> {
  const { data } = await http.get<{ data: ReactionSummary }>('/api/reactions/summary', {
    params: { article: articleDocumentId },
  })
  return data.data
}

/** Toggle the logged-in user's reaction on an article. Returns fresh counts. */
export async function react(
  articleDocumentId: string,
  type: ReactionType,
): Promise<ReactionSummary> {
  const { data } = await http.post<{ data: ReactionSummary }>('/api/reactions/react', {
    article: articleDocumentId,
    type,
  })
  return data.data
}
