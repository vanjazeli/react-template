import { ThemeProvider } from 'next-themes'

import { MswProvider } from '@/common/providers/MswProvider/MswProvider'
import { QueryProvider } from '@/common/providers/QueryProvider/QueryProvider'
import { ToastProvider } from '@/common/providers/ToastProvider/ToastProvider'
import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const AppProvider = ({ children }: ProviderPropsT) => {
  return (
    <MswProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </MswProvider>
  )
}
