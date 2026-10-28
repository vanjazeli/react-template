import { http, delay as mswDelay, type DefaultBodyType, type HttpResponseResolver, type PathParams } from 'msw'

import { BACKEND_URL } from '@/common/consts/endpoints.consts'

type HttpMethodT = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head'

type CreateMswHandlerOptionsT<DtoT extends DefaultBodyType, PayloadT extends DefaultBodyType, ParamsT extends PathParams> = {
  url: string
  method: HttpMethodT
  handler: HttpResponseResolver<ParamsT, PayloadT, DtoT>
  delay?: number
}

export const createMswHandler = <
  DtoT extends DefaultBodyType = DefaultBodyType,
  PayloadT extends DefaultBodyType = DefaultBodyType,
  ParamsT extends PathParams = PathParams,
>({
  url,
  method,
  handler,
  delay = 1000,
}: CreateMswHandlerOptionsT<DtoT, PayloadT, ParamsT>) => {
  const fullUrl = `${BACKEND_URL}/${url.replace(/^\//, '')}`

  const wrappedHandler: HttpResponseResolver<ParamsT, PayloadT, DtoT> = async input => {
    await mswDelay(delay)
    return handler(input)
  }

  return http[method]<ParamsT, PayloadT, DtoT>(fullUrl, wrappedHandler)
}
