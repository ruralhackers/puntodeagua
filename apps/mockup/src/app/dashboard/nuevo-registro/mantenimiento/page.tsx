'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NuevoMantenimientoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    estado: '',
    puntoAgua: '',
    fechaProgramada: '',
    fechaRealizada: '',
    horaInicio: '',
    horaFin: '',
    responsable: '',
    equipos: '',
    descripcion: '',
    actividadesRealizadas: '',
    repuestosUtilizados: '',
    observaciones: '',
    proximoMantenimiento: ''
  });

  const tiposMantenimiento = [
    'Preventivo',
    'Correctivo',
    'Predictivo',
    'Emergencia',
    'Inspección',
    'Limpieza',
    'Calibración',
    'Reparación'
  ];

  const estados = [
    { value: 'programado', label: 'Programado', color: 'text-blue-600' },
    { value: 'en-proceso', label: 'En Proceso', color: 'text-yellow-600' },
    { value: 'completado', label: 'Completado', color: 'text-green-600' },
    { value: 'cancelado', label: 'Cancelado', color: 'text-red-600' }
  ];

  const puntosAgua = [
    'Pozo Principal',
    'Tanque Elevado Norte',
    'Tanque Elevado Sur',
    'Red Distribución Centro',
    'Red Distribución Periferia',
    'Estación de Bombeo',
    'Sistema de Cloración',
    'Válvulas Principales'
  ];

  const equipos = [
    'Bomba sumergible',
    'Motor eléctrico',
    'Tablero de control',
    'Válvulas',
    'Medidores',
    'Sistema de cloración',
    'Tuberías',
    'Tanques',
    'Sensores',
    'Otro'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del mantenimiento:', formData);
    // Aquí iría la lógica para guardar el mantenimiento
    router.push('/dashboard/registros/mantenimiento');
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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Mantenimiento</h1>
          <p className="text-gray-600">Registra una actividad de mantenimiento</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Mantenimiento *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
                placeholder="Describe brevemente el mantenimiento"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Mantenimiento *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposMantenimiento.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona estado</option>
                  {estados.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Punto de Agua *
              </label>
              <select
                name="puntoAgua"
                value={formData.puntoAgua}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un punto</option>
                {puntosAgua.map((punto) => (
                  <option key={punto} value={punto}>{punto}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipos/Componentes *
              </label>
              <select
                name="equipos"
                value={formData.equipos}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable *
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
                required
                placeholder="Nombre del responsable"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fechas y horarios */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Horarios</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada *
              </label>
              <input
                type="date"
                name="fechaProgramada"
                value={formData.fechaProgramada}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Realizada
              </label>
              <input
                type="date"
                name="fechaRealizada"
                value={formData.fechaRealizada}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del mantenimiento *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe las actividades de mantenimiento a realizar o realizadas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Actividades realizadas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades Realizadas</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actividades realizadas
              </label>
              <textarea
                name="actividadesRealizadas"
                value={formData.actividadesRealizadas}
                onChange={handleInputChange}
                rows={3}
                placeholder="Detalla las actividades específicas que se realizaron"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repuestos utilizados
              </label>
              <textarea
                name="repuestosUtilizados"
                value={formData.repuestosUtilizados}
                onChange={handleInputChange}
                rows={2}
                placeholder="Lista los repuestos o materiales utilizados"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Seguimiento */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguimiento</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próximo mantenimiento
              </label>
              <input
                type="date"
                name="proximoMantenimiento"
                value={formData.proximoMantenimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={3}
                placeholder="Observaciones adicionales, recomendaciones, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar Mantenimiento
          </button>
        </div>
      </form>
    </div>
  );
}