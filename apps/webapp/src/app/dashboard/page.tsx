import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Header } from '@/src/components/header'
import TaskList from '@/src/components/TaskList'

export default function Home() {
  return (
    <>
      <Header />
      <div>
        <Button asChild>
          <Link to="/dashboard/nuevo-registro">Nuevo registro</Link>
        </Button>
      </div>
      <TaskList />
    </>
  )
}
