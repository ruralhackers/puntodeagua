import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

export default function Home() {
  return (
    <Button asChild>
      <Link type="invisible" to="/dashboard/">
        Ir a dashboard
      </Link>
    </Button>
  )
}
