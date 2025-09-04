'use client'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { useAuth } from '../features/auth/context/auth-context'

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-3">
        <Link
          to="/"
          className="text-lg font-bold flex items-center gap-2 group transition-colors no-underline hover:no-underline"
          aria-label="Ir al inicio"
        >
          {/* Icono gota (igual mockup) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 group-hover:scale-110 transition-transform duration-300"
            aria-hidden="true"
          >
            <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
            <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
          </svg>
          Gestión de aguas de Anceu
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/dashboard/usuarios"
                className="text-xs font-bold no-underline hover:no-underline"
              >
                Usuarios
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                to="/dashboard/puntos-agua"
                className="text-xs font-bold no-underline hover:no-underline"
              >
                Puntos de Agua
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild onClick={() => logout()}>
              <Link to="#" className="text-xs font-bold no-underline hover:no-underline">
                Cerrar Sesion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
