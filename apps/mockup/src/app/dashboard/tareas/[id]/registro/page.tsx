'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function RegistroTareaPage() {
  const params = useParams();
  const tareaId = params.id;
  
  const [registro, setRegistro] = useState({
    observaciones: '',
    estado: 'completada',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  // Datos de ejemplo de la tarea
  const tarea = {
    id: tareaId,
    titulo: "Limpieza de tanque principal",
    fecha: "2024-01-20",
    tipo: "Mantenimiento",
    descripcion: "Realizar limpieza completa del tanque principal de almacenamiento"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el registro a la API
    console.log('Registro enviado:', { tareaId, ...registro });
    // Redirigir de vuelta al inicio
    window.location.href = '/';
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">Registrar Tarea</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h2 className="font-medium text-blue-900">{tarea.titulo}</h2>
          <p className="text-sm text-blue-700 mt-1">{tarea.descripcion}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
            <span>Fecha programada: {tarea.fecha}</span>
            <span className="px-2 py-1 bg-blue-100 rounded-full">{tarea.tipo}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado de la tarea
          </label>
          <select
            value={registro.estado}
            onChange={(e) => setRegistro({ ...registro, estado: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="completada">Completada</option>
            <option value="parcial">Completada parcialmente</option>
            <option value="no_realizada">No realizada</option>
            <option value="reprogramada">Reprogramada</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de ejecución
            </label>
            <input
              type="date"
              value={registro.fecha}
              onChange={(e) => setRegistro({ ...registro, fecha: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora
            </label>
            <input
              type="time"
              value={registro.hora}
              onChange={(e) => setRegistro({ ...registro, hora: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            value={registro.observaciones}
            onChange={(e) => setRegistro({ ...registro, observaciones: e.target.value })}
            placeholder="Describe cómo se realizó la tarea, cualquier incidencia encontrada, etc."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
}