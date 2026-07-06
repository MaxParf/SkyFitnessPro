type DeduplicateInFlightRequestParams<TResponse> = {
  key: string
  requests: Map<string, Promise<TResponse>>
  request: () => Promise<TResponse>
  signal?: AbortSignal
}

type AbortableRequestParams<TResponse> = {
  key: string
  request: Promise<TResponse>
  requests: Map<string, Promise<TResponse>>
  signal?: AbortSignal
}

const requestSubscribers = new WeakMap<Promise<unknown>, number>()

export function deduplicateInFlightRequest<TResponse>({
  key,
  request,
  requests,
  signal,
}: DeduplicateInFlightRequestParams<TResponse>): Promise<TResponse> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError())
  }

  const pendingRequest = requests.get(key)

  if (pendingRequest) {
    return withAbortSignal({
      key,
      request: pendingRequest,
      requests,
      signal,
    })
  }

  const nextRequest = request().finally(() => {
    requests.delete(key)
  })

  requests.set(key, nextRequest)

  return withAbortSignal({
    key,
    request: nextRequest,
    requests,
    signal,
  })
}

function withAbortSignal<TResponse>({
  key,
  request,
  requests,
  signal,
}: AbortableRequestParams<TResponse>): Promise<TResponse> {
  if (!signal) {
    return request
  }

  addRequestSubscriber(request)

  return new Promise<TResponse>((resolve, reject) => {
    let isFinished = false

    const finish = (): void => {
      if (isFinished) {
        return
      }

      isFinished = true
      removeRequestSubscriber(request)
      signal.removeEventListener('abort', handleAbort)
    }

    const handleAbort = (): void => {
      finish()
      queueMicrotask(() => {
        if (requests.get(key) === request && getRequestSubscribersCount(request) === 0) {
          requests.delete(key)
        }
      })
      reject(createAbortError())
    }

    signal.addEventListener('abort', handleAbort, { once: true })

    request.then(
      (response) => {
        finish()
        resolve(response)
      },
      (error: unknown) => {
        finish()
        reject(error)
      },
    )
  })
}

function addRequestSubscriber(request: Promise<unknown>): void {
  requestSubscribers.set(request, getRequestSubscribersCount(request) + 1)
}

function removeRequestSubscriber(request: Promise<unknown>): void {
  const nextCount = Math.max(0, getRequestSubscribersCount(request) - 1)

  if (nextCount === 0) {
    requestSubscribers.delete(request)
    return
  }

  requestSubscribers.set(request, nextCount)
}

function getRequestSubscribersCount(request: Promise<unknown>): number {
  return requestSubscribers.get(request) ?? 0
}

function createAbortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError')
}
