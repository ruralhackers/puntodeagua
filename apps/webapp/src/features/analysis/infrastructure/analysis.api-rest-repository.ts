import type { HttpClient, Id } from 'core'
import { Analysis, type AnalysisDto, type AnalysisRepository } from 'features'

export class AnalysisApiRestRepository implements AnalysisRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Analysis[]> {
    const analysisDtos = await this.httpClient.get<AnalysisDto[]>('analyses')
    return analysisDtos.data!.map(Analysis.create)
  }

  async findById(id: Id): Promise<Analysis | undefined> {
    try {
      const json = await this.httpClient.get<any>(`analyses/${id.toString()}`)
      return Analysis.create(json.data!)
    } catch (error) {
      return undefined
    }
  }

  async save(Analysis: Analysis): Promise<void> {
    await this.httpClient.post<void, AnalysisDto>('analyses', Analysis.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`analyses/${id.toString()}`)
  }
}
