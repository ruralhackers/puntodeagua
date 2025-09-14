import packageJson from '../../package.json'

const currentYear = new Date().getFullYear()

export const APP_CONFIG = {
  name: 'Punto de Agua',
  version: packageJson.version,
  copyright: `© ${currentYear}, Punto de Agua`,
  meta: {
    title: 'Punto de Agua',
    description: 'Punto de Agua'
  }
}
