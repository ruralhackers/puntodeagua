'use client';

import { useRouter } from 'next/navigation';

export default function AtencionPage() {
  const router = useRouter();
  // Datos de ejemplo - en una aplicación real vendrían de una API
  const incidenciasAbiertas = [
    {
      id: 1,
      titulo: "Fuga en tubería principal",
      ubicacion: "Sector Norte",
      prioridad: "Alta",
      fecha: "2024-01-15",
      tipo: "incidencia"
    },
    {
      id: 2,
      titulo: "Presión baja en zona residencial",
      ubicacion: "Sector Sur",
      prioridad: "Media",
      fecha: "2024-01-14",
      tipo: "incidencia"
    },
    {
      id: 3,
      titulo: "Calidad del agua cuestionable",
      ubicacion: "Pozo Central",
      prioridad: "Alta",
      fecha: "2024-01-13",
      tipo: "incidencia"
    }
  ];

  const tareasPasadas = [
    {
      id: 1,
      titulo: "Inspección mensual Pozo A",
      fechaVencimiento: "2024-01-10",
      tipo: "tarea",
      subtipo: "Mantenimiento",
      estado: "Pendiente"
    },
    {
      id: 2,
      titulo: "Análisis de calidad del agua",
      fechaVencimiento: "2024-01-12",
      tipo: "tarea",
      subtipo: "Análisis",
      estado: "Pendiente"
    },
    {
      id: 3,
      titulo: "Revisión de válvulas",
      fechaVencimiento: "2024-01-08",
      tipo: "tarea",
      subtipo: "Mantenimiento",
      estado: "Pendiente"
    }
  ];

  // Combinar todos los elementos
  const todosElementos = [
    ...incidenciasAbiertas,
    ...tareasPasadas
  ];

  const handleElementClick = (elemento: { id: number; tipo: string }) => {
    if (elemento.tipo === 'incidencia') {
      // Navegar a la página de edición de incidencia
      router.push(`/dashboard/incidencias/${elemento.id}/editar`);
    } else {
      // Navegar a la página de registro de tarea
      router.push(`/dashboard/tareas/${elemento.id}/registro`);
    }
  };

  return (
    <div className="px-3 py-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Requiere Atención</h1>
      </div>
      
      <div className="space-y-3">
        {todosElementos.map((elemento) => (
          <div 
            key={`${elemento.tipo}-${elemento.id}`} 
            className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleElementClick(elemento)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    elemento.tipo === 'incidencia' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {elemento.tipo === 'incidencia' ? 'Incidencia' : 'Tarea Vencida'}
                  </span>
                  {elemento.tipo === 'incidencia' && 'prioridad' in elemento && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      elemento.prioridad === 'Alta' ? 'bg-red-200 text-red-900' :
                      elemento.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {elemento.prioridad}
                    </span>
                  )}
                  {elemento.tipo === 'tarea' && 'subtipo' in elemento && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {elemento.subtipo}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{elemento.titulo}</h3>
                <p className="text-sm text-gray-600">
                  {elemento.tipo === 'incidencia' ? 
                    ('ubicacion' in elemento ? elemento.ubicacion : '') : 
                    ('fechaVencimiento' in elemento ? `Vencía: ${elemento.fechaVencimiento}` : '')
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {elemento.tipo === 'incidencia' ? 
                    ('fecha' in elemento ? `Reportada: ${elemento.fecha}` : '') :
                    ('estado' in elemento ? `Estado: ${elemento.estado}` : '')
                  }
                </p>
              </div>
              <div className="flex items-center justify-end mt-2 gap-2">
                <span className="text-sm text-gray-500">Editar</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}