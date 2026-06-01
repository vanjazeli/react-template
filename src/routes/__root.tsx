import { MainLayout } from '@/common/components/templates/MainLayout/MainLayout'
import { createRootRoute, Outlet } from '@tanstack/react-router'

import { AppProvider } from '@common/providers/AppProvider/AppProvider'

export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AppProvider>
  ),
})
