export {}

declare global {
  interface Window {
    setLang: (lng: string) => void
  }
}
