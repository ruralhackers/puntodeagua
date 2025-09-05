import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterDetailPage from '@/src/features/water-meter/delivery/WaterMeterDetail.page'

interface PageProps {
  params: Promise<{ id: string }>
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params
  const waterMeter = await getUseCase(GetWaterMeterQry).execute(id)

  if (!waterMeter) {
    return (
      <div className="p-4">
        <h1>Contador no encontrado</h1>
        <p>El contador solicitado no existe.</p>
      </div>
    )
  }

  return <WaterMeterDetailPage waterMeter={waterMeter.toDto()} waterMeterId={id} />
}

export default Page
