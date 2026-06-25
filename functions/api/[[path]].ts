export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const apiUrl = context.env.API_URL || 'https://api.inorma.com.br'
  const url = new URL(context.request.url)
  const target = `${apiUrl}${url.pathname}${url.search}`

  const init: RequestInit = {
    method: context.request.method,
    headers: context.request.headers,
  }

  if (!['GET', 'HEAD'].includes(context.request.method)) {
    init.body = context.request.body
  }

  return fetch(target, init)
}

interface Env {
  API_URL: string
}

interface EventContext<Env, P, Data> {
  request: Request
  env: Env
  params: P
  data: Data
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>
}
