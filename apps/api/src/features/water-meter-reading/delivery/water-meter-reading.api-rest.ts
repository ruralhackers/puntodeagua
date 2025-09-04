import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from '../../../api.container'
import { CreateWaterMeterReadingCmd } from '../application/create-water-meter-reading.cmd'
import { GetWaterMeterReadingsQry } from '../application/get-water-meter-readings.qry'

export const waterMeterReadingApiRest = new Elysia()
  .post('/water-meter-readings', async ({ request }) => {
    const formData = await request.formData()

    // Datos básicos de la lectura
    const waterMeterId = formData.get('waterMeterId') as string
    const reading = formData.get('reading') as string
    const readingDate = formData.get('readingDate') as string
    const notes = formData.get('notes') as string

    // Procesar archivos
    const files: any[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer())
        files.push({
          originalName: value.name,
          mimeType: value.type,
          size: value.size,
          buffer
        })
      }
    }

    const createData = {
      waterMeterId,
      reading,
      readingDate,
      notes,
      files
    }

    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const readingId = await useCaseService.execute(CreateWaterMeterReadingCmd, createData)

    return {
      success: true,
      readingId,
      filesCount: files.length
    }
  })
  .get('/water-meter-readings', async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    const readings = await useCaseService.execute(GetWaterMeterReadingsQry)
    return readings.map((x) => x.toDto())
  })
  .get('/water-meter-readings/:id', async ({ params }) => {
    // TODO: Implementar GetWaterMeterReadingByIdQry
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    // const reading = await useCaseService.execute(GetWaterMeterReadingByIdQry, params.id);
    // return reading.toDto();
    return { message: 'Not implemented yet' }
  })
  .delete('/water-meter-readings/:id', async ({ params }) => {
    // TODO: Implementar DeleteWaterMeterReadingCmd
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
    // await useCaseService.execute(DeleteWaterMeterReadingCmd, params.id);
    // return { success: true };
    return { message: 'Not implemented yet' }
  })
