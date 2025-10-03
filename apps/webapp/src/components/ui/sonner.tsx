'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        duration: 6000, // Longer duration for older users to read
        style: {
          fontSize: '16px', // Larger font size
          padding: '16px 20px', // More padding
          minHeight: '60px', // Minimum height for better visibility
          lineHeight: '1.5' // Better line spacing for readability
        }
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
