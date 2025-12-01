/**
 * Utility functions for building source URLs
 */

export type SourceType = 'telegram' | 'instagram' | 'rss'

/**
 * Checks if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Common RSS feed path patterns
 */
const RSS_PATH_PATTERNS = [
  /\/feed\/?$/i,
  /\/rss\/?$/i,
  /\/atom\/?$/i,
  /\.rss$/i,
  /\.xml$/i,
  /\/rss\.xml$/i,
  /\/feed\.xml$/i,
  /\/atom\.xml$/i,
  /\/index\.xml$/i,
]

/**
 * Checks if a URL looks like an RSS feed
 */
export function isRssFeedUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false
  }

  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    return RSS_PATH_PATTERNS.some((pattern) => pattern.test(pathname))
  } catch {
    return false
  }
}

/**
 * Builds a full URL from input string
 * If input is @channel_name, builds appropriate URL based on source type
 * If input is already a full URL, returns it as-is
 * For RSS, the input must be a valid URL
 */
export function buildSourceUrl(input: string, sourceType: SourceType): string {
  const trimmed = input.trim()

  // If it's already a valid URL, return it
  if (isValidUrl(trimmed)) {
    return trimmed
  }

  // For RSS, we require a valid URL
  if (sourceType === 'rss') {
    // Try adding https:// if missing
    const withProtocol = `https://${trimmed}`
    if (isValidUrl(withProtocol)) {
      return withProtocol
    }
    throw new Error('RSS feeds require a valid URL')
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
 * For RSS, returns the full URL or hostname
 */
export function extractHandle(input: string, sourceType: SourceType): string {
  const trimmed = input.trim()

  // For RSS, return the URL or hostname
  if (sourceType === 'rss') {
    if (isValidUrl(trimmed)) {
      try {
        const url = new URL(trimmed)
        return url.hostname.replace(/^www\./, '')
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

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

