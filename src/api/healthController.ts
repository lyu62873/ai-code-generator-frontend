// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** GET /health/ (no backend comment) */
export async function healthCheck(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/health/', {
    method: 'GET',
    ...(options || {}),
  })
}
