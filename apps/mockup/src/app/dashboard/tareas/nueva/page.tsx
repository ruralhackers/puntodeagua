import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

export default function NuevaTareaPage() {
  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Nueva Tarea</h1>
        <p className="text-muted-foreground text-sm">
          Crea una nueva tarea o recordatorio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear Recordatorio</CardTitle>
          <CardDescription>
            Programa una nueva tarea o recordatorio para el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" placeholder="Título de la tarea" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Tarea</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analisis">Análisis de Agua</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="lectura">Lectura de Contadores</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha Programada</Label>
              <div className="border rounded-md p-4">
                <Calendar mode="single" className="mx-auto" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recurrencia">Recurrencia</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la recurrencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unica">Una vez</SelectItem>
                  <SelectItem value="diaria">Diaria</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quincenal">Quincenal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" placeholder="Descripción detallada de la tarea" />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/tareas">Cancelar</Link>
              </Button>
              <Button type="submit">Guardar Tarea</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}