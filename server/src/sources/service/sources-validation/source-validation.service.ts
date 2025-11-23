import { Injectable } from '@nestjs/common';

import { CacheService } from '@/commons/cache';
import { LoggerService } from '@/logger';
import { SourcesService } from '../sources-service';

import { PublicSource } from '@/sources/domain/enums';
import { ValidatedSourceUrl } from '@/sources/domain/types';
import { InvalidSourceUrlError } from '@/sources/domain/errors';

const TELEGRAM_HOSTS = new Set([
  't.me',
  'telegram.me',
  'www.t.me',
  'www.telegram.me',
]);
const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
  'm.instagram.com',
]);

@Injectable()
export class SourcesValidationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly sourcesService: SourcesService,
  ) {}

  /**
   * Fast validation: checks cache, URL format, and DB
   * Does NOT perform fetch validation - that happens asynchronously
   */
  async validateUrl(url: string): Promise<ValidatedSourceUrl> {
    this.logger.debug(`Validating URL ${url}`);

    const normalizedUrl = this.buildUrl(url);
    const serializedUrl = this.serializeUrl(normalizedUrl);

    // Step 1: Check cache
    const cachedResult = await this.checkCache(serializedUrl);
    if (cachedResult) {
      this.logger.debug(
        `Found cached validation result for URL ${serializedUrl}`,
      );
      return cachedResult;
    }

    // Step 2: Validate URL format and classify
    const classification = this.classifyUrl(normalizedUrl);

    this.logger.debug(
      `Classified URL ${serializedUrl} as ${classification.source}`,
    );

    // Step 3: Check DB for existing source
    const existingSource =
      await this.sourcesService.getSourceByUrl(serializedUrl);
    if (existingSource) {
      this.logger.debug(`Found existing source in DB for URL ${serializedUrl}`);
      const result: ValidatedSourceUrl = {
        url: serializedUrl,
        ...classification,
      };
      // Cache the result
      await this.cacheValidationResult(serializedUrl, result);
      return result;
    }

    // All fast checks passed, return classification
    const result: ValidatedSourceUrl = {
      url: serializedUrl,
      ...classification,
    };

    // Cache the result
    await this.cacheValidationResult(serializedUrl, result, 300); // 5 minutes

    return result;
  }

  /**
   * Check cache for validation result
   */
  private async checkCache(url: string): Promise<ValidatedSourceUrl | null> {
    const cacheKey = this.getCacheKey(url);
    const cached =
      await this.cacheService.getJson<ValidatedSourceUrl>(cacheKey);
    return cached;
  }

  /**
   * Cache validation result
   */
  private async cacheValidationResult(
    url: string,
    result: ValidatedSourceUrl,
    ttlSeconds: number = 3600, // Default 1 hour
  ): Promise<void> {
    const cacheKey = this.getCacheKey(url);
    await this.cacheService.setJson(cacheKey, result, ttlSeconds);
  }

  /**
   * Get cache key for validation result
   */
  private getCacheKey(url: string): string {
    return `validation:${url}`;
  }

  normalizeUrl(url: string): string {
    this.logger.debug(`Normalizing URL ${url}`);
    const normalized = this.buildUrl(url);
    return this.serializeUrl(normalized);
  }

  private buildUrl(url: string): URL {
    const candidate = url.trim();

    try {
      return new URL(candidate);
    } catch {
      try {
        return new URL(`https://${candidate}`);
      } catch {
        throw new InvalidSourceUrlError(url, 'Unable to parse URL');
      }
    }
  }

  private serializeUrl(url: URL): string {
    url.hash = '';
    url.search = '';
    url.protocol = 'https:';
    url.hostname = url.hostname.toLowerCase();

    const pathname = url.pathname.replace(/\/+/g, '/');
    url.pathname =
      pathname.endsWith('/') && pathname !== '/'
        ? pathname.slice(0, -1)
        : pathname;

    const serialized = url.toString();

    if (serialized.endsWith('/') && url.pathname === '/') {
      return serialized.slice(0, -1);
    }

    return serialized;
  }

  private classifyUrl(url: URL): Omit<ValidatedSourceUrl, 'url'> {
    const host = url.hostname.toLowerCase();
    const segments = this.getPathSegments(url.pathname);

    if (TELEGRAM_HOSTS.has(host)) {
      if (segments.length === 0) {
        throw new InvalidSourceUrlError(
          url.toString(),
          'Telegram channel handle missing',
        );
      }

      const handle = segments[0];

      return {
        name: handle,
        source: PublicSource.TELEGRAM,
      };
    }

    if (INSTAGRAM_HOSTS.has(host)) {
      if (segments.length === 0) {
        throw new InvalidSourceUrlError(
          url.toString(),
          'Instagram username missing',
        );
      }

      const username = segments[0];

      return {
        name: username,
        source: PublicSource.INSTAGRAM,
      };
    }

    throw new InvalidSourceUrlError(
      url.toString(),
      'Unsupported source type. Only Telegram and Instagram are supported.',
    );
  }

  private getPathSegments(pathname: string): string[] {
    return pathname
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
}
