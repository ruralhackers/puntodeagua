import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex justify-center sm:justify-between items-center text-sm text-muted-foreground max-w-7xl mx-auto px-6 sm:px-8 md:px-0">
        <p className="text-center">Punto de Agua &copy; {currentYear}</p>
        <div className="hidden sm:flex gap-4 items-center">
          <a href="/privacy" className="hover:text-foreground transition-colors">
            Política de privacidad
          </a>
          <a href="/terms" className="hover:text-foreground transition-colors">
            Términos de servicio
          </a>
        </div>
      </div>
    </footer>
  )
}
