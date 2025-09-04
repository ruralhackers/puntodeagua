import type { FC } from 'react'
import { Link } from '@/components/ui/link'

export const Header: FC = () => (
  <header>
    <div className="flex h-14 items-center justify-between px-4">
      <Link to="/">Gestión Aguas</Link>
    </div>
  </header>
)
