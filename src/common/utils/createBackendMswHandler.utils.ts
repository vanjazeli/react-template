import { http, delay as mswDelay, type DefaultBodyType, type HttpResponseResolver } from 'msw'

import { BACKEND_URL } from '@/common/consts/endpoints.consts'

type HttpMethodT = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type CreateBackendMswHandlerOptionsT<DtoT extends DefaultBodyType> = {
  url: string
  method: HttpMethodT
  handler: HttpResponseResolver<never, never, DtoT>
  delay?: number
}

export const createBackendMswHandler = <DtoT extends DefaultBodyType = DefaultBodyType>({
  url,
  method,
  handler,
  delay = 1000,
}: CreateBackendMswHandlerOptionsT<DtoT>) => {
  const fullUrl = `${BACKEND_URL}/${url.replace(/^\//, '')}`

  const wrappedHandler: HttpResponseResolver<never, never, DtoT> = async input => {
    await mswDelay(delay)
    return handler(input)
  }

  return http[method](fullUrl, wrappedHandler)
}
