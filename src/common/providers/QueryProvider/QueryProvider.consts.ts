import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const QUERY_CLIENT = new QueryClient({
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressErrorToast) return
      toast.error('Something went wrong.')
    },
  }),
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})
