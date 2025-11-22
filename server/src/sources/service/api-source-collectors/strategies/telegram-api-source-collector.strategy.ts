import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { TelegramService } from '@/sources/service/telegram-serivce';

import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';
import { CollectorResult } from '../../sources-collector-service/types';

import { TelegramMessageToFetchedPostMapper } from '../mappers/telegram-message-to-fetched-post.mapper';
import { AvailableApiSourceCollectorStrategy } from '../interfaces';

@Injectable()
export class TelegramApiSourceCollectorStrategy
  implements AvailableApiSourceCollectorStrategy
{
  constructor(
    private readonly logger: LoggerService,
    private readonly telegramService: TelegramService,
  ) {}

  async collect(source: Source): Promise<CollectorResult> {
    this.logger.log(
      `Collecting last messages from source ${source.getUrl()} using Telegram API`,
    );

    const messages = await this.telegramService.fetchChannelMessages(
      source.getUrl(),
      5,
    );

    const posts = messages.map((message) =>
      TelegramMessageToFetchedPostMapper.toFetchedPost(message),
    );

    this.logger.log(
      `Collected ${posts.length} posts from Telegram for source ${source.getId()}`,
    );

    // Telegram doesn't provide cursor-based pagination, so we return empty cursor
    return {
      posts,
      nextCursor: undefined,
    };
  }

  async validate(url: string): Promise<boolean> {
    this.logger.log(`Validating source ${url} using Telegram API`);

    try {
      const message = await this.telegramService.fetchChannelMessages(url, 1);
      return message.length > 0;
    } catch (error) {
      this.logger.error(`Error validating source ${url}: ${error}`);
      return false;
    }
  }

  supports(api: AvailableApi): boolean {
    return api === AvailableApi.TELEGRAM;
  }

  getApi(): AvailableApi {
    return AvailableApi.TELEGRAM;
  }
}
