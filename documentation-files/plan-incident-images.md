# Plan: Add Multiple Image Support for Incidents

## Overview
Implement support for incidents to have 0, 1, or multiple images. This follows the existing pattern from water meter and water meter reading images, but with a **one-to-many relationship** (one incident can have multiple images).

## Prerequisites

This plan assumes the file management refactoring has been completed. If not, adapt the code to use the current `@pda/water-account` file services.

## Key Difference from Water Meter Images

- **Water Meter**: 1:1 relationship (one water meter → one image max)
- **Water Meter Reading**: 1:1 relationship (one reading → one image max)
- **Incident**: **1:many relationship** (one incident → multiple images)

This means:
- No `@unique` constraint on `incidentId` in database
- Repository returns arrays
- UI shows image gallery instead of single image
- Can add/remove individual images

## Implementation Steps

### 1. Database Layer

#### Update Prisma Schema
**File:** `packages/database/prisma/schema.prisma`

Add the new `IncidentImage` model after the `Incident` model:

```prisma
model Incident {
  id String @id @default(cuid())

  community       Community      @relation(fields: [communityId], references: [id])
  communityId     String         @map("community_id")
  communityZoneId String?        @map("water_zone_id")
  communityZone   CommunityZone? @relation(fields: [communityZoneId], references: [id])
  waterDepositId  String?        @map("water_deposit_id")
  waterDeposit    WaterDeposit?  @relation(fields: [waterDepositId], references: [id])
  waterPointId    String?        @map("water_point_id")
  waterPoint      WaterPoint?    @relation(fields: [waterPointId], references: [id])

  title              String
  description        String?
  closingDescription String? @map("closing_description")
  reporterName       String

  status  String
  startAt DateTime
  endAt   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  incidentImages IncidentImage[] // NEW: One-to-many relationship

  @@index([communityId])
  @@index([communityZoneId])
  @@index([waterDepositId])
  @@index([waterPointId])
}

model IncidentImage {
  id         String   @id @default(cuid())
  incidentId String   @map("incident_id") // NOTE: NO @unique constraint
  url        String
  fileName   String   @map("file_name")
  fileSize   Int      @map("file_size")
  mimeType   String   @map("mime_type")
  uploadedAt DateTime @default(now()) @map("uploaded_at")
  externalKey String  @map("external_key")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  incident Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@index([incidentId])
}
```

**Create migration:**
```bash
cd packages/database
npx prisma migrate dev --name add_incident_images
```

### 2. Domain Layer (packages/registers)

#### A. Create IncidentImage DTO
**File:** `packages/registers/domain/entities/incident-image.dto.ts`

```typescript
import { z } from 'zod'
import { idSchema } from '@pda/common/domain'

export const incidentImageSchema = z.object({
  id: idSchema,
  incidentId: idSchema,
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  uploadedAt: z.date(),
  externalKey: z.string()
})

export type IncidentImageDto = z.infer<typeof incidentImageSchema>
```

#### B. Create IncidentImage Entity
**File:** `packages/registers/domain/entities/incident-image.ts`

```typescript
import { Id } from '@pda/common/domain'
import type { IncidentImageDto } from './incident-image.dto'

export class IncidentImage {
  private constructor(
    public readonly id: Id,
    public readonly incidentId: Id,
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly uploadedAt: Date,
    public readonly externalKey: string
  ) {}

  static fromDto(dto: IncidentImageDto): IncidentImage {
    return new IncidentImage(
      Id.fromString(dto.id),
      Id.fromString(dto.incidentId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      dto.uploadedAt,
      dto.externalKey
    )
  }

  static create(dto: Omit<IncidentImageDto, 'id' | 'uploadedAt'>): IncidentImage {
    return new IncidentImage(
      Id.generateUniqueId(),
      Id.fromString(dto.incidentId),
      dto.url,
      dto.fileName,
      dto.fileSize,
      dto.mimeType,
      new Date(),
      dto.externalKey
    )
  }

  toDto(): IncidentImageDto {
    return {
      id: this.id.toString(),
      incidentId: this.incidentId.toString(),
      url: this.url,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      uploadedAt: this.uploadedAt,
      externalKey: this.externalKey
    }
  }
}
```

#### C. Create Repository Interface
**File:** `packages/registers/domain/repositories/incident-image.repository.ts`

