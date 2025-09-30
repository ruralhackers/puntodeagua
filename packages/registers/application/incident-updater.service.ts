import type { Id } from '@pda/common/domain'
import { Incident } from '../domain/entities/incident'
import type { IncidentRepository } from '../domain/repositories/incident.repository'

export class IncidentUpdater {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  async run(params: { id: Id; updatedIncident: Incident }): Promise<Incident> {
    const { id, updatedIncident } = params

    const existingIncident = await this.incidentRepository.findById(id)
    if (!existingIncident) {
      throw new Error(`Incident with id ${id.toString()} not found`)
    }

    // here we can do incident.update , that returns a new incident with the updated fields

    // Create merged incident with existing values as fallback
    const mergedIncident = Incident.fromDto({
      id: id.toString(),
      title: updatedIncident.title,
      reporterName: updatedIncident.reporterName,
      startAt: updatedIncident.startAt,
      communityId: existingIncident.communityId.toString(), // Keep existing community
      waterZoneId:
        updatedIncident.waterZoneId?.toString() ?? existingIncident.waterZoneId?.toString(),
      waterDepositId:
        updatedIncident.waterDepositId?.toString() ?? existingIncident.waterDepositId?.toString(),
      waterPointId:
        updatedIncident.waterPointId?.toString() ?? existingIncident.waterPointId?.toString(),
      description: updatedIncident.description ?? existingIncident.description,
      status: updatedIncident.status.toString(),
      endAt: updatedIncident.endAt ?? existingIncident.endAt
    })

    await this.incidentRepository.save(mergedIncident)
    return mergedIncident
  }
}
