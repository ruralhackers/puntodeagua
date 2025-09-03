import Header from "../components/Header"
import TaskList from "../components/TaskList";
import { Button } from '@/components/ui/button'

export default function Home() {
	return (
		<>
			<Header />
			<div>
				<Button>
					Nuevo Registro
				</Button>
				<Button>
					Nueva Incidencia
				</Button>
			</div>
			<TaskList />
		</>
	);
}
