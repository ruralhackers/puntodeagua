import AnalysisItemCard from '../../analysis/delivery/AnalysisItemCard'
import MaintenanceItemCard from '../../maintenance/delivery/MaintenanceItemCard'

export default function ShareDataPage() {
  return (
    <div>
      <p>Resumen de analíticas, incidencias y mantenimiento</p>
      <p>Ordenado por fecha, de más reciente a más antigua</p>
      <div>
        {/* marcar aquellos que necesiten un documento */}
        <div>
          <p>Analítica</p>
          {/* {iterar por cada una} */}
          {/* <AnalysisItemCard /> */}
        </div>
        <div>
          <p>Mantenimiento</p>
          {/* <MaintenanceItemCard /> */}
        </div>
        <div>
          <p>Incidencias</p>
        </div>
      </div>
    </div>
  )
}
