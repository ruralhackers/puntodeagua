'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [incidencia, setIncidencia] = useState({
    titulo: '',
    tipo: 'fuga',
    prioridad: 'media',
    puntoAgua: '',
    descripcion: '',
    ubicacion: '',
    reportadoPor: '',
    telefono: ''
  });

  const tiposIncidencia = [
    { value: 'fuga', label: 'Fuga de Agua' },
    { value: 'presion', label: 'Problema de Presión' },
    { value: 'calidad', label: 'Problema de Calidad' },
    { value: 'corte', label: 'Corte de Suministro' },
    { value: 'infraestructura', label: 'Daño en Infraestructura' },
    { value: 'otro', label: 'Otro' }
  ];

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800' },
    { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-200 text-red-900' }
  ];

  const puntosAgua = [
    { value: 'pozo-a', label: 'Pozo A - Sector Norte' },
    { value: 'pozo-b', label: 'Pozo B - Sector Sur' },
    { value: 'tanque-principal', label: 'Tanque Principal' },
    { value: 'red-distribucion', label: 'Red de Distribución' },
    { value: 'otro', label: 'Otro punto' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la incidencia a la API
    console.log('Incidencia creada:', incidencia);
    // Redirigir de vuelta al inicio
    router.push('/');
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Nueva Incidencia</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Incidencia
          </label>
          <input
            type="text"
            value={incidencia.titulo}
            onChange={(e) => setIncidencia({ ...incidencia, titulo: e.target.value })}
            placeholder="Ej: Fuga en tubería principal"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Incidencia
          </label>
          <select
            value={incidencia.tipo}
            onChange={(e) => setIncidencia({ ...incidencia, tipo: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {tiposIncidencia.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridad
          </label>
          <select
            value={incidencia.prioridad}
            onChange={(e) => setIncidencia({ ...incidencia, prioridad: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {prioridades.map((prioridad) => (
              <option key={prioridad.value} value={prioridad.value}>
                {prioridad.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Punto de Agua Afectado
          </label>
          <select
            value={incidencia.puntoAgua}
            onChange={(e) => setIncidencia({ ...incidencia, puntoAgua: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Seleccionar punto de agua</option>
            {puntosAgua.map((punto) => (
              <option key={punto.value} value={punto.value}>
                {punto.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación Específica
          </label>
          <input
            type="text"
            value={incidencia.ubicacion}
            onChange={(e) => setIncidencia({ ...incidencia, ubicacion: e.target.value })}
            placeholder="Ej: Calle Principal #123, frente al parque"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Detallada
          </label>
          <textarea
            value={incidencia.descripcion}
            onChange={(e) => setIncidencia({ ...incidencia, descripcion: e.target.value })}
            placeholder="Describe la incidencia con el mayor detalle posible..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reportado por
            </label>
            <input
              type="text"
              value={incidencia.reportadoPor}
              onChange={(e) => setIncidencia({ ...incidencia, reportadoPor: e.target.value })}
              placeholder="Nombre de quien reporta"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              value={incidencia.telefono}
              onChange={(e) => setIncidencia({ ...incidencia, telefono: e.target.value })}
              placeholder="Número de teléfono"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Reportar Incidencia
          </button>
        </div>
      </form>
    </div>
  );
}