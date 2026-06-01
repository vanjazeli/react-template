import { QueryClientProvider } from '@tanstack/react-query'

import { QUERY_CLIENT } from '@common/providers/QueryProvider/QueryProvider.consts'
import type { ProviderPropsT } from '@common/types/props/ProviderProps.types'

export const QueryProvider = ({ children }: ProviderPropsT) => {
  return <QueryClientProvider client={QUERY_CLIENT}>{children}</QueryClientProvider>
}
