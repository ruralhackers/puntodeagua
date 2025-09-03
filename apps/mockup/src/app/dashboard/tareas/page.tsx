import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function TareasPage() {
  // Datos de ejemplo
  const tareas = {
    pendientes: [
      { id: 1, titulo: "Análisis de calidad del agua", fecha: "2023-06-20", tipo: "análisis", prioridad: "alta" },
      { id: 2, titulo: "Revisión de contadores", fecha: "2023-06-22", tipo: "mantenimiento", prioridad: "media" },
    ],
    futuras: [
      { id: 3, titulo: "Limpieza de depósitos", fecha: "2023-07-01", tipo: "mantenimiento", prioridad: "alta" },
      { id: 4, titulo: "Lectura mensual de contadores", fecha: "2023-07-05", tipo: "lectura", prioridad: "media" },
    ],
    completadas: [
      { id: 5, titulo: "Análisis bacteriológico", fecha: "2023-06-15", tipo: "análisis", completada: "2023-06-15" },
      { id: 6, titulo: "Reparación de fuga menor", fecha: "2023-06-10", tipo: "reparación", completada: "2023-06-12" },
    ],
  };

  return (
    <div className="px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tareas</h1>
        <Button size="sm">Registrar</Button>
      </div>

      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="programadas">Programadas</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendientes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
              <CardDescription>
                Tareas que no se han completado a tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tareas.pendientes.map((tarea) => (
                  <div key={tarea.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{tarea.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Fecha: {tarea.fecha} | Tipo: {tarea.tipo}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/nuevo-registro?tipo=${tarea.tipo}&tarea=${tarea.id}`}>
                            Registrar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="programadas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Programadas</CardTitle>
              <CardDescription>
                Próximas tareas a realizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Julio 2023</h3>
                  <div className="space-y-3">
                    {tareas.futuras.map((tarea) => (
                      <div key={tarea.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{tarea.titulo}</div>
                            <div className="text-sm text-muted-foreground">
                              Fecha: {tarea.fecha} | Tipo: {tarea.tipo}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Editar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completadas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Completadas</CardTitle>
              <CardDescription>
                Historial de tareas finalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tareas.completadas.map((tarea) => (
                  <div key={tarea.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{tarea.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Fecha: {tarea.fecha} | Tipo: {tarea.tipo}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/registros?tarea=${tarea.id}`}>
                          Ver Registro
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}