'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NuevoContadorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    puntoAgua: '',
    numeroContador: '',
    fecha: '',
    hora: '',
    lecturaAnterior: '',
    lecturaActual: '',
    consumo: '',
    estadoContador: '',
    tipoLectura: '',
    responsable: '',
    observaciones: '',
    anomalias: '',
    fotoLectura: ''
  });

  const puntosAgua = [
    'Pozo Principal',
    'Tanque Elevado Norte',
    'Tanque Elevado Sur',
    'Red Distribución Centro',
    'Red Distribución Periferia',
    'Estación de Bombeo',
    'Sector Residencial A',
    'Sector Residencial B',
    'Sector Comercial',
    'Sector Industrial'
  ];

  const estadosContador = [
    { value: 'funcionando', label: 'Funcionando', color: 'text-green-600' },
    { value: 'con-fallas', label: 'Con Fallas', color: 'text-yellow-600' },
    { value: 'dañado', label: 'Dañado', color: 'text-red-600' },
    { value: 'bloqueado', label: 'Bloqueado', color: 'text-gray-600' }
  ];

  const tiposLectura = [
    'Rutinaria',
    'Especial',
    'Verificación',
    'Mantenimiento',
    'Reclamo'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Calcular consumo automáticamente
      if (name === 'lecturaActual' || name === 'lecturaAnterior') {
        const actual = parseFloat(name === 'lecturaActual' ? value : newData.lecturaActual) || 0;
        const anterior = parseFloat(name === 'lecturaAnterior' ? value : newData.lecturaAnterior) || 0;
        newData.consumo = actual >= anterior ? (actual - anterior).toString() : '';
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del contador:', formData);
    // Aquí iría la lógica para guardar la lectura del contador
    router.push('/dashboard/registros');
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
          <h1 className="text-2xl font-bold text-gray-900">Chequeo de Contador</h1>
          <p className="text-gray-600">Registra la lectura del contador de agua</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del contador */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Contador</h3>
          
          <div className="grid grid-cols-1 gap-4">
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
                Número de Contador *
              </label>
              <input
                type="text"
                name="numeroContador"
                value={formData.numeroContador}
                onChange={handleInputChange}
                required
                placeholder="Ej: CTR-001, 123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Contador *
                </label>
                <select
                  name="estadoContador"
                  value={formData.estadoContador}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona estado</option>
                  {estadosContador.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Lectura *
                </label>
                <select
                  name="tipoLectura"
                  value={formData.tipoLectura}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona tipo</option>
                  {tiposLectura.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable de la Lectura *
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

        {/* Lecturas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecturas</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lectura Anterior (m³) *
              </label>
              <input
                type="number"
                name="lecturaAnterior"
                value={formData.lecturaAnterior}
                onChange={handleInputChange}
                required
                step="0.001"
                placeholder="0.000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lectura Actual (m³) *
              </label>
              <input
                type="number"
                name="lecturaActual"
                value={formData.lecturaActual}
                onChange={handleInputChange}
                required
                step="0.001"
                placeholder="0.000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consumo Calculado (m³)
              </label>
              <input
                type="number"
                name="consumo"
                value={formData.consumo}
                readOnly
                step="0.001"
                placeholder="Se calcula automáticamente"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se calcula automáticamente: Lectura Actual - Lectura Anterior
              </p>
            </div>
          </div>
        </div>

        {/* Observaciones y anomalías */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anomalías detectadas
              </label>
              <textarea
                name="anomalias"
                value={formData.anomalias}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe cualquier anomalía observada en el contador o la lectura"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones generales
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={3}
                placeholder="Observaciones adicionales sobre el estado del contador, acceso, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentación</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de la Lectura
            </label>
            <input
              type="file"
              name="fotoLectura"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional: Adjunta una foto de la lectura del contador para verificación
            </p>
          </div>
        </div>

        {/* Resumen */}
        {formData.lecturaActual && formData.lecturaAnterior && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Resumen de la Lectura</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Lectura Anterior:</span>
                <span className="ml-2">{formData.lecturaAnterior} m³</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Lectura Actual:</span>
                <span className="ml-2">{formData.lecturaActual} m³</span>
              </div>
              <div className="col-span-2">
                <span className="text-blue-700 font-medium">Consumo del Período:</span>
                <span className="ml-2 text-lg font-bold">{formData.consumo} m³</span>
              </div>
            </div>
          </div>
        )}

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
            Guardar Lectura
          </button>
        </div>
      </form>
    </div>
  );
}