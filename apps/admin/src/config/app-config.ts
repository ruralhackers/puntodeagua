import packageJson from '../../package.json'

const currentYear = new Date().getFullYear()

export const APP_CONFIG = {
  name: 'Prompthero Admin',
  version: packageJson.version,
  copyright: `© ${currentYear}, Prompthero Admin.`,
  meta: {
    title: 'Prompthero Admin',
    description: 'Prompthero admin'
  }
}
