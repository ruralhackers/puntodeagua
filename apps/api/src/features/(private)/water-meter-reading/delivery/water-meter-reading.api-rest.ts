import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../../api.container'
import { CreateWaterMeterReadingCmd } from '../application/create-water-meter-reading.cmd'
import { createWaterMeterReadingSchema } from '../application/create-water-meter-reading.schema'
import { DeleteWaterMeterReadingCmd } from '../application/delete-water-meter-reading.cmd'
import { GetWaterMeterReadingsQry } from '../application/get-water-meter-readings.qry'

export const waterMeterReadingApiRest = new Elysia({ prefix: '/water-meter-readings' })
  .get('/', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const waterMeterReadings = await useCaseService.execute(GetWaterMeterReadingsQry)
    return waterMeterReadings
  })
  .post('/', async ({ body, set }) => {
    try {
      const validationResult = createWaterMeterReadingSchema.safeParse(body)

      if (!validationResult.success) {
        set.status = 400
        return {
          error: 'Validation failed',
          details: validationResult.error.issues
        }
      }

      const validatedBody = validationResult.data

      console.log('🔍 Validated body:', { validatedBody, body })

      // Convertir la fecha del string a Date
      const readingDate = new Date(validatedBody.readingDate)

      // Validar que la fecha no sea en el futuro
      if (readingDate > new Date()) {
        set.status = 400
        return {
          error: 'Reading date cannot be in the future'
        }
      }

      // Ejecutar el comando
      const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
      const createCmd = apiContainer.get<CreateWaterMeterReadingCmd>(
        CreateWaterMeterReadingCmd.ID.toString()
      )

      const result = await createCmd.handle({
        waterMeterId: validatedBody.waterMeterId,
        reading: validatedBody.reading,
        normalizedReading: validatedBody.normalizedReading,
        readingDate,
        notes: validatedBody.notes,
        files: validatedBody.files,
        uploadedBy: validatedBody.uploadedBy
      })

      set.status = 201
      return result
    } catch (error) {
      set.status = 500
      return {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
  .delete('/water-meter-readings/:id', async ({ params, set }) => {
    try {
      const deleteCmd = apiContainer.get<DeleteWaterMeterReadingCmd>(
        DeleteWaterMeterReadingCmd.ID.toString()
      )

      await deleteCmd.handle({
        id: params.id
      })

      set.status = 204
      return
    } catch (error) {
      console.error('Error deleting water meter reading:', error)

      if (error instanceof Error && error.message.includes('not found')) {
        set.status = 404
        return {
          error: 'Water meter reading not found',
          message: error.message
        }
      }

      set.status = 500
      return {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
