/**
 * Composable to transform S3 media paths to full API URLs
 * 
 * S3 paths look like: telegram/src_abc/12345/1.jpg
 * API URLs look like: http://localhost:3000/api/media/telegram/src_abc/12345/1.jpg
 */
export function useMediaUrl() {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl

  /**
   * Check if a URL is already a full URL (http/https)
   */
  function isFullUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://')
  }

  /**
   * Known S3 path prefixes for different media types
   */
  const s3PathPrefixes = [
    'telegram/',
    'instagram/',
    'covers/',
    'articles/',
    'uploads/',
  ]

  /**
   * Check if this is an S3 media path (starts with known prefix)
   */
  function isS3Path(url: string): boolean {
    return s3PathPrefixes.some(prefix => url.startsWith(prefix))
  }

  /**
   * Transform an S3 path to a full media API URL
   * 
   * @param path - S3 path like "telegram/src_abc/12345/1.jpg"
   * @returns Full API URL like "http://localhost:3000/api/media/telegram/src_abc/12345/1.jpg"
   */
  function getMediaUrl(path: string): string {
    if (!path) return ''
    
    // If it's already a full URL, return as-is
    if (isFullUrl(path)) {
      return path
    }
    
    // If it's an S3 path, transform to API URL
    if (isS3Path(path)) {
      return `${apiBaseUrl}/media/${path}`
    }
    
    // For other paths (legacy), try to use as-is or prepend media endpoint
    return `${apiBaseUrl}/media/${path}`
  }

  /**
   * Get the file extension from a path
   */
  function getExtension(path: string): string {
    const parts = path.split('.')
    const lastPart = parts[parts.length - 1]
    return parts.length > 1 && lastPart ? lastPart.toLowerCase() : ''
  }

  /**
   * Determine media type from path/extension
   */
  function getMediaType(path: string): 'image' | 'video' | 'audio' | 'unknown' {
    const ext = getExtension(path)
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a']
    
    if (imageExtensions.includes(ext)) return 'image'
    if (videoExtensions.includes(ext)) return 'video'
    if (audioExtensions.includes(ext)) return 'audio'
    
    return 'unknown'
  }

  return {
    getMediaUrl,
    getMediaType,
    getExtension,
    isFullUrl,
    isS3Path,
  }
}

