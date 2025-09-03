"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // Datos de ejemplo
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

  // Combinar incidencias y tareas pasadas para el bloque "Requiere Atención"
  const elementosAtencion = [
    ...incidenciasAbiertas.slice(0, 2),
    ...tareasPasadas.slice(0, 2)
  ];

  const tareasFuturas = [
    {
      id: 1,
      titulo: "Limpieza de tanque principal",
      fecha: "2024-01-20",
      tipo: "Mantenimiento"
    },
    {
      id: 2,
      titulo: "Inspección de bombas",
      fecha: "2024-01-22",
      tipo: "Mantenimiento"
    },
    {
      id: 3,
      titulo: "Análisis bacteriológico",
      fecha: "2024-01-25",
      tipo: "Análisis"
    },
    {
      id: 4,
      titulo: "Revisión de medidores",
      fecha: "2024-01-28",
      tipo: "Mantenimiento"
    },
    {
      id: 5,
      titulo: "Mantenimiento preventivo",
      fecha: "2024-02-01",
      tipo: "Mantenimiento"
    },
    {
      id: 6,
      titulo: "Control de presión",
      fecha: "2024-02-03",
      tipo: "Análisis"
    }
  ];

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-3">
          <Link href="/" className="font-bold text-lg">
            Gestión Aguas
          </Link>
          <div className="flex items-center gap-2 md:block hidden">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/usuarios">Usuarios</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/puntos-agua">Puntos de Agua</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 px-3 py-4">
        {/* Botones principales destacados */}
        <div className="flex gap-3 mb-6">
          <Button 
            size="lg" 
            className="flex-1" 
            onClick={() => router.push('/dashboard/nuevo-registro')}
          >
            Nuevo Registro
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="flex-1" 
            onClick={() => router.push('/dashboard/incidencias/nueva')}
          >
            Nueva Incidencia
          </Button>
        </div>

        <div className="space-y-6">
          {/* Bloque Requiere Atención */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Requiere Atención</h2>
              <span className="text-sm text-gray-500">{elementosAtencion.length} elementos</span>
            </div>
            <div className="space-y-2">
              {elementosAtencion.map((elemento) => (
                <div 
                  key={`${elemento.tipo}-${elemento.id}`} 
                  className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (elemento.tipo === 'incidencia') {
                      router.push(`/dashboard/incidencias/${elemento.id}/editar`);
                    } else {
                      router.push(`/dashboard/tareas/${elemento.id}/registro`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                      </div>
                      <h3 className="font-medium text-sm text-gray-900">{elemento.titulo}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                         {elemento.tipo === 'incidencia' ? 
                           ('ubicacion' in elemento ? elemento.ubicacion : '') : 
                           ('fechaVencimiento' in elemento ? `Vencía: ${elemento.fechaVencimiento}` : '')
                         }
                       </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Editar</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a href="/dashboard/atencion" className="block w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium text-center">
               Ver todos los elementos
             </a>
          </div>

          {/* Tareas Programadas - Integradas en el lobby */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Tareas</h2>
            {/* Agrupar por día */}
            {Object.entries(
              tareasFuturas.reduce((grupos, tarea) => {
                const fecha = tarea.fecha;
                if (!grupos[fecha]) grupos[fecha] = [];
                grupos[fecha].push(tarea);
                return grupos;
              }, {} as Record<string, typeof tareasFuturas>)
            ).map(([fecha, tareas]) => (
              <div key={fecha} className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 px-2">{fecha}</h3>
                <div className="space-y-2">
                  {tareas.map((tarea) => {
                    const getTipoColor = (tipo: string) => {
                      switch (tipo) {
                        case 'Mantenimiento':
                          return 'bg-orange-100 text-orange-800';
                        case 'Análisis':
                          return 'bg-green-100 text-green-800';
                        case 'Inspección':
                          return 'bg-blue-100 text-blue-800';
                        default:
                          return 'bg-gray-100 text-gray-800';
                      }
                    };

                    return (
                      <button
                        key={tarea.id}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        onClick={() => {
                           // Navegar a la ficha de la tarea para añadir registro
                           router.push(`/dashboard/tareas/${tarea.id}/registro`);
                         }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{tarea.titulo}</h4>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTipoColor(tarea.tipo)}`}>
                            {tarea.tipo}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
