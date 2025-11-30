import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Transforms path segments from wildcard route into a single path string.
 *
 * Handles multiple input formats:
 * - Array: ["instagram", "source-id", "post-id", "1.jpg"]
 * - Comma-separated string: "instagram,source-id,post-id,1.jpg" (NestJS 11 behavior)
 *
 * Output: "instagram/source-id/post-id/1.jpg"
 */
@Injectable()
export class ParseMediaPathPipe
  implements PipeTransform<string | string[], string>
{
  transform(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.join('/');
    }

    // Handle NestJS 11 behavior where array is converted to comma-separated string
    // Only replace commas that are path separators, not commas in filenames
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').join('/');
    }

    return value;
  }
}
