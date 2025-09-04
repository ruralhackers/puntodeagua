import Header from '../components/Header'
import TaskList from '../components/TaskList'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

export default function Home() {
  return (
    <>
      <Header />
      <div>
        <Button>Nuevo Registro</Button>

        <Button asChild>
          <Link to="/incidencia/nueva">Nueva Incidencia</Link>
        </Button>
      </div>
      <TaskList />
    </>
  )
}
