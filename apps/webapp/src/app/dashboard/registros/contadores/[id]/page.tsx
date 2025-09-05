import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetHolderQry } from '@/src/features/holder/application/get-holder.qry'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterDetailPage from '@/src/features/water-meter/delivery/WaterMeterDetail.page'
import { GetWaterPointQry } from '@/src/features/water-point/application/get-water-point.qry'

interface PageProps {
  params: Promise<{ id: string }>
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params

  // Get water meter first
  const waterMeter = await getUseCase(GetWaterMeterQry).execute(id)

  if (!waterMeter) {
    return (
      <div className="p-4">
        <h1>Contador no encontrado</h1>
        <p>El contador solicitado no existe.</p>
      </div>
    )
  }

  const waterMeterDto = waterMeter.toDto()

  // Get holder and water point data in parallel
  const [holder, waterPoint] = await Promise.all([
    getUseCase(GetHolderQry).execute({ id: waterMeterDto.holderId }),
    getUseCase(GetWaterPointQry).execute({ id: waterMeterDto.waterPointId })
  ])

  return (
    <WaterMeterDetailPage
      waterMeter={waterMeterDto}
      waterMeterId={id}
      holder={holder?.toDto()}
      waterPoint={waterPoint?.toDto()}
    />
  )
}

export default Page
