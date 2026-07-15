import { useTheme } from 'next-themes'
import { Toaster, type ToasterProps } from 'sonner'

import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const ToastProvider = ({ children }: ProviderPropsT) => {
  const { theme = 'system' } = useTheme()

  return (
    <>
      {children}
      <Toaster
        closeButton
        position="bottom-right"
        theme={theme as ToasterProps['theme']}
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
            '--border-radius': 'var(--radius)',
          } as React.CSSProperties
        }
      />
    </>
  )
}
