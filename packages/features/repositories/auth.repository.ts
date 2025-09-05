export interface AuthRepository {
  login(data: { email: string; password: string }): Promise<{
    token: string
    user: {
      id: string
      email: string
      name: string | null
      roles: string[]
      communityId: string | null
    }
  }>
}
