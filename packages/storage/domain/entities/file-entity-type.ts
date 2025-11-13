export enum FileEntityType {
  WATER_METER = 'water-meter',
  WATER_METER_READING = 'water-meter-reading',
  INCIDENT = 'incident',
  // Future types
  ANALYSIS_REPORT = 'analysis-report',
  COMMUNITY_DOCUMENT = 'community-document',
  USER_AVATAR = 'user-avatar'
}

// Alias for backward compatibility during migration
export const ImageEntityType = FileEntityType
