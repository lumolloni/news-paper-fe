import { http } from './client'
import type { Poll } from '@/types'

/** The active poll attached to an article, or null if there is none. */
export async function getPollForArticle(articleDocumentId: string): Promise<Poll | null> {
  const { data } = await http.get<{ data: Poll | null }>('/api/polls/for-article', {
    params: { article: articleDocumentId },
  })
  return data.data
}

/** Cast the logged-in user's vote. Returns the poll with updated tallies. */
export async function votePoll(pollDocumentId: string, optionIndex: number): Promise<Poll> {
  const { data } = await http.post<{ data: Poll }>(`/api/polls/${pollDocumentId}/vote`, {
    optionIndex,
  })
  return data.data
}
