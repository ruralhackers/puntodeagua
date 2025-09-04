import { promises as fs } from 'fs'
import path from 'path'

export interface FileStorageService {
  saveFile(buffer: Buffer, fileName: string): Promise<string>
  deleteFile(filePath: string): Promise<void>
  getFileUrl(filePath: string): string
}

export class LocalFileStorageService implements FileStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads')

  constructor() {
    this.ensureUploadDirectory()
  }

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName)
    await fs.writeFile(filePath, buffer)
    return filePath
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      // Archivo no existe, no hacer nada
    }
  }

  getFileUrl(filePath: string): string {
    const fileName = path.basename(filePath)
    return `/uploads/${fileName}`
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }
}
