export interface IssueDto {
  id: string
  title: string
  description: string
  reporterName: string
  waterZoneId: string
  status: string
  startAt: Date
  endAt?: Date
}
