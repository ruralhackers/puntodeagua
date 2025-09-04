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
  getUsers(token?: string): Promise<GetUsersResponseDto>
  createUser(userData: CreateUserDto, token?: string): Promise<UserDto>
  deleteUser(id: string, token?: string): Promise<void>
}

export class UserApiRestRepository implements UserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getUsers(token?: string): Promise<GetUsersResponseDto> {
    let response: any
    if (token) {
      response = await this.httpClient.get<GetUsersResponseDto>('/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      response = await this.httpClient.get<GetUsersResponseDto>('/users')
    }
    if (!response.data) throw new Error('Empty users response')
    return response.data
  }

  async createUser(userData: CreateUserDto, token?: string): Promise<UserDto> {
    let response: any
    if (token) {
      response = await this.httpClient.post<UserDto, CreateUserDto>('/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      response = await this.httpClient.post<UserDto, CreateUserDto>('/users', userData)
    }
    if (!response.data) throw new Error('Empty create user response')
    return response.data
  }

  async deleteUser(id: string, token?: string): Promise<void> {
    let response: any
    if (token) {
      response = await this.httpClient.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      response = await this.httpClient.delete(`/users/${id}`)
    }
    if (!response.data) throw new Error('Delete user failed')
  }
}
