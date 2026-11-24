import { http } from './client'

/**
 * Register an email for the newsletter. Resolves on success (including the
 * "already subscribed" case) and throws on validation/network errors.
 */
export async function subscribeEmail(email: string): Promise<void> {
  await http.post('/api/subscription-emails/subscribe', { email })
}
