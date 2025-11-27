export const S3_CLIENT = Symbol('S3_CLIENT');
export const S3_BUCKET = Symbol('S3_BUCKET');

export const S3_PATHS = {
  TELEGRAM: 'telegram',
  INSTAGRAM: 'instagram',
} as const;

/**
 * Generate S3 key for media file.
 *
 * Format: {sourceType}/{sourceId}/{postExternalId}/{index}.{extension}
 * Example: telegram/src_abc123/msg_12345/1.jpg
 */
export function generateMediaKey(
  sourceType: 'telegram' | 'instagram',
  sourceId: string,
  postExternalId: string,
  index: number,
  extension: string,
): string {
  return `${sourceType}/${sourceId}/${postExternalId}/${index}.${extension}`;
}

/**
 * Get file extension from content type.
 */
export function getExtensionFromContentType(contentType: string): string {
  const mapping: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/ogg': 'ogg',
  };

  return mapping[contentType] || 'bin';
}