```typescript
import type { Id } from '@pda/common/domain'
import type { EntityFileRepository } from '@pda/storage/domain/repositories/entity-file.repository'
import type { IncidentImage } from '../entities/incident-image'

export interface IncidentImageRepository extends EntityFileRepository<IncidentImage> {
  /**
   * Find all images for a specific incident
   * Returns array since incidents can have multiple images
   */
  findByIncidentId(incidentId: Id): Promise<IncidentImage[]>

  /**
   * Delete all images for a specific incident
   * Useful when deleting an incident
   */
  deleteAllByIncidentId(incidentId: Id): Promise<void>
}
```

### 3. Infrastructure Layer (packages/registers)

#### Implement Prisma Repository
**File:** `packages/registers/infrastructure/repositories/incident-image.prisma-repository.ts`

```typescript
import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import { IncidentImage } from '../../domain/entities/incident-image'
import type { IncidentImageRepository } from '../../domain/repositories/incident-image.repository'

export class IncidentImagePrismaRepository
  extends BasePrismaRepository
  implements IncidentImageRepository
{
  protected readonly model = 'incidentImage'

  protected getModel() {
    return this.db[this.model]
  }

  async findById(id: Id): Promise<IncidentImage | undefined> {
    const image = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return image ? IncidentImage.fromDto(image) : undefined
  }

  async findByIncidentId(incidentId: Id): Promise<IncidentImage[]> {
    const images = await this.getModel().findMany({
      where: { incidentId: incidentId.toString() },
      orderBy: { uploadedAt: 'desc' }
    })
    return images.map((img: any) => IncidentImage.fromDto(img))
  }

  // For EntityFileRepository interface compatibility
  async findByEntityId(incidentId: Id): Promise<IncidentImage[]> {
    return this.findByIncidentId(incidentId)
  }

  async save(image: IncidentImage): Promise<void> {
    await this.getModel().create({
      data: {
        id: image.id.toString(),
        incidentId: image.incidentId.toString(),
        url: image.url,
        fileName: image.fileName,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt,
        externalKey: image.externalKey
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  async deleteAllByIncidentId(incidentId: Id): Promise<void> {
    await this.getModel().deleteMany({
      where: { incidentId: incidentId.toString() }
    })
  }
}
```

#### Update RegistersFactory
**File:** `packages/registers/infrastructure/factories/registers.factory.ts`

Add new repository method:

```typescript
import { IncidentImagePrismaRepository } from '../repositories/incident-image.prisma-repository'

export class RegistersFactory {
  private static incidentImageRepository: IncidentImagePrismaRepository | null = null

  // ... existing methods ...

  static incidentImagePrismaRepository(): IncidentImagePrismaRepository {
    if (!this.incidentImageRepository) {
      this.incidentImageRepository = new IncidentImagePrismaRepository(prisma)
    }
    return this.incidentImageRepository
  }

  // Update file services to include incident image repository
  static getFileUploaderService() {
    // Assuming refactored file services from @pda/storage
    const repositoryMap = new Map()
    repositoryMap.set(FileEntityType.INCIDENT, this.incidentImagePrismaRepository())
    
    return new FileUploaderService(
      // ... file storage repository,
      repositoryMap
    )
  }

  static getFileDeleterService() {
    const repositoryMap = new Map()
    repositoryMap.set(FileEntityType.INCIDENT, this.incidentImagePrismaRepository())
    
    return new FileDeleterService(
      // ... file storage repository,
      repositoryMap
    )
  }
}
```

### 4. Application Layer (packages/registers)

#### Update IncidentCreatorService
**File:** `packages/registers/application/incident-creator.service.ts`

