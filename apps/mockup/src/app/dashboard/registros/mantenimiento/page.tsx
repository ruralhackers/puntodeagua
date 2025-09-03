'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MantenimientoPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Datos de ejemplo
  const mantenimientos = [
    {
      id: 1,
      titulo: 'Limpieza de tanque elevado',
      tipo: 'Preventivo',
      estado: 'Completado',
      puntoAgua: 'Tanque Elevado Central',
      fechaProgramada: '2023-06-05',
      fechaEjecucion: '2023-06-05',
      responsable: 'Carlos Rodríguez',
      duracion: '4 horas',
      descripcion: 'Limpieza completa del tanque, desinfección y revisión de válvulas',
      observaciones: 'Tanque en excelente estado, sin signos de corrosión',
      proximoMantenimiento: '2023-09-05'
    },
    {
      id: 2,
      titulo: 'Revisión de bombas de agua',
      tipo: 'Preventivo',
      estado: 'Completado',
      puntoAgua: 'Pozo Principal Norte',
      fechaProgramada: '2023-05-20',
      fechaEjecucion: '2023-05-20',
      responsable: 'Laura Sánchez',
      duracion: '3 horas',
      descripcion: 'Revisión general de bombas, cambio de aceite y verificación de presiones',
      observaciones: 'Bomba principal requiere cambio de rodamientos en próxima revisión',
      proximoMantenimiento: '2023-08-20'
    },
    {
      id: 3,
      titulo: 'Reparación de fuga en red',
      tipo: 'Correctivo',
      estado: 'Completado',
      puntoAgua: 'Red Distribución Este',
      fechaProgramada: '2023-06-12',
      fechaEjecucion: '2023-06-12',
      responsable: 'Pedro Gómez',
      duracion: '6 horas',
      descripcion: 'Reparación de fuga en tubería principal y reemplazo de sección dañada',
      observaciones: 'Se instaló nueva tubería de PVC de 6 pulgadas',
      proximoMantenimiento: null
    },
    {
      id: 4,
      titulo: 'Calibración de equipos de medición',
      tipo: 'Preventivo',
      estado: 'Programado',
      puntoAgua: 'Pozo Auxiliar Sur',
      fechaProgramada: '2023-06-25',
      fechaEjecucion: null,
      responsable: 'Ana Martínez',
      duracion: '2 horas',
      descripcion: 'Calibración de medidores de presión y caudal',
      observaciones: null,
      proximoMantenimiento: '2023-09-25'
    },
    {
      id: 5,
      titulo: 'Mantenimiento de válvulas de control',
      tipo: 'Preventivo',
      estado: 'En Proceso',
      puntoAgua: 'Red Distribución Este',
      fechaProgramada: '2023-06-22',
      fechaEjecucion: '2023-06-22',
      responsable: 'Carlos Rodríguez',
      duracion: '5 horas',
      descripcion: 'Lubricación y ajuste de válvulas de control de presión',
      observaciones: 'Válvula #3 requiere reemplazo de empaque',
      proximoMantenimiento: '2023-12-22'
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Programado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Preventivo':
        return 'bg-blue-100 text-blue-800';
      case 'Correctivo':
        return 'bg-orange-100 text-orange-800';
      case 'Emergencia':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Preventivo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Correctivo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Emergencia':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/registros/mantenimiento/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    setSelectedItem(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Eliminando mantenimiento:', selectedItem);
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
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-gray-600">Registros de mantenimiento preventivo y correctivo</p>
        </div>
      </div>

      {/* Lista de mantenimientos */}
      <div className="space-y-4">
        {mantenimientos.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-orange-600 mt-1">
                  {getTipoIcon(item.tipo)}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                        {item.estado}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(item.tipo)}`}>
                        {item.tipo}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.titulo}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Punto de agua:</span>
                      <span>{item.puntoAgua}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fecha programada:</span>
                      <span>{item.fechaProgramada}</span>
                    </div>
                    {item.fechaEjecucion && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Fecha ejecución:</span>
                        <span>{item.fechaEjecucion}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Responsable:</span>
                      <span>{item.responsable}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duración:</span>
                      <span>{item.duracion}</span>
                    </div>
                    {item.proximoMantenimiento && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Próximo mantenimiento:</span>
                        <span>{item.proximoMantenimiento}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Descripción:</span> {item.descripcion}
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
              ¿Estás seguro de que quieres eliminar este registro de mantenimiento? Esta acción no se puede deshacer.
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