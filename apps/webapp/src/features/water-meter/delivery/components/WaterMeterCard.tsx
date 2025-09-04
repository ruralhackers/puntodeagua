import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function WaterMeterCard({ meter }: any) {
  console.log('meter desde el card', meter)

  return (
    // pasarle al link el id real del contador
    <Link href="/contadores/id">
      <Card>
        <CardHeader>
          <CardTitle>Nombre y apellidos</CardTitle>
          <div className="text-red-600 text-sm">
            Consumo anómalo (aviso que solo aparece si se sobrepasa el consumo)
          </div>
        </CardHeader>
        <CardContent>
          <p>Último consumo • fecha última lectura</p>
        </CardContent>
        <CardFooter>
          <p>Zona</p>
        </CardFooter>
      </Card>
    </Link>
  )
}
