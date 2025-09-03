import tasks from "../mock-data/requireAttentionTasks.json"
import { Badge } from "@/components/ui/badge"
import TaskItem from "./TaskItem"
import { Button } from "@/components/ui/button"

export default function TaskList() {
    return (
        <div>
            <div>
                <p>Requiere Atención</p>
            </div>
            <div>
                {tasks.map((elemento) => (
                    <TaskItem key={elemento.id} task={elemento}></TaskItem>
                ))}
            </div>
            <Button> Ver todos los elementos</Button>
        </div>
    )
}
