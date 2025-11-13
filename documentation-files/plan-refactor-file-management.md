# Plan: Refactor File Management to @pda/storage Package

## Overview
Refactor file management services from `@pda/water-account` to `@pda/storage` to create a domain-agnostic, reusable file management system that can handle images, PDFs, and other file types across all packages.

## Current Architecture Problems

### Issues
- `FileUploaderService` and `FileDeleterService` are in `@pda/water-account`
- Services are tightly coupled to water-account specific repositories
- Cannot be reused by other packages (registers, etc.)
- Each new domain would need to duplicate file upload logic
- `ImageEntityType` enum already exists in `@pda/storage` but references future incident type

### Current Location
```
packages/water-account/application/
├── file-uploader.service.ts       (needs to move)
├── file-deleter.service.ts        (needs to move)
└── file-metadata-creator.service.ts (needs to move)
```

## Target Architecture

### New Structure
```
packages/storage/
├── domain/
│   ├── constants/
│   │   └── file-constants.ts (expand for multiple file types)
│   ├── entities/
│   │   └── file-entity-type.ts (rename from image-entity-type)
│   ├── errors/
│   │   └── file-storage-errors.ts
│   ├── repositories/
│   │   ├── file-storage.repository.ts (low-level storage - exists)
│   │   └── entity-file.repository.ts (NEW - generic interface)
│   └── value-objects/
│       ├── file-metadata.dto.ts
│       ├── file-metadata.ts
│       ├── file-upload-input.dto.ts
│       └── file-upload-result.ts
├── application/                    (NEW FOLDER)
│   ├── file-uploader.service.ts    (moved & refactored)
│   ├── file-deleter.service.ts     (moved & refactored)
│   └── file-metadata-creator.service.ts (moved)
└── infrastructure/
    └── repositories/
        └── file-storage.r2.repository.ts
```

## Implementation Steps

### 1. Expand File Constants (packages/storage/domain/constants/file-constants.ts)

**Current:**
```typescript
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
```

**New:**
```typescript
// Image types
export const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const

// Document types (for future use)
export const VALID_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

// All valid types
export const VALID_FILE_TYPES = [
  ...VALID_IMAGE_TYPES,
  ...VALID_DOCUMENT_TYPES
] as const

// Size limits
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB

// Type exports
export type ValidImageType = (typeof VALID_IMAGE_TYPES)[number]
export type ValidDocumentType = (typeof VALID_DOCUMENT_TYPES)[number]
export type ValidFileType = (typeof VALID_FILE_TYPES)[number]

// File categories
export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document'
}

// Helper function
export function getMaxFileSize(mimeType: string): number {
  if (VALID_IMAGE_TYPES.includes(mimeType as any)) {
    return MAX_IMAGE_SIZE
  }
  if (VALID_DOCUMENT_TYPES.includes(mimeType as any)) {
    return MAX_DOCUMENT_SIZE
  }
  return MAX_IMAGE_SIZE // default
}
```

### 2. Rename and Expand Entity Type (packages/storage/domain/entities/file-entity-type.ts)

**Current:** `image-entity-type.ts`
```typescript
export enum ImageEntityType {
  WATER_METER = 'water-meter',
  WATER_METER_READING = 'water-meter-reading',
  INCIDENT = 'incident'
}
```

**New:** Rename file to `file-entity-type.ts`
```typescript
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
```

### 3. Create Generic Repository Interface (packages/storage/domain/repositories/entity-file.repository.ts)

**New file:**
```typescript
import type { Id } from '@pda/common/domain'

/**
 * Generic interface for repositories that store files/images for entities.
 * Each domain (water-account, registers, etc.) should implement this interface
 * for their specific file entity types.
 * 
 * @template T - The file entity type (e.g., WaterMeterImage, IncidentImage)
 */
export interface EntityFileRepository<T> {
  /**
   * Find a file by its ID
   */
  findById(id: Id): Promise<T | undefined>

  /**
   * Find all files associated with an entity
   * Returns array to support both 1:1 and 1:many relationships
   */
  findByEntityId(entityId: Id): Promise<T[]>

  /**
   * Save a file entity
   */
  save(file: T): Promise<void>

  /**
   * Delete a file by its ID
   */
  delete(id: Id): Promise<void>
}
```

### 4. Create Application Folder and Move Services

#### A. Move and Refactor FileMetadataCreatorService

**From:** `packages/water-account/application/file-metadata-creator.service.ts`
**To:** `packages/storage/application/file-metadata-creator.service.ts`

No changes needed - already domain-agnostic.

#### B. Refactor FileUploaderService

**New:** `packages/storage/application/file-uploader.service.ts`

