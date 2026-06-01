import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import '@setup/i18n'
import '@setup/styles/index.css'

import { App } from '@setup/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