```typescript
import type { FileMetadata } from '@pda/storage'
import { FileUploaderService, FileEntityType } from '@pda/storage'
import { IncidentImage } from '../domain/entities/incident-image'

export interface IncidentCreatorResult {
  incident: Incident
  imageUploadErrors?: string[] // Array of errors for each failed image
}

export class IncidentCreatorService {
  constructor(
    private readonly incidentRepository: IncidentRepository,
    private readonly fileUploaderService?: FileUploaderService // Optional
  ) {}

  async run(params: {
    incident: Incident
    images?: Array<{ file: Buffer; metadata: FileMetadata }>
  }): Promise<IncidentCreatorResult> {
    const { incident, images } = params

    // Save the incident first
    await this.incidentRepository.save(incident)

    const imageUploadErrors: string[] = []

    // Upload images if provided
    if (images && images.length > 0 && this.fileUploaderService) {
      for (let i = 0; i < images.length; i++) {
        try {
          await this.fileUploaderService.upload({
            file: images[i].file,
            entityId: incident.id,
            entityType: FileEntityType.INCIDENT,
            metadata: images[i].metadata,
            storageFolder: 'incidents',
            createEntity: (uploadResult) =>
              IncidentImage.create({
                incidentId: incident.id.toString(),
                url: uploadResult.url,
                fileName: uploadResult.metadata.fileName,
                fileSize: uploadResult.metadata.fileSize,
                mimeType: uploadResult.metadata.mimeType,
                externalKey: uploadResult.externalKey
              })
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          imageUploadErrors.push(`Image ${i + 1}: ${errorMsg}`)
          console.error(`Failed to upload incident image ${i + 1}:`, error)
        }
      }
    }

    return {
      incident,
      imageUploadErrors: imageUploadErrors.length > 0 ? imageUploadErrors : undefined
    }
  }
}
```

#### Update IncidentUpdaterService
**File:** `packages/registers/application/incident-updater.service.ts`

```typescript
import type { FileMetadata } from '@pda/storage'
import { FileUploaderService, FileDeleterService, FileEntityType } from '@pda/storage'

export interface IncidentUpdaterResult {
  incident: Incident
  imageUploadErrors?: string[]
  imageDeleteErrors?: string[]
}

export class IncidentUpdaterService {
  constructor(
    private readonly incidentRepository: IncidentRepository,
    private readonly fileUploaderService?: FileUploaderService,
    private readonly fileDeleterService?: FileDeleterService
  ) {}

  async run(params: {
    id: Id
    updatedIncidentData: IncidentUpdateDto
    newImages?: Array<{ file: Buffer; metadata: FileMetadata }>
    deleteImageIds?: string[]
  }): Promise<IncidentUpdaterResult> {
    const { id, updatedIncidentData, newImages, deleteImageIds } = params

    // Get and update the incident
    const incident = await this.incidentRepository.findById(id)
    if (!incident) {
      throw new Error('Incident not found')
    }

    incident.update(updatedIncidentData)
    await this.incidentRepository.save(incident)

    const imageUploadErrors: string[] = []
    const imageDeleteErrors: string[] = []

    // Delete images if requested
    if (deleteImageIds && deleteImageIds.length > 0 && this.fileDeleterService) {
      for (const imageId of deleteImageIds) {
        try {
          await this.fileDeleterService.delete({
            fileId: Id.fromString(imageId),
            entityType: FileEntityType.INCIDENT
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          imageDeleteErrors.push(`Image ${imageId}: ${errorMsg}`)
          console.error(`Failed to delete incident image ${imageId}:`, error)
        }
      }
    }

    // Upload new images if provided
    if (newImages && newImages.length > 0 && this.fileUploaderService) {
      for (let i = 0; i < newImages.length; i++) {
        try {
          await this.fileUploaderService.upload({
            file: newImages[i].file,
            entityId: incident.id,
            entityType: FileEntityType.INCIDENT,
            metadata: newImages[i].metadata,
            storageFolder: 'incidents',
            createEntity: (uploadResult) =>
              IncidentImage.create({
                incidentId: incident.id.toString(),
                url: uploadResult.url,
                fileName: uploadResult.metadata.fileName,
                fileSize: uploadResult.metadata.fileSize,
                mimeType: uploadResult.metadata.mimeType,
                externalKey: uploadResult.externalKey
              })
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          imageUploadErrors.push(`Image ${i + 1}: ${errorMsg}`)
          console.error(`Failed to upload incident image ${i + 1}:`, error)
        }
      }
    }

    return {
      incident,
      imageUploadErrors: imageUploadErrors.length > 0 ? imageUploadErrors : undefined,
      imageDeleteErrors: imageDeleteErrors.length > 0 ? imageDeleteErrors : undefined
    }
  }
}
```

### 5. API Layer (apps/webapp)

#### Update Incident Router
**File:** `apps/webapp/src/server/api/routers/incident.ts`

