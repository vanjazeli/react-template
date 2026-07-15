import { createRouter } from '@tanstack/react-router'

import { routeTree } from '@/setup/routeTree.gen'

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
})
