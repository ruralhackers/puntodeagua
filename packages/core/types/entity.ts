export interface Entity<Schema, DTO> {
  create(data: Omit<Schema, 'id'>): Entity<Schema, DTO>
  fromDto(dto: DTO): Entity<Schema, DTO>
  toDto(): DTO
}
