export async function throwResponseError(response: Response): Promise<never> {
  const contentType = response.headers.get('Content-Type')
  let errorMessage: string | undefined

  if (contentType?.includes('application/json')) {
    try {
      const payload = await response.json()

      if (
        payload &&
        typeof payload === 'object' &&
        'error' in payload &&
        typeof payload.error === 'string'
      ) {
        errorMessage = payload.error
      }
    } catch {
      // JSON parse failed — body consumed, generic message below
    }
  }

  throw new Error(errorMessage ?? `Request failed with status ${response.status}`)
}
