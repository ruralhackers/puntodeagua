import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Política de Privacidad</h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Información que recopilamos</CardTitle>
            <CardDescription>
              Recopilamos información necesaria para proporcionar nuestros servicios de gestión de
              agua
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Información personal:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Nombre completo y datos de contacto</li>
                <li>Dirección y ubicación de la vivienda</li>
                <li>Información de la comunidad de agua</li>
                <li>Datos de facturación y consumo de agua</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Información técnica:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Dirección IP y datos de navegación</li>
                <li>Información del dispositivo y navegador</li>
                <li>Registros de uso de la aplicación</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Cómo utilizamos su información</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Proporcionar servicios de gestión y monitoreo de agua</li>
              <li>Generar facturas y reportes de consumo</li>
              <li>Comunicar incidencias y mantenimientos</li>
              <li>Mejorar nuestros servicios y funcionalidades</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Compartir información</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              No vendemos, alquilamos ni compartimos su información personal con terceros, excepto
              en los siguientes casos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Con su consentimiento explícito</li>
              <li>Para cumplir con la ley o procesos legales</li>
              <li>
                Con proveedores de servicios que nos ayudan a operar (bajo acuerdos de
                confidencialidad)
              </li>
              <li>En caso de emergencia relacionada con la seguridad del agua</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Seguridad de los datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger
              su información personal contra acceso no autorizado, alteración, divulgación o
              destrucción. Esto incluye encriptación, controles de acceso y auditorías regulares de
              seguridad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Sus derechos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Bajo el RGPD y la legislación española, usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar datos inexactos o incompletos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Limitar el procesamiento de sus datos</li>
              <li>Portabilidad de datos</li>
              <li>Oponerse al procesamiento</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Retención de datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conservamos su información personal durante el tiempo necesario para cumplir con los
              propósitos descritos en esta política, cumplir con nuestras obligaciones legales,
              resolver disputas y hacer cumplir nuestros acuerdos. Los datos de consumo de agua se
              conservan según los requisitos regulatorios aplicables.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Cookies y tecnologías similares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el
              uso de nuestros servicios y personalizar el contenido. Puede controlar el uso de
              cookies a través de la configuración de su navegador.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Cambios a esta política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre
              cambios significativos publicando la nueva política en nuestro sitio web y
              actualizando la fecha de "última actualización". Le recomendamos revisar esta política
              periódicamente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Código abierto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Punto de Agua es un proyecto de código abierto. El código fuente está disponible
              públicamente en GitHub bajo la licencia MIT, lo que garantiza transparencia en el
              procesamiento de datos y permite la auditoría independiente de nuestras prácticas de
              privacidad.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Repositorio:</strong>{' '}
                <a
                  href="https://github.com/ruralhackers/puntodeagua"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/ruralhackers/puntodeagua
                </a>
              </p>
              <p>
                <strong>Licencia:</strong> MIT License
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos,
              puede contactarnos:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Email:</strong> privacidad@puntodeagua.es
              </p>
              <p>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/ruralhackers/puntodeagua"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/ruralhackers/puntodeagua
                </a>
              </p>
              <p>
                <strong>Dirección:</strong> Noroeste de España
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
