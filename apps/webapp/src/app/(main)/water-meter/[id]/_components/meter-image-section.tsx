import { Edit, Plus } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface MeterImageSectionProps {
  waterMeterImage:
    | {
        url: string
        fileName: string
        fileSize: number
        uploadedAt: Date
      }
    | null
    | undefined
  onViewImage: () => void
  onEditImage: () => void
}

export function MeterImageSection({
  waterMeterImage,
  onViewImage,
  onEditImage
}: MeterImageSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Imagen del Contador
      </h3>
      {waterMeterImage ? (
        <div className="space-y-2">
          <button
            type="button"
            className="relative w-full h-32 rounded-lg border cursor-pointer hover:opacity-80 transition overflow-hidden"
            onClick={onViewImage}
          >
            <Image
              src={waterMeterImage.url}
              alt="Foto del contador"
              fill
              className="object-cover"
            />
          </button>
          <Button variant="outline" size="sm" className="w-full" onClick={onEditImage}>
            <Edit className="h-3 w-3 mr-1" />
            Cambiar
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 italic mb-2">Sin imagen</p>
          <Button variant="outline" size="sm" className="w-full" onClick={onEditImage}>
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        </div>
      )}
    </div>
  )
}
