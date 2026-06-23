export function createJsonResponse(body: object | null, status = 200): Response {
  const responseText = body ? JSON.stringify(body) : ''

  return {
    json: () => Promise.resolve(body),
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(responseText),
  } as Response
}

export function mockFetchSuccess(body: object | null): jest.MockedFunction<typeof fetch> {
  const fetchMock = jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockResolvedValue(createJsonResponse(body))

  Object.assign(globalThis, { fetch: fetchMock })

  return fetchMock
}

export function mockFetchResponse(
  body: object | null,
  status = 200,
): jest.MockedFunction<typeof fetch> {
  const fetchMock = jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockResolvedValue(createJsonResponse(body, status))

  Object.assign(globalThis, { fetch: fetchMock })

  return fetchMock
}

export function mockFetchError(error: Error): jest.MockedFunction<typeof fetch> {
  const fetchMock = jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockRejectedValue(error)

  Object.assign(globalThis, { fetch: fetchMock })

  return fetchMock
}

export function mockFetchPending(): jest.MockedFunction<typeof fetch> {
  const fetchMock = jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockReturnValue(new Promise<Response>(() => undefined))

  Object.assign(globalThis, { fetch: fetchMock })

  return fetchMock
}
