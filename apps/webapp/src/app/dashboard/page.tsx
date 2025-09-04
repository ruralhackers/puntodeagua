import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import Header from '@/src/components/Header'
import TaskList from '@/src/components/TaskList'

export default function Home() {
  return (
    <>
      <Header />
      <div>
        <Button>Nuevo Registro</Button>

        <Button asChild>
          <Link to="/dashboard/incidencia/nueva">Nueva Incidencia</Link>
        </Button>
      </div>
      <TaskList />
    </>
  )
}
