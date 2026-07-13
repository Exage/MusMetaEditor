export function parseFileNameFromContentDisposition(
  contentDisposition: string | null
): string | undefined {
  if (!contentDisposition) {
    return undefined
  }

  const encodedFileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)?.[1]

  if (encodedFileName) {
    return decodeURIComponent(encodedFileName)
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/)?.[1]

  return match || undefined
}
