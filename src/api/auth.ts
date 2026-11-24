import { http } from './client'
import type { AuthResponse, User } from '@/types'

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/local', { identifier, password })
  return data
}

/** Self-service registration. Strapi requires username, email and password. */
export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/local/register', {
    username,
    email,
    password,
  })
  return data
}

/** Fetch the current user for the stored JWT (used to restore a session). */
export async function getMe(): Promise<User> {
  const { data } = await http.get<User>('/api/users/me')
  return data
}
