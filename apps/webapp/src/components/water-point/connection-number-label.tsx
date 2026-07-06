interface ConnectionNumberLabelProps {
  connectionNumber?: string | null
  className?: string
}

export function ConnectionNumberLabel({
  connectionNumber,
  className = 'text-xs text-muted-foreground'
}: ConnectionNumberLabelProps) {
  if (!connectionNumber) return null

  return (
    <p className={className}>
      Nº enganche: <span className="font-medium">{connectionNumber}</span>
    </p>
  )
}
