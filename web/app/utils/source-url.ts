/**
 * Utility functions for building source URLs
 */

/**
 * Checks if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Builds a full URL from input string
 * If input is @channel_name, builds appropriate URL based on source type
 * If input is already a full URL, returns it as-is
 */
export function buildSourceUrl(input: string, sourceType: 'telegram' | 'instagram'): string {
  const trimmed = input.trim()

  // If it's already a valid URL, return it
  if (isValidUrl(trimmed)) {
    return trimmed
  }

  // Remove @ if present
  const handle = trimmed.replace(/^@+/, '')

  // Build URL based on source type
  if (sourceType === 'telegram') {
    return `https://t.me/${handle}`
  } else if (sourceType === 'instagram') {
    return `https://instagram.com/${handle}`
  }

  throw new Error(`Unsupported source type: ${sourceType}`)
}

/**
 * Extracts handle/username from URL or @handle format
 */
export function extractHandle(input: string, sourceType: 'telegram' | 'instagram'): string {
  const trimmed = input.trim()

  // If it's a URL, extract the handle from path
  if (isValidUrl(trimmed)) {
    try {
      const url = new URL(trimmed)
      const pathSegments = url.pathname.split('/').filter((s) => s.length > 0)
      if (pathSegments.length > 0) {
        return pathSegments[0]
      }
    } catch {
      // Fall through to handle extraction
    }
  }

  // Remove @ if present
  return trimmed.replace(/^@+/, '')
}

