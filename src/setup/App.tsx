import { RouterProvider } from '@tanstack/react-router'

import { router } from '@setup/router'

export const App = () => {
  return <RouterProvider router={router} />
}
