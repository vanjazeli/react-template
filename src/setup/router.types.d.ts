import type { router } from '@setup/router'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
