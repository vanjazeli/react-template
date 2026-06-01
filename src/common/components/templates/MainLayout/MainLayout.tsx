import { Footer } from '@/common/components/organisms/Footer/Footer'
import { Header } from '@/common/components/organisms/Header/Header'
import { MainContainer } from '@/common/components/templates/MainContainer/MainContainer'
import type { ProviderPropsT } from '@/common/types/props/ProviderProps.types'

export const MainLayout = ({ children }: ProviderPropsT) => {
  return (
    <div>
      <MainContainer>
        <Header />
        <main>{children}</main>
        <Footer />
      </MainContainer>
    </div>
  )
}
