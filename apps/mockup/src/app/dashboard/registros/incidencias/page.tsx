'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function IncidenciasPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Datos de ejemplo
  const incidencias = [
    {
      id: 1,
      titulo: 'Fuga en tubería principal',
      tipo: 'Fuga',
      prioridad: 'Alta',
      estado: 'Resuelta',
      puntoAgua: 'Red Distribución Este',
      ubicacion: 'Calle Principal #123',
      fechaReporte: '2023-06-10',
      fechaResolucion: '2023-06-12',
      reportadoPor: 'Pedro Gómez',
      telefono: '+58 412-1234567',
      descripcion: 'Fuga importante en la tubería principal que afecta el suministro',
      solucion: 'Reparación de tubería y reemplazo de sección dañada'
    },
    {
      id: 2,
      titulo: 'Avería en bomba de agua',
      tipo: 'Avería Equipo',
      prioridad: 'Media',
      estado: 'En Proceso',
      puntoAgua: 'Pozo Principal Norte',
      ubicacion: 'Estación de bombeo Norte',
      fechaReporte: '2023-06-18',
      fechaResolucion: null,
      reportadoPor: 'Ana Martínez',
      telefono: '+58 424-7654321',
      descripcion: 'La bomba principal presenta ruidos anómalos y baja presión',
      solucion: null
    },
    {
      id: 3,
      titulo: 'Baja presión en sector residencial',
      tipo: 'Presión',
      prioridad: 'Media',
      estado: 'Reportada',
      puntoAgua: 'Tanque Elevado Central',
      ubicacion: 'Urbanización Los Pinos',
      fechaReporte: '2023-06-20',
      fechaResolucion: null,
      reportadoPor: 'Carlos Rodríguez',
      telefono: '+58 416-9876543',
      descripcion: 'Varios usuarios reportan baja presión de agua en horario nocturno',
      solucion: null
    },
    {
      id: 4,
      titulo: 'Contaminación visual del agua',
      tipo: 'Calidad',
      prioridad: 'Alta',
      estado: 'Investigando',
      puntoAgua: 'Pozo Auxiliar Sur',
      ubicacion: 'Sector Sur - Manzana 5',
      fechaReporte: '2023-06-22',
      fechaResolucion: null,
      reportadoPor: 'Laura Sánchez',
      telefono: '+58 414-5555555',
      descripcion: 'El agua presenta coloración amarillenta y olor extraño',
      solucion: null
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Resuelta':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Investigando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reportada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Fuga':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'Avería Equipo':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Presión':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'Calidad':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/incidencias/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    setSelectedItem(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Eliminando incidencia:', selectedItem);
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
          <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-gray-600">Historial de incidencias reportadas y su resolución</p>
        </div>
      </div>

      {/* Lista de incidencias */}
      <div className="space-y-4">
        {incidencias.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-red-600 mt-1">
                  {getTipoIcon(item.tipo)}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                        {item.estado}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(item.prioridad)}`}>
                        {item.prioridad}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.titulo}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tipo:</span>
                      <span>{item.tipo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Punto de agua:</span>
                      <span>{item.puntoAgua}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Ubicación:</span>
                      <span>{item.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fecha reporte:</span>
                      <span>{item.fechaReporte}</span>
                    </div>
                    {item.fechaResolucion && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Fecha resolución:</span>
                        <span>{item.fechaResolucion}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Reportado por:</span>
                      <span>{item.reportadoPor} ({item.telefono})</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Descripción:</span> {item.descripcion}
                  </div>
                  
                  {item.solucion && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Solución:</span> {item.solucion}
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
              ¿Estás seguro de que quieres eliminar esta incidencia? Esta acción no se puede deshacer.
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