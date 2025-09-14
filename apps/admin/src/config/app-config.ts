import packageJson from '../../package.json'

const currentYear = new Date().getFullYear()

export const APP_CONFIG = {
  name: 'Punto de Agua Admin',
  version: packageJson.version,
  copyright: `© ${currentYear}, Punto de Agua Admin.`,
  meta: {
    title: 'Punto de Agua Admin',
    description: 'Punto de Agua admin'
  }
}
