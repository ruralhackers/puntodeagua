import type {Query} from "core";
import type { Analysis, AnalysisRepository} from "features";


export class GetAnalysesQry implements Query<Analysis[]> {
  static readonly ID = "GetAnalysesQry";
    constructor(private readonly analysisRepository: AnalysisRepository) {
  }

  async handle(): Promise<Analysis[]> {
    return this.analysisRepository.findAll()
  }
}
