import type { HttpClient, Id } from 'core'
import {Analysis, IssueDto, IssueRepositoryFilters, IssueSchema} from 'features'
import { Issue } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { IssueCreateRepository } from '@/src/features/issue/domain/issue-create.repository'

export class IssueApiRestRepository implements IssueCreateRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(filters?: IssueRepositoryFilters): Promise<Issue[]> {
    let endpoint = 'issues'

    if (filters?.status) {
      const searchParams = new URLSearchParams()
      searchParams.append('status', filters.status.toString())
      endpoint = `${endpoint}?${searchParams.toString()}`
    }

    const issueSchemas = await this.httpClient.get<IssueSchema[]>(endpoint)
    if (!issueDtos.data) return []
    return issueSchemas.data.map(Issue.fromDto)
  }

  async findById(id: Id): Promise<Issue | undefined> {
    try {
      const json = await this.httpClient.get<IssueSchema>(`issues/${id.toString()}`)
      return Issue.fromDto(json.data!)
    } catch (error) {
      return undefined
    }
  }

  async save(issue: Issue): Promise<void> {
    await this.httpClient.put<void, IssueSchema>(`issues/${issue.id.toString()}`, issue.toDto())
    return
  }

  async create(issue: CreateIssueSchema): Promise<void> {
    await this.httpClient.post<void, CreateIssueSchema>('issues', issue)
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`issues/${id.toString()}`)
  }
}
