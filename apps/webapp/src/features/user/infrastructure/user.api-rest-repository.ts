import type { HttpClient } from 'core'

export interface UserDto {
  id: string
  email: string
  name: string | null
  roles: string[]
  communityId: string | null
  emailVerified: Date | null
  image: string | null
}

export interface GetUsersResponseDto {
  users: UserDto[]
  statistics: {
    total: number
    active: number
    administrators: number
    operators: number
  }
}

export interface CreateUserDto {
  email: string
  name?: string | null
  password: string
  roles: string[]
  communityId?: string | null
}

export interface UserRepository {
  getUsers(): Promise<GetUsersResponseDto>
  createUser(userData: CreateUserDto): Promise<UserDto>
  deleteUser(id: string): Promise<void>
}

export class UserApiRestRepository implements UserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getUsers(): Promise<GetUsersResponseDto> {
    const response = await this.httpClient.get<GetUsersResponseDto>('/users')
    if (!response.data) throw new Error('Empty users response')
    return response.data
  }

  async createUser(userData: CreateUserDto): Promise<UserDto> {
    const response = await this.httpClient.post<UserDto, CreateUserDto>('/users', userData)
    if (!response.data) throw new Error('Empty create user response')
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.httpClient.delete(`/users/${id}`)
    if (!response.data) throw new Error('Delete user failed')
  }
}
