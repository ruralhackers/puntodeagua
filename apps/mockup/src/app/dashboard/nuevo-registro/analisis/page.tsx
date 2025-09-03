'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NuevoAnalisisPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tipo: '',
    puntoAgua: '',
    fecha: '',
    hora: '',
    responsable: '',
    ph: '',
    cloro: '',
    turbidez: '',
    presion: '',
    temperatura: '',
    observaciones: ''
  });

  const tiposAnalisis = [
    'Análisis Físico-Químico',
    'Análisis Microbiológico',
    'Control de Cloro',
    'Medición de pH',
    'Control de Presión'
  ];

  const puntosAgua = [
    'Pozo Principal',
    'Tanque Elevado Norte',
    'Tanque Elevado Sur',
    'Red Distribución Centro',
    'Red Distribución Periferia'
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
    console.log('Datos del análisis:', formData);
    // Aquí iría la lógica para guardar el análisis
    router.push('/dashboard/registros/analisis');
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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Análisis</h1>
          <p className="text-gray-600">Registra un nuevo análisis de calidad del agua</p>
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
                Tipo de Análisis *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Selecciona un tipo</option>
                {tiposAnalisis.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Selecciona un punto</option>
                {puntosAgua.map((punto) => (
                  <option key={punto} value={punto}>{punto}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Parámetros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                pH
              </label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="14"
                placeholder="7.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloro (mg/L)
              </label>
              <input
                type="number"
                name="cloro"
                value={formData.cloro}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turbidez (NTU)
              </label>
              <input
                type="number"
                name="turbidez"
                value={formData.turbidez}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                placeholder="1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presión (bar)
              </label>
              <input
                type="number"
                name="presion"
                value={formData.presion}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                placeholder="2.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <input
                type="number"
                name="temperatura"
                value={formData.temperatura}
                onChange={handleInputChange}
                step="0.1"
                placeholder="20.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones adicionales
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe cualquier observación relevante..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Guardar Análisis
          </button>
        </div>
      </form>
    </div>
  );
}