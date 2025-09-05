import type { HttpClient, Id } from 'core'
import type { IssueDto, IssueRepositoryFilters } from 'features'
import { Issue } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { IssueCreateRepository } from '@/src/features/issue/domain/issue-create.repository'

export class IssueApiRestRepository implements IssueCreateRepository {
  constructor(private readonly httpClient: HttpClient) {}

  findAllOrderedByEndAt(): Promise<Issue[]> {
    throw new Error('Method not implemented.')
  }

  async findAll(filters?: IssueRepositoryFilters): Promise<Issue[]> {
    const issueDtos = await this.httpClient.get<IssueDto[]>('issues')
    return issueDtos.data!.map(Issue.create)
  }

  async findById(id: Id): Promise<Issue | undefined> {
    try {
      const json = await this.httpClient.get<IssueDto>(`issues/${id.toString()}`)
      return Issue.fromDto(json.data!)
    } catch (error) {
      console.log({ error })
      return
    }
  }

  async save(issue: Issue): Promise<void> {
    await this.httpClient.post<void, IssueDto>(`issues/${issue.id.toString()}`, issue.toDto())
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
