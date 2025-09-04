import type { HttpClient, Id } from 'core'
import { Analysis, type AnalysisDto, type AnalysisRepository } from 'features'

export class AnalysisApiRestRepository implements AnalysisRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Analysis[]> {
    const dtos = await this.httpClient.get<AnalysisDto[]>('analyses')
    if (!dtos.data) return []
    return dtos.data.map(Analysis.fromDto)
  }

  async findById(id: Id): Promise<Analysis | undefined> {
    try {
      const json = await this.httpClient.get<AnalysisDto>(`analyses/${id.toString()}`)
      console.log({ json })

      if (!json.data) return undefined

      return Analysis.fromDto(json.data!)
    } catch (error) {
      return undefined
    }
  }

  async save(analysis: Analysis): Promise<void> {
    await this.httpClient.post<void, AnalysisDto>('analyses', analysis.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`analyses/${id.toString()}`)
  }
}
