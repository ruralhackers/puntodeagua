'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditarIncidenciaPage() {
  const router = useRouter();
  const params = useParams();
  const incidenciaId = params.id as string;
  
  const [incidencia, setIncidencia] = useState({
    id: '',
    titulo: '',
    tipo: 'fuga',
    prioridad: 'media',
    estado: 'abierta',
    puntoAgua: '',
    descripcion: '',
    ubicacion: '',
    reportadoPor: '',
    telefono: '',
    fechaCreacion: '',
    observacionesAdicionales: '',
    solucionAplicada: '',
    fechaResolucion: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos de la incidencia
    const cargarIncidencia = async () => {
      // Datos de ejemplo basados en el ID
      const incidenciaEjemplo = {
        id: incidenciaId,
        titulo: 'Fuga en tubería principal',
        tipo: 'fuga',
        prioridad: 'alta',
        estado: 'abierta',
        puntoAgua: 'pozo-a',
        descripcion: 'Se detectó una fuga significativa en la tubería principal que abastece al sector norte.',
        ubicacion: 'Calle Principal #123, frente al parque',
        reportadoPor: 'María González',
        telefono: '+34 666 123 456',
        fechaCreacion: '2024-01-15',
        observacionesAdicionales: '',
        solucionAplicada: '',
        fechaResolucion: ''
      };
      
      setIncidencia(incidenciaEjemplo);
      setLoading(false);
    };

    cargarIncidencia();
  }, [incidenciaId]);

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

  const estados = [
    { value: 'abierta', label: 'Abierta', color: 'bg-red-100 text-red-800' },
    { value: 'en_progreso', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resuelta', label: 'Resuelta', color: 'bg-green-100 text-green-800' },
    { value: 'cerrada', label: 'Cerrada', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría la actualización a la API
    console.log('Incidencia actualizada:', incidencia);
    // Redirigir de vuelta a la página de atención
    router.push('/dashboard/atencion');
  };

  if (loading) {
    return (
      <div className="p-4 pb-20 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <h1 className="text-xl font-bold">Editar Incidencia #{incidencia.id}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información básica (solo lectura) */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h3 className="font-medium text-gray-900">Información Original</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><span className="font-medium">Fecha de creación:</span> {incidencia.fechaCreacion}</div>
            <div><span className="font-medium">Reportado por:</span> {incidencia.reportadoPor}</div>
            <div><span className="font-medium">Teléfono:</span> {incidencia.telefono}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Incidencia
          </label>
          <input
            type="text"
            value={incidencia.titulo}
            onChange={(e) => setIncidencia({ ...incidencia, titulo: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={incidencia.estado}
            onChange={(e) => setIncidencia({ ...incidencia, estado: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={incidencia.ubicacion}
            onChange={(e) => setIncidencia({ ...incidencia, ubicacion: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Original
          </label>
          <textarea
            value={incidencia.descripcion}
            onChange={(e) => setIncidencia({ ...incidencia, descripcion: e.target.value })}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones Adicionales
          </label>
          <textarea
            value={incidencia.observacionesAdicionales}
            onChange={(e) => setIncidencia({ ...incidencia, observacionesAdicionales: e.target.value })}
            placeholder="Añade información adicional, actualizaciones del estado, etc..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solución Aplicada
          </label>
          <textarea
            value={incidencia.solucionAplicada}
            onChange={(e) => setIncidencia({ ...incidencia, solucionAplicada: e.target.value })}
            placeholder="Describe la solución implementada o las acciones tomadas..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {incidencia.estado === 'resuelta' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Resolución
            </label>
            <input
              type="date"
              value={incidencia.fechaResolucion}
              onChange={(e) => setIncidencia({ ...incidencia, fechaResolucion: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

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
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}