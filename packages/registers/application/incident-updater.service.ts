import type { Id } from '@pda/common/domain'
import type { Incident } from '../domain/entities/incident'
import type { IncidentUpdateDto } from '../domain/entities/incident.dto'
import { IncidentNotFoundError } from '../domain/errors/incident-errors'
import type { IncidentRepository } from '../domain/repositories/incident.repository'

export class IncidentUpdater {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  async run(params: { id: Id; updatedIncidentData: IncidentUpdateDto }): Promise<Incident> {
    const { id, updatedIncidentData } = params

    const existingIncident = await this.incidentRepository.findById(id)
    if (!existingIncident) {
      throw new IncidentNotFoundError()
    }

    const updatedIncident = existingIncident.update({
      status: updatedIncidentData.status.toString(),
      endAt: updatedIncidentData.endAt,
      description: updatedIncidentData.description
    })

    await this.incidentRepository.save(updatedIncident)
    return updatedIncident
  }
}