```typescript
import { fileUploadInputSchema } from '@pda/storage'

export const incidentsRouter = createTRPCRouter({
  // ... existing queries ...

  getIncidentById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const repo = RegistersFactory.incidentPrismaRepository()
      const imageRepo = RegistersFactory.incidentImagePrismaRepository()
      
      const incident = await repo.findById(Id.fromString(input.id))
      if (!incident) return null

      // Fetch images for the incident
      const images = await imageRepo.findByIncidentId(Id.fromString(input.id))

      return {
        ...incident.toDto(),
        images: images.map((img) => img.toDto())
      }
    }),

  addIncident: protectedProcedure
    .input(
      incidentSchema.omit({ id: true }).extend({
        images: z.array(fileUploadInputSchema).optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = RegistersFactory.incidentCreatorService()

        const incident = Incident.create({
          title: input.title,
          reporterName: input.reporterName,
          startAt: input.startAt,
          communityId: input.communityId,
          communityZoneId: input.communityZoneId,
          waterDepositId: input.waterDepositId,
          waterPointId: input.waterPointId,
          description: input.description,
          endAt: input.endAt,
          status: 'open'
        })

        // Process images if provided
        let imageData: Array<{ file: Buffer; metadata: FileMetadata }> | undefined
        if (input.images && input.images.length > 0) {
          imageData = input.images.map((img) => ({
            file: Buffer.from(img.file),
            metadata: FileMetadataCreatorService.createFileMetadata({
              originalName: img.metadata.originalName,
              fileSize: img.metadata.fileSize,
              mimeType: img.metadata.mimeType
            })
          }))
        }

        const result = await service.run({ incident, images: imageData })
        
        return {
          incident: result.incident.toDto(),
          imageUploadErrors: result.imageUploadErrors
        }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  updateIncident: protectedProcedure
    .input(
      incidentSchema.extend({
        newImages: z.array(fileUploadInputSchema).optional(),
        deleteImageIds: z.array(z.string()).optional()
      })
    )
    .mutation(async ({ input }) => {
      try {
        const service = RegistersFactory.incidentUpdaterService()

        // Process new images if provided
        let newImageData: Array<{ file: Buffer; metadata: FileMetadata }> | undefined
        if (input.newImages && input.newImages.length > 0) {
          newImageData = input.newImages.map((img) => ({
            file: Buffer.from(img.file),
            metadata: FileMetadataCreatorService.createFileMetadata({
              originalName: img.metadata.originalName,
              fileSize: img.metadata.fileSize,
              mimeType: img.metadata.mimeType
            })
          }))
        }

        const result = await service.run({
          id: Id.fromString(input.id),
          updatedIncidentData: {
            status: input.status,
            endAt: input.endAt,
            closingDescription: input.closingDescription
          },
          newImages: newImageData,
          deleteImageIds: input.deleteImageIds
        })

        return {
          incident: result.incident.toDto(),
          imageUploadErrors: result.imageUploadErrors,
          imageDeleteErrors: result.imageDeleteErrors
        }
      } catch (error) {
        handleDomainError(error)
      }
    }),

  deleteIncidentImage: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const service = RegistersFactory.getFileDeleterService()
        await service.delete({
          fileId: Id.fromString(input.imageId),
          entityType: FileEntityType.INCIDENT
        })
        return { success: true }
      } catch (error) {
        handleDomainError(error)
      }
    })
})
```

### 6. Frontend Layer (apps/webapp)

#### A. Create Multiple Image Uploader Hook
**File:** `apps/webapp/src/hooks/use-multiple-image-upload.ts`

```typescript
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/image-compressor'
import { ACCEPTED_FILE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants'

interface ImageFile {
  id: string
  file: File
  preview: string
}

export function useMultipleImageUpload() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)
    const newImages: ImageFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast.error(`Archivo no válido: ${file.name}`)
        continue
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`Imagen muy grande: ${file.name}. Máximo 10MB`)
        continue
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file)

        // Create preview
        const preview = URL.createObjectURL(compressedFile)

        newImages.push({
          id: `${Date.now()}-${i}`,
          file: compressedFile,
          preview
        })
      } catch (error) {
        console.error('Error processing image:', error)
        toast.error(`Error procesando imagen: ${file.name}`)
      }
    }

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setError(null)
  }, [images])

  const getImagesData = useCallback(async () => {
    const imagesData = await Promise.all(
      images.map(async (img) => {
        const arrayBuffer = await img.file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        return {
          file: base64,
          metadata: {
            originalName: img.file.name,
            fileSize: img.file.size,
            mimeType: img.file.type
          }
        }
      })
    )

    return imagesData
  }, [images])

  return {
    images,
    error,
    handleImageSelect,
    removeImage,
    clearImages,
    getImagesData
  }
}
```

