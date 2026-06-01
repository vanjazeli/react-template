import type { HttpHandler } from 'msw'
import { setupWorker } from 'msw/browser'

const moduleMap = import.meta.glob<{ handler: HttpHandler | Array<HttpHandler> }>('/src/**/*.handler.ts', { eager: true })

const mswHandlers: Array<HttpHandler> = Object.values(moduleMap).flatMap(mod => (Array.isArray(mod.handler) ? mod.handler : [mod.handler]))

export const WORKER = setupWorker(...mswHandlers)
