'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AnalisisPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Datos de ejemplo
  const analisis = [
    {
      id: 1,
      fecha: '2023-06-15',
      tipo: 'Análisis Bacteriológico',
      puntoAgua: 'Pozo Principal Norte',
      ph: 7.2,
      cloro: 0.8,
      turbidez: 1.2,
      presion: 2.5,
      resultado: 'Apto',
      responsable: 'Juan Pérez',
      observaciones: 'Valores dentro de los parámetros normales'
    },
    {
      id: 2,
      fecha: '2023-06-12',
      tipo: 'Análisis Químico',
      puntoAgua: 'Tanque Elevado Central',
      ph: 7.0,
      cloro: 0.9,
      turbidez: 0.8,
      presion: 3.0,
      resultado: 'Apto',
      responsable: 'María López',
      observaciones: 'Excelente calidad del agua'
    },
    {
      id: 3,
      fecha: '2023-06-10',
      tipo: 'Análisis Físico-Químico',
      puntoAgua: 'Red Distribución Este',
      ph: 6.8,
      cloro: 0.7,
      turbidez: 2.1,
      presion: 2.2,
      resultado: 'Observación',
      responsable: 'Carlos Rodríguez',
      observaciones: 'Turbidez ligeramente elevada, requiere seguimiento'
    },
    {
      id: 4,
      fecha: '2023-06-08',
      tipo: 'Análisis Bacteriológico',
      puntoAgua: 'Pozo Auxiliar Sur',
      ph: 7.1,
      cloro: 0.6,
      turbidez: 1.0,
      presion: 2.8,
      resultado: 'No Apto',
      responsable: 'Ana Martínez',
      observaciones: 'Presencia de coliformes, requiere tratamiento'
    }
  ];

  const getResultadoColor = (resultado: string) => {
    switch (resultado) {
      case 'Apto':
        return 'bg-green-100 text-green-800';
      case 'Observación':
        return 'bg-yellow-100 text-yellow-800';
      case 'No Apto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    if (tipo.includes('Bacteriológico')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    } else if (tipo.includes('Químico')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/registros/analisis/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    setSelectedItem(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Eliminando análisis:', selectedItem);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis</h1>
          <p className="text-gray-600">Registros de análisis de calidad del agua</p>
        </div>
      </div>

      {/* Lista de análisis */}
      <div className="space-y-4">
        {analisis.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-green-600 mt-1">
                  {getTipoIcon(item.tipo)}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultadoColor(item.resultado)} mb-2 inline-block`}>
                      {item.resultado}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{item.tipo}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fecha:</span>
                      <span>{item.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Punto de agua:</span>
                      <span>{item.puntoAgua}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Responsable:</span>
                      <span>{item.responsable}</span>
                    </div>
                  </div>
                  
                  {/* Parámetros */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500">pH</span>
                      <div className="font-medium">{item.ph}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500">Cloro (mg/L)</span>
                      <div className="font-medium">{item.cloro}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500">Turbidez (NTU)</span>
                      <div className="font-medium">{item.turbidez}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500">Presión (bar)</span>
                      <div className="font-medium">{item.presion}</div>
                    </div>
                  </div>
                  
                  {item.observaciones && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Observaciones:</span> {item.observaciones}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar este análisis? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}