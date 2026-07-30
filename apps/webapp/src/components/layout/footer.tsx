import { cn } from '@/lib/utils'

interface FooterProps {
  /**
   * Reserves clearance below the footer content on mobile so the fixed BottomNav
   * (~57px) doesn't cover the last row of links. Only needed when BottomNav actually
   * renders for the current user (see the layout, which mirrors BottomNav's own gating).
   */
  reserveBottomNavSpace: boolean
}

export function Footer({ reserveBottomNavSpace }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 md:pb-4',
        reserveBottomNavSpace && 'pb-24'
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row justify-center sm:justify-between items-center text-sm text-muted-foreground max-w-7xl mx-auto px-6 sm:px-8 md:px-0">
        <p className="text-center">Punto de Agua &copy; {currentYear}</p>
        <div className="flex flex-wrap justify-center gap-4 items-center">
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
