import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'

export function IdCopy({ id }: { id: string }) {
  const shortHash = `${id.slice(0, 4)}...${id.slice(-4)}`

  return (
    <span className="font-mono flex-shrink-0 flex items-center gap-1">
      {shortHash}
      <CopyIcon
        className="text-muted-foreground h-4 w-4 hover:cursor-pointer hover:text-foreground"
        onClick={() => {
          navigator.clipboard.writeText(id)
          toast.success(`ID ${id} copiado al portapapeles`)
        }}
      />
    </span>
  )
}
