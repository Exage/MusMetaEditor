export function parseFileNameFromContentDisposition(
  contentDisposition: string | null
): string | undefined {
  if (!contentDisposition) {
    return undefined
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/)?.[1]

  return match || undefined
}
