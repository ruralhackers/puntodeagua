import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Términos de Servicio</h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Aceptación de los términos</CardTitle>
            <CardDescription>
              Al acceder y utilizar Punto de Agua, usted acepta estar sujeto a estos Términos de
              Servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estos términos constituyen un acuerdo legal entre usted y Punto de Agua. Si no está de
              acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios. El
              uso continuado de la plataforma constituye su aceptación de cualquier modificación a
              estos términos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Descripción del servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Punto de Agua es una plataforma de código abierto para la gestión inteligente del agua
              en comunidades del noroeste de España. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Monitoreo y gestión de infraestructura de agua</li>
              <li>Registro y seguimiento de lecturas de medidores</li>
              <li>Reporte y gestión de incidencias</li>
              <li>Análisis de consumo y eficiencia hídrica</li>
              <li>Comunicación entre miembros de la comunidad</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Uso aceptable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Usted se compromete a:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Proporcionar información precisa y actualizada</li>
                  <li>Reportar incidencias de manera responsable</li>
                  <li>Respetar la privacidad de otros usuarios</li>
                  <li>Utilizar el servicio solo para fines legítimos</li>
                  <li>Mantener la confidencialidad de sus credenciales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Está prohibido:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Acceder a cuentas de otros usuarios</li>
                  <li>Interferir con el funcionamiento del sistema</li>
                  <li>Utilizar el servicio para actividades ilegales</li>
                  <li>Intentar vulnerar la seguridad de la plataforma</li>
                  <li>Distribuir malware o contenido malicioso</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Cuentas de usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Para utilizar nuestros servicios, debe crear una cuenta proporcionando información
              precisa. Usted es responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Mantener la confidencialidad de su contraseña</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              <li>Actualizar su información cuando sea necesario</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Propiedad intelectual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Punto de Agua es un proyecto de código abierto distribuido bajo la licencia MIT.
                Esto significa que:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>El código fuente está disponible públicamente en GitHub</li>
                <li>Puede usar, modificar y distribuir el software libremente</li>
                <li>Debe incluir el aviso de copyright original</li>
                <li>No se proporciona garantía sobre el software</li>
              </ul>
              <p className="text-sm text-muted-foreground">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Limitación de responsabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Punto de Agua se proporciona "tal como está" sin garantías de ningún tipo. En la
              medida máxima permitida por la ley:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>No garantizamos la disponibilidad continua del servicio</li>
              <li>No somos responsables por pérdidas de datos o interrupciones</li>
              <li>No garantizamos la precisión de los datos de terceros</li>
              <li>Nuestra responsabilidad se limita al costo del servicio</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacidad y protección de datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Su privacidad es importante para nosotros. El procesamiento de sus datos personales se
              rige por nuestra Política de Privacidad, que forma parte integral de estos términos.
              Al utilizar nuestros servicios, también acepta nuestra Política de Privacidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Modificaciones del servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del
              servicio en cualquier momento, con o sin previo aviso. Como proyecto de código
              abierto, las mejoras y modificaciones pueden ser propuestas y implementadas por la
              comunidad.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Terminación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Podemos terminar o suspender su acceso al servicio inmediatamente, sin previo aviso,
              por cualquier motivo, incluyendo la violación de estos términos. Usted puede terminar
              su cuenta en cualquier momento contactándonos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Ley aplicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta en
              los tribunales competentes de España. Si alguna disposición de estos términos es
              inválida, las disposiciones restantes permanecerán en pleno vigor.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Email:</strong> legal@puntodeagua.es
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