#### B. Create Image Gallery Component
**File:** `apps/webapp/src/components/incident-image-gallery.tsx`

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface IncidentImageData {
  id: string
  url: string
  fileName: string
  fileSize: number
  uploadedAt: Date
}

interface IncidentImageGalleryProps {
  images: IncidentImageData[]
  onDeleteImage?: (imageId: string) => void
  canDelete?: boolean
}

export function IncidentImageGallery({
  images,
  onDeleteImage,
  canDelete = false
}: IncidentImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<IncidentImageData | null>(null)

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay imágenes adjuntas</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg border">
              <Image
                src={image.url}
                alt={image.fileName}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setSelectedImage(image)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canDelete && onDeleteImage && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDeleteImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {image.fileName}
            </p>
          </div>
        ))}
      </div>

      {/* Full size image dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imagen del incidente</DialogTitle>
            {selectedImage && (
              <p className="text-sm text-muted-foreground">
                {selectedImage.fileName} •{' '}
                {(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                {format(new Date(selectedImage.uploadedAt), "dd/MM/yyyy 'a las' HH:mm", {
                  locale: es
                })}
              </p>
            )}
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-[70vh]">
              <Image
                src={selectedImage.url}
                alt={selectedImage.fileName}
                fill
                className="object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

#### C. Update Add Incident Form

Add image upload section to the form:

```typescript
import { useMultipleImageUpload } from '@/hooks/use-multiple-image-upload'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// Inside component:
const { images, handleImageSelect, removeImage, getImagesData } = useMultipleImageUpload()

// In form JSX:
<div className="space-y-2">
  <Label htmlFor="images">Imágenes (opcional)</Label>
  <Input
    id="images"
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp"
    multiple
    onChange={handleImageSelect}
  />
  
  {images.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {images.map((img) => (
        <div key={img.id} className="relative">
          <img
            src={img.preview}
            alt="Preview"
            className="w-full h-24 object-cover rounded"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => removeImage(img.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )}
</div>

// In submit handler:
const imagesData = await getImagesData()
await addIncidentMutation.mutateAsync({
  // ... other fields
  images: imagesData
})
```

#### D. Update Incident Detail Page

Show incident images:

```typescript
import { IncidentImageGallery } from '@/components/incident-image-gallery'
import { api } from '@/trpc/react'

// Fetch incident with images
const { data: incident } = api.incident.getIncidentById.useQuery({ id: incidentId })

const deleteImageMutation = api.incident.deleteIncidentImage.useMutation({
  onSuccess: () => {
    toast.success('Imagen eliminada')
    refetch()
  }
})

// In JSX:
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Imágenes</h3>
  <IncidentImageGallery
    images={incident?.images || []}
    onDeleteImage={(imageId) => deleteImageMutation.mutate({ imageId })}
    canDelete={true}
  />
</div>
```

## Testing Checklist

- [ ] Create incident without images
- [ ] Create incident with 1 image
- [ ] Create incident with multiple images (3-5)
- [ ] View incident images in gallery
- [ ] Click image to view full size
- [ ] Update incident by adding new images
- [ ] Update incident by deleting individual images
- [ ] Delete incident (verify cascade delete removes all images from storage)
- [ ] Test file size validation
- [ ] Test file type validation
- [ ] Test storage errors (graceful degradation)
- [ ] Test responsive layout on mobile

## Rollback Plan

If issues occur:
1. Prisma migration can be rolled back: `npx prisma migrate resolve --rolled-back <migration_name>`
2. Comment out image-related code in services and API
3. Images in storage won't break anything (can be cleaned up later)

## Future Enhancements

- Image reordering (drag & drop)
- Image captions/descriptions
- Image thumbnails for better performance
- Bulk image upload progress indicator
- Image compression before upload
- Maximum images per incident limit

