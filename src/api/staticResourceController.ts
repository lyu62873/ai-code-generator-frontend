// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** GET /static/${param0}/** (no backend comment) */
export async function serveStaticResource(
  // Param type for non-body params
  params: API.serveStaticResourceParams,
  options?: { [key: string]: any }
) {
  const { deployKey: param0, ...queryParams } = params
  return request<string>(`/static/${param0}/**`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