```typescript
import type { Id } from '@pda/common/domain'
import {
  type FileMetadata,
  FileSizeExceededError,
  InvalidFileTypeError,
  getMaxFileSize,
  VALID_FILE_TYPES
} from '../domain'
import type { EntityFileRepository } from '../domain/repositories/entity-file.repository'
import type { FileStorageRepository } from '../domain/repositories/file-storage.repository'
import { FileEntityType } from '../domain/entities/file-entity-type'

export interface FileUploadParams<T> {
  file: Buffer
  entityId: Id
  entityType: FileEntityType
  metadata: FileMetadata
  storageFolder: string // e.g., 'water-meters', 'incidents'
  createEntity: (uploadResult: {
    url: string
    externalKey: string
    metadata: FileMetadata
  }) => T
}

export class FileUploaderService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly repositoryMap: Map<FileEntityType, EntityFileRepository<any>>
  ) {}

  async upload<T>(params: FileUploadParams<T>): Promise<string> {
    const { file, entityId, entityType, metadata, storageFolder, createEntity } = params

    // Validate file
    this.validateFile(metadata)

    // Get appropriate repository
    const repository = this.repositoryMap.get(entityType)
    if (!repository) {
      throw new Error(`No repository configured for entity type: ${entityType}`)
    }

    // Upload to storage
    const uploadResult = await this.fileStorageRepository.upload(
      file,
      metadata,
      entityId.toString(),
      storageFolder
    )

    // Create entity using provided factory function
    const fileEntity = createEntity({
      url: uploadResult.url,
      externalKey: uploadResult.externalKey,
      metadata: uploadResult.metadata
    })

    // Save to database
    await repository.save(fileEntity)

    return uploadResult.url
  }

  private validateFile(metadata: FileMetadata): void {
    // Validate file type
    if (!VALID_FILE_TYPES.includes(metadata.mimeType as any)) {
      throw new InvalidFileTypeError(metadata.mimeType)
    }

    // Validate file size based on type
    const maxSize = getMaxFileSize(metadata.mimeType)
    if (metadata.fileSize > maxSize) {
      throw new FileSizeExceededError(metadata.fileSize, maxSize)
    }
  }
}
```

#### C. Refactor FileDeleterService

**New:** `packages/storage/application/file-deleter.service.ts`

```typescript
import type { Id } from '@pda/common/domain'
import type { EntityFileRepository } from '../domain/repositories/entity-file.repository'
import type { FileStorageRepository } from '../domain/repositories/file-storage.repository'
import { FileEntityType } from '../domain/entities/file-entity-type'

export interface FileDeleteParams {
  fileId: Id
  entityType: FileEntityType
}

export class FileDeleterService {
  constructor(
    private readonly fileStorageRepository: FileStorageRepository,
    private readonly repositoryMap: Map<FileEntityType, EntityFileRepository<any>>
  ) {}

  async delete(params: FileDeleteParams): Promise<void> {
    const { fileId, entityType } = params

    // Get appropriate repository
    const repository = this.repositoryMap.get(entityType)
    if (!repository) {
      throw new Error(`No repository configured for entity type: ${entityType}`)
    }

    // Get the file entity from database
    const fileEntity = await repository.findById(fileId)
    if (!fileEntity) {
      return // File not found, nothing to delete
    }

    // Extract externalKey - assume all file entities have this property
    const externalKey = (fileEntity as any).externalKey
    if (!externalKey) {
      throw new Error('File entity does not have externalKey property')
    }

    // Delete from storage
    await this.fileStorageRepository.delete(externalKey)

    // Delete from database
    await repository.delete(fileId)
  }
}
```

### 5. Update Storage Package Exports (packages/storage/index.ts)

```typescript
export * from './domain'
export * from './application'
export * from './infrastructure'
```

Create `packages/storage/application/index.ts`:
```typescript
export * from './file-uploader.service'
export * from './file-deleter.service'
export * from './file-metadata-creator.service'
```

### 6. Update Domain Package Implementations

#### Water Account Package

**Update:** `packages/water-account/infrastructure/repositories/water-meter-image.prisma-repository.ts`

Implement the generic interface:
```typescript
import { EntityFileRepository } from '@pda/storage/domain/repositories/entity-file.repository'

export class WaterMeterImagePrismaRepository
  extends BasePrismaRepository
  implements EntityFileRepository<WaterMeterImage>
{
  // ... existing implementation ...
  
  // Update findByWaterMeterId to match interface
  async findByEntityId(waterMeterId: Id): Promise<WaterMeterImage[]> {
    const image = await this.findByWaterMeterId(waterMeterId)
    return image ? [image] : [] // Return array for consistency
  }

  // Keep existing findByWaterMeterId for internal use
  async findByWaterMeterId(waterMeterId: Id): Promise<WaterMeterImage | undefined> {
    // ... existing code ...
  }
}
```

Do the same for `WaterMeterReadingImagePrismaRepository`.

