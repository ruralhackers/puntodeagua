import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Header() {
    return (
        <header>
            <div className="flex h-14 items-center justify-between px-4">
                <Link href="/">
                    Gestión Aguas
                </Link>
                <div>
                    <Button>
                        <Link href="/dashboard/usuarios">Usuarios</Link>
                    </Button>
                    <Button>
                        <Link href="/dashboard/puntos-agua">Puntos de Agua</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
