import type { Incident } from '../domain/entities/incident'
import type { IncidentRepository } from '../domain/repositories/incident.repository'

export class IncidentCreator {
  constructor(private readonly incidentRepository: IncidentRepository) {}

  async run(params: { incident: Incident }) {
    const { incident } = params
    await this.incidentRepository.save(incident)
    return incident
  }
}
