import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';

import { ValidatedSourceUrl } from '@/sources/domain/types';
import { Collector, PublicSource } from '@/sources/domain/enums';
import { SourceCollectorsFactory } from '../source-collectors';
import {
  InvalidSourceUrlError,
  CollectorStrategyNotFoundError,
} from '@/sources/domain/errors';

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
    private readonly sourceCollectorsFactory: SourceCollectorsFactory,
  ) {}

  async validateOrThrow(url: string): Promise<ValidatedSourceUrl> {
    this.logger.debug(`Validating URL ${url}`);

    const normalizedUrl = this.buildUrl(url);
    const classification = this.classifyUrl(normalizedUrl);

    this.logger.debug(
      `Classified URL ${normalizedUrl.toString()} as ${classification.source} with collector ${classification.collector}`,
    );

    const collectorStrategy = this.sourceCollectorsFactory.getStrategy(
      classification.collector,
    );

    this.logger.debug(
      `Collector found for ${classification.source} with collector ${classification.collector}: ${collectorStrategy?.getCollectorType()}`,
    );

    if (!collectorStrategy) {
      throw new CollectorStrategyNotFoundError(classification.collector);
    }

    this.logger.debug(
      `Validating URL ${normalizedUrl.toString()} with collector ${collectorStrategy.getCollectorType()}`,
    );

    const isValid = await collectorStrategy.validate({
      url: normalizedUrl.toString(),
      ...classification,
    });

    if (!isValid) {
      throw new InvalidSourceUrlError(
        normalizedUrl.toString(),
        'Invalid source URL',
      );
    }

    return {
      url: this.serializeUrl(normalizedUrl),
      ...classification,
    };
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
        collector: Collector.API,
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
        collector: Collector.SCRAPER,
      };
    }

    const name = segments[0] ?? host.replace(/^www\./, '');

    return {
      name,
      source: PublicSource.WEBSITE,
      collector: Collector.RSS,
    };
  }

  private getPathSegments(pathname: string): string[] {
    return pathname
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
}
