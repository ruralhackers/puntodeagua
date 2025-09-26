import type { Metadata } from 'next/types'

export const APP_METADATA: Metadata = {
  title: 'Punto de Agua - Gestión Inteligente del Agua en Comunidades del Noroeste de España',
  description:
    'Transformamos la gestión del agua en las comunidades del noroeste de España. Tecnología avanzada para un recurso vital, garantizando eficiencia, sostenibilidad y transparencia en cada gota.',
  keywords: [
    'gestión del agua',
    'comunidades de agua',
    'noroeste de España',
    'Galicia',
    'Asturias',
    'Cantabria',
    'León',
    'tecnología del agua',
    'monitoreo del agua',
    'eficiencia hídrica',
    'aldeas gallegas',
    'Anceu',
    'Ponte Caldelas',
    'digitalización del agua',
    'gestión comunitaria del agua'
  ],
  authors: [{ name: 'Punto de Agua' }],
  creator: 'Punto de Agua',
  publisher: 'Punto de Agua',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://puntodeagua.es',
    siteName: 'Punto de Agua',
    title: 'Punto de Agua - Gestión Inteligente del Agua',
    description:
      'Transformamos la gestión del agua en las comunidades del noroeste de España con tecnología avanzada.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Punto de Agua - Gestión Inteligente del Agua'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Punto de Agua - Gestión Inteligente del Agua',
    description: 'Transformamos la gestión del agua en las comunidades del noroeste de España',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://puntodeagua.es'
  },
  metadataBase: new URL('https://puntodeagua.es'),
  verification: {
    google: 'tu-google-verification-code'
  },
  category: 'Tecnología del Agua',
  classification: 'Software de Gestión Hídrica'
}
