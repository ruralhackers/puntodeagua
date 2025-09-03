export interface WaterPointDto {
    id: string
    location: {
        latitude: string
        longitude: string
    }
    communityId: string
    note?: string
}
