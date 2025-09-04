export interface UserRepository {
  findByEmail(email: string): Promise<{
    id: string
    email: string
    name: string | null
    password: string | null
    roles: string[]
    communityId: string | null
  } | null>

  findById(id: string): Promise<{
    id: string
    email: string
    name: string | null
    roles: string[]
    communityId: string | null
    emailVerified: Date | null
    image: string | null
  } | null>

  findAll(): Promise<
    {
      id: string
      email: string
      name: string | null
      roles: string[]
      communityId: string | null
      emailVerified: Date | null
      image: string | null
      createdAt?: Date
      updatedAt?: Date
    }[]
  >

  findByCommunity(communityId: string): Promise<
    {
      id: string
      email: string
      name: string | null
      roles: string[]
      communityId: string | null
      emailVerified: Date | null
      image: string | null
      createdAt?: Date
      updatedAt?: Date
    }[]
  >

  save(user: {
    id?: string
    email: string
    name?: string | null
    password?: string | null
    roles: string[]
    communityId?: string | null
    emailVerified?: Date | null
    image?: string | null
  }): Promise<{
    id: string
    email: string
    name: string | null
    roles: string[]
    communityId: string | null
    emailVerified: Date | null
    image: string | null
  }>

  delete(id: string): Promise<void>
}