**Update:** `packages/water-account/infrastructure/factories/water-account.factory.ts`

```typescript
import { FileUploaderService, FileDeleterService } from '@pda/storage/application'
import { FileEntityType } from '@pda/storage'

export class WaterAccountFactory {
  private static fileUploaderService: FileUploaderService | null = null
  private static fileDeleterService: FileDeleterService | null = null

  static getFileUploaderService(): FileUploaderService {
    if (!this.fileUploaderService) {
      const repositoryMap = new Map()
      repositoryMap.set(
        FileEntityType.WATER_METER,
        this.waterMeterImagePrismaRepository()
      )
      repositoryMap.set(
        FileEntityType.WATER_METER_READING,
        this.waterMeterReadingImagePrismaRepository()
      )

      this.fileUploaderService = new FileUploaderService(
        this.fileStorageRepository(),
        repositoryMap
      )
    }
    return this.fileUploaderService
  }

  static getFileDeleterService(): FileDeleterService {
    if (!this.fileDeleterService) {
      const repositoryMap = new Map()
      repositoryMap.set(
        FileEntityType.WATER_METER,
        this.waterMeterImagePrismaRepository()
      )
      repositoryMap.set(
        FileEntityType.WATER_METER_READING,
        this.waterMeterReadingImagePrismaRepository()
      )

      this.fileDeleterService = new FileDeleterService(
        this.fileStorageRepository(),
        repositoryMap
      )
    }
    return this.fileDeleterService
  }

  // ... rest of factory methods ...
}
```

**Update:** Service methods that use FileUploader/FileDeleter

Example in `water-meter-reading-creator.service.ts`:
```typescript
// Before
await this.fileUploaderService.run({
  file: image.file,
  entityId: newWaterReading.id,
  entityType: ImageEntityType.WATER_METER_READING,
  metadata: image.metadata
})

// After
await this.fileUploaderService.upload({
  file: image.file,
  entityId: newWaterReading.id,
  entityType: FileEntityType.WATER_METER_READING,
  metadata: image.metadata,
  storageFolder: 'water-meter-readings',
  createEntity: (uploadResult) =>
    WaterMeterReadingImage.create({
      waterMeterReadingId: newWaterReading.id.toString(),
      url: uploadResult.url,
      fileName: uploadResult.metadata.fileName,
      fileSize: uploadResult.metadata.fileSize,
      mimeType: uploadResult.metadata.mimeType,
      uploadedAt: new Date(),
      externalKey: uploadResult.externalKey
    })
})
```

### 7. Update All Imports Across Codebase

**Search and replace:**
- `ImageEntityType` → `FileEntityType` (or keep alias for gradual migration)
- `@pda/water-account` file service imports → `@pda/storage`
- Update file service method calls from `.run()` to `.upload()` / `.delete()`

### 8. Delete Old Files

After migration is complete and tested:
- Delete `packages/water-account/application/file-uploader.service.ts`
- Delete `packages/water-account/application/file-deleter.service.ts`
- Delete `packages/water-account/application/file-metadata-creator.service.ts`

## Testing Strategy

1. **Unit tests** for new generic services
2. **Integration tests** for water-meter image upload (verify existing functionality works)
3. **Integration tests** for water-meter-reading image upload
4. Test error handling (invalid file types, size limits, missing repositories)

## Migration Checklist

- [X] Expand file constants for multiple file types
- [X] Rename `ImageEntityType` to `FileEntityType` (keep alias)
- [X] Create generic `EntityFileRepository` interface
- [X] Create `packages/storage/application/` folder
- [X] Move and refactor `FileMetadataCreatorService`
- [X] Refactor and move `FileUploaderService`
- [X] Refactor and move `FileDeleterService`
- [X] Update storage package exports
- [X] Update water-account repositories to implement generic interface
- [X] Update WaterAccountFactory to use new services
- [X] Update water-meter-reading-creator service calls
- [X] Update water-meter-reading-updater service calls
- [X] Update water-meter-image-updater service calls
- [X] Update all imports across codebase
- [X] Test existing water-meter functionality
- [X] Test existing water-meter-reading functionality
- [X] Delete old service files
- [X] Update documentation

## Benefits After Refactoring

✅ **Reusable** - Any package can use file services  
✅ **Domain-agnostic** - No coupling to specific domains  
✅ **Type-safe** - TypeScript generics ensure type safety  
✅ **Extensible** - Easy to add new file types (PDFs, documents)  
✅ **Single responsibility** - Storage package handles all file operations  
✅ **Testable** - Services can be tested independently  
✅ **No duplication** - One implementation for all domains  

## Future Enhancements

After this refactoring, it will be easy to add:
- PDF upload for analysis reports
- Document upload for community documents
- Video/audio support
- File compression/optimization
- Thumbnail generation for images
- File metadata extraction (EXIF data, PDF info)

