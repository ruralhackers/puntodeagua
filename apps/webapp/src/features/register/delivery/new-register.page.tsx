'use client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export const NewRegisterPage: FC = () => {
  const router = useRouter()
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [subtipoSeleccionado, setSubtipoSeleccionado] = useState('')
  const [mostrarSubtipo, setMostrarSubtipo] = useState(false)

  const tiposRegistro = [
    { value: 'analitica', label: 'Analítica' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'contador', label: 'Lectura de contadores' },
    { value: 'incidencia', label: 'Incidencias' }
  ]

  const subtiposAnalitica = [
    { value: 'cloro-ph', label: 'Cloro y pH (por usuario)' },
    { value: 'turbidez', label: 'Turbidez (por usuario)' },
    { value: 'dureza', label: 'Dureza (por laboratorio)' },
    { value: 'completa', label: 'Completa (por laboratorio)' }
  ]

  const handleTipoChange = (value: string) => {
    setTipoSeleccionado(value)
    setSubtipoSeleccionado('')
    setMostrarSubtipo(value === 'analitica')
  }

  const handleContinuar = () => {
    if (tipoSeleccionado === 'analitica' && subtipoSeleccionado) {
      router.push(`/dashboard/nuevo-registro/analitica/${subtipoSeleccionado}`)
    } else if (tipoSeleccionado === 'mantenimiento') {
      router.push('/dashboard/nuevo-registro/mantenimiento')
    } else if (tipoSeleccionado === 'contador') {
      router.push('/dashboard/nuevo-registro/contador')
    } else if (tipoSeleccionado === 'incidencia') {
      router.push('/dashboard/nuevo-registro/incidencia')
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Nuevo Registro</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Registro</label>
          <Select value={tipoSeleccionado} onValueChange={handleTipoChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el tipo de registro" />
            </SelectTrigger>
            <SelectContent>
              {tiposRegistro.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {mostrarSubtipo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Analítica
            </label>
            <Select value={subtipoSeleccionado} onValueChange={setSubtipoSeleccionado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de analítica" />
              </SelectTrigger>
              <SelectContent>
                {subtiposAnalitica.map((subtipo) => (
                  <SelectItem key={subtipo.value} value={subtipo.value}>
                    {subtipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleContinuar}
          disabled={!tipoSeleccionado || (tipoSeleccionado === 'analitica' && !subtipoSeleccionado)}
          className="w-full"
          size="lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
