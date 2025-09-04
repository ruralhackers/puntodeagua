import type { HttpClient, Id } from 'core'
import { Issue } from 'features'
import type { IssueDto } from 'features/entities/issue.dto'
import type { IssueRepository } from 'features/repositories/issue.repository'
import type { CreateIssueSchema } from 'features/schemas/create-issue.schema'

export class IssueApiRestRepository implements IssueRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Issue[]> {
    const issueDtos = await this.httpClient.get<IssueDto[]>('issues')
    return issueDtos.data!.map(Issue.create)
  }

  async findById(id: Id): Promise<Issue | undefined> {
    try {
      const json = await this.httpClient.get<IssueDto>(`issues/${id.toString()}`)
      return Issue.fromDto(json.data!)
    } catch (error) {
      return
    }
  }

  async save(issue: Issue): Promise<void> {
    await this.httpClient.post<void, IssueDto>('issues', issue.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`issues/${id.toString()}`)
  }
}
