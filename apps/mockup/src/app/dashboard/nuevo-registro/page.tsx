'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function NuevoRegistroPage() {
  const router = useRouter();
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');

  const tiposRegistro = [
    { value: 'analisis', label: 'Análisis de Agua' },
    { value: 'incidencia', label: 'Incidencia' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'contador', label: 'Chequeo de Contador' }
  ];

  const handleContinuar = () => {
    if (tipoSeleccionado) {
      router.push(`/dashboard/nuevo-registro/${tipoSeleccionado}`);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Nuevo Registro</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Registro
          </label>
          <Select value={tipoSeleccionado} onValueChange={setTipoSeleccionado}>
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

        <Button 
          onClick={handleContinuar}
          disabled={!tipoSeleccionado}
          className="w-full"
          size="lg"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}