import i18nModule from 'i18next'
import { initReactI18next } from 'react-i18next'

type I18nApiT = {
  isInitialized: boolean
  language: string
  use(module: unknown): I18nApiT
  init(options: Record<string, unknown>): Promise<void>
  addResourceBundle(lng: string, ns: string, resources: unknown, deep?: boolean, overwrite?: boolean): I18nApiT
  emit(event: string, ...args: Array<unknown>): void
  changeLanguage(lng: string): Promise<void>
}

const i18n = i18nModule as unknown as I18nApiT

type DeepRecordT = { [key: string]: string | DeepRecordT }

const allModules = import.meta.glob<{ default: DeepRecordT }>(
  [
    '../../features/**/*.locales.*.json',
    '../../common/**/*.locales.*.json',
    '../../routes/**/*.locales.*.json',
    '../../setup/**/*.locales.*.json',
  ],
  { eager: true }
)

const resources: Record<string, Record<string, DeepRecordT>> = {}

for (const [path, module] of Object.entries(allModules)) {
  const lang = path.match(/\.locales\.(\w+)\.json$/)?.[1]
  if (!lang) continue

  const parts = path.replace(/^(\.\.\/)+/, '').split('/')
  parts.pop()
  const ns = parts.map(p => p.replace(/^_/, '')).join('.')

  if (!resources[lang]) resources[lang] = {}
  resources[lang][ns] = module.default as DeepRecordT
}

if (i18n.isInitialized) {
  for (const [lang, namespaces] of Object.entries(resources)) {
    for (const [ns, data] of Object.entries(namespaces)) {
      i18n.addResourceBundle(lang, ns, data, true, true)
    }
  }
  i18n.emit('languageChanged', i18n.language)
} else {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    nsSeparator: ':',
    interpolation: { escapeValue: false },
  })
}

if (import.meta.env.DEV) {
  window.setLang = (lng: string) => i18n.changeLanguage(lng)
}

if (import.meta.hot) {
  import.meta.hot.accept()

  let pendingI18nRefresh = false

  import.meta.hot.on('i18n:tsx-updated', () => {
    pendingI18nRefresh = true
  })

  import.meta.hot.on('vite:afterUpdate', () => {
    if (pendingI18nRefresh) {
      pendingI18nRefresh = false
      setTimeout(() => i18n.emit('languageChanged', i18n.language), 100)
    }
  })
}
