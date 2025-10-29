'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minChars?: number
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  minChars = 3,
  debounceMs = 300
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (localValue.length === 0 || localValue.length >= minChars) {
      const timeoutId = setTimeout(() => {
        onChange(localValue)
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    }
  }, [localValue, minChars, debounceMs, onChange])

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

