import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const MainContainer = ({ children }: ProviderPropsT) => {
  return <div className="mx-auto max-w-3xl px-4">{children}</div>
}
