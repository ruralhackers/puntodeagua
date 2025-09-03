const analysisTypes = ['water_quality', 'water_quantity'];

export class AnalysisType {
  static WATER_QUALITY = new AnalysisType("water_quality");
  static WATER_QUANTITY = new AnalysisType("water_quantity");

  constructor(public readonly value: string) {
  }

  static create(value: string) {
    if(!AnalysisType.isValidType(value)){
      throw new Error(`Invalid analysis type: ${value}`);
    }
    return new AnalysisType(value);
  }

  static isValidType(value: string): boolean {
    return (analysisTypes).includes(value);
  }

  toString(): string {
    return this.value;
  }
}