import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import { CreateWaterMeterReadingPage } from '@/src/features/water-meter-reading/delivery/create-water-meter-reading.page'
import { GetWaterPointQry } from '@/src/features/water-point/application/get-water-point.qry'

interface PageProps {
  params: {
    id: string
  }
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params
  const getWaterMeterQry = getUseCase(GetWaterMeterQry)

  const waterMeter = await getWaterMeterQry.execute(id)

  if (!waterMeter) {
    return (
      <div className="p-4">
        <h1>Contador no encontrado</h1>
        <p>El contador solicitado no existe.</p>
      </div>
    )
  }

  const waterPoint = await getUseCase(GetWaterPointQry).execute({
    id: waterMeter.waterPointId.toString()
  })

  return (
    <CreateWaterMeterReadingPage waterMeter={waterMeter.toDto()} waterPoint={waterPoint?.toDto()} />
  )
}

export default Page
