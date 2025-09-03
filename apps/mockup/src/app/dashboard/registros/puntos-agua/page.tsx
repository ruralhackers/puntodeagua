'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PuntosAguaPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Datos de ejemplo
  const puntosAgua = [
    {
      id: 1,
      nombre: 'Pozo Principal Norte',
      tipo: 'Pozo',
      ubicacion: 'Sector Norte - Coordenadas: 10.123, -67.456',
      estado: 'Activo',
      capacidad: '5000 L/h',
      fechaInstalacion: '2020-03-15',
      ultimaInspeccion: '2023-06-10'
    },
    {
      id: 2,
      nombre: 'Tanque Elevado Central',
      tipo: 'Tanque',
      ubicacion: 'Centro - Altura: 25m',
      estado: 'Activo',
      capacidad: '50000 L',
      fechaInstalacion: '2018-11-20',
      ultimaInspeccion: '2023-06-08'
    },
    {
      id: 3,
      nombre: 'Red Distribución Este',
      tipo: 'Red',
      ubicacion: 'Sector Este - 2.5 km',
      estado: 'Mantenimiento',
      capacidad: '3000 L/h',
      fechaInstalacion: '2019-07-10',
      ultimaInspeccion: '2023-05-28'
    },
    {
      id: 4,
      nombre: 'Pozo Auxiliar Sur',
      tipo: 'Pozo',
      ubicacion: 'Sector Sur - Coordenadas: 10.098, -67.423',
      estado: 'Inactivo',
      capacidad: '2500 L/h',
      fechaInstalacion: '2021-01-12',
      ultimaInspeccion: '2023-04-15'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Pozo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'Tanque':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'Red':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/registros/puntos-agua/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    setSelectedItem(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar el elemento
    console.log('Eliminando punto de agua:', selectedItem);
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
          <h1 className="text-2xl font-bold text-gray-900">Puntos de Agua</h1>
          <p className="text-gray-600">Gestión de pozos, tanques y red de distribución</p>
        </div>
      </div>

      {/* Lista de puntos de agua */}
      <div className="space-y-4">
        {puntosAgua.map((punto) => (
          <div key={punto.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-blue-600 mt-1">
                  {getTipoIcon(punto.tipo)}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(punto.estado)} mb-2 inline-block`}>
                      {punto.estado}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{punto.nombre}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipo:</span>
                      <span>{punto.tipo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Ubicación:</span>
                      <span>{punto.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Capacidad:</span>
                      <span>{punto.capacidad}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Última inspección:</span>
                      <span>{punto.ultimaInspeccion}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(punto.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(punto.id)}
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
              ¿Estás seguro de que quieres eliminar este punto de agua? Esta acción no se puede deshacer.
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