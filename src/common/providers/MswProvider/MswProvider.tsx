import { useLayoutEffect, useState } from 'react'

import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const MswProvider = ({ children }: ProviderPropsT) => {
  const [isReady, setIsReady] = useState(false)

  useLayoutEffect(() => {
    const start = async () => {
      if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'true') {
        const { WORKER } = await import('@/common/providers/MswProvider/MswProvider.consts')

        await WORKER.start({
          onUnhandledRequest: 'bypass',
          quiet: true,
        })

        // eslint-disable-next-line no-console
        console.log('%c[MSW] Mocking enabled', 'color: #10b981; font-weight: bold')
      }
      setIsReady(true)
    }
    start()
  }, [])

  if (!isReady) return null

  return children
}
