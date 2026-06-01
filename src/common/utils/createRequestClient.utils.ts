import axios from 'axios'

import { BACKEND_URL } from '@common/consts/endpoints.consts'

export const createRequestClient = () => {
  const requestClient = axios.create({
    baseURL: BACKEND_URL,
  })

  return { requestClient }
}
