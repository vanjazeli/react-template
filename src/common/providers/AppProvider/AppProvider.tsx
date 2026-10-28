import { ThemeProvider } from 'next-themes'

import { MswProvider } from '@/common/providers/MswProvider/MswProvider'
import { QueryProvider } from '@/common/providers/QueryProvider/QueryProvider'
import { ToastProvider } from '@/common/providers/ToastProvider/ToastProvider'
import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const AppProvider = ({ children }: ProviderPropsT) => {
  return (
    <MswProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        // next-themes renders an inline script meant for SSR; in a client-only app it never runs.
        // A non-JS type stops React 19.3 from warning about it.
        scriptProps={{ type: 'application/json' }}
      >
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </MswProvider>
  )
}
