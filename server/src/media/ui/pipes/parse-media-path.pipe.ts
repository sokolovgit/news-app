import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * Transforms path segments array from wildcard route into a single path string.
 *
 * Input:  ["instagram", "source-id", "post-id", "1.jpg"]
 * Output: "instagram/source-id/post-id/1.jpg"
 */
@Injectable()
export class ParseMediaPathPipe
  implements PipeTransform<string | string[], string>
{
  transform(value: string | string[]): string {
    const pathString = Array.isArray(value) ? value.join('/') : value;
    return pathString;
  }
}
