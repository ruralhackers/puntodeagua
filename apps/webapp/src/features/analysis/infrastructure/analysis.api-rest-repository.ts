import type { HttpClient, Id } from 'core'
import { Analysis, type AnalysisDto, type AnalysisRepository } from 'features'
import type { AnalysisSchema } from 'features/registers/schemas/analysis.schema'

export interface AnalysisCreateRepository extends AnalysisRepository {
  create(data: Omit<AnalysisSchema, 'id'>): Promise<void>
}

export class AnalysisApiRestRepository implements AnalysisCreateRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Analysis[]> {
    const dtos = await this.httpClient.get<AnalysisDto[]>('analyses')
    if (!dtos.data) return []
    return dtos.data.map(Analysis.fromDto)
  }

  async findById(id: Id): Promise<Analysis | undefined> {
    try {
      const json = await this.httpClient.get<AnalysisDto>(`analyses/${id.toString()}`)
      if (!json.data) return undefined

      return Analysis.fromDto(json.data!)
    } catch (error) {
      return undefined
    }
  }

  async save(analysis: Analysis): Promise<void> {
    await this.httpClient.post<void, AnalysisDto>(
      `analyses/${analysis.id.toString()}`,
      analysis.toDto()
    )
    return
  }

  async create(analysis: Omit<AnalysisSchema, 'id'>): Promise<void> {
    await this.httpClient.post<void, Omit<AnalysisSchema, 'id'>>('analyses', analysis)
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`analyses/${id.toString()}`)
  }
}
