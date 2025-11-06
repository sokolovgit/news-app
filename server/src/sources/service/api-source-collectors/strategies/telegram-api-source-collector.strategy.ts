import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { TelegramService } from '@/sources/service/telegram-serivce';
import { RawPostsService } from '@/posts/service';

import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';
import { RawPostPayload } from '@/posts/domain/types';
import { TelegramMessageToRawPostMapper } from '../mappers';
import { AvailableApiSourceCollectorStrategy } from '../interfaces';

@Injectable()
export class TelegramApiSourceCollectorStrategy
  implements AvailableApiSourceCollectorStrategy
{
  constructor(
    private readonly logger: LoggerService,
    private readonly telegramService: TelegramService,
    private readonly rawPostsService: RawPostsService,
  ) {}

  async collect(source: Source): Promise<void> {
    this.logger.log(
      `Collecting last messages from source ${source.getUrl()} using Telegram API`,
    );

    const messages = await this.telegramService.fetchChannelMessages(
      source.getUrl(),
      5,
    );

    const rawPostsPayloads: RawPostPayload[] = messages.map((message) =>
      TelegramMessageToRawPostMapper.toRawPostPayload(message),
    );

    this.logger.log(
      `Collected ${rawPostsPayloads.length} raw posts from Telegram`,
    );

    await this.rawPostsService.saveManyRawPostsPayloadsOrThrow(
      rawPostsPayloads,
      source.getId(),
    );

    this.logger.log(
      `Successfully saved ${rawPostsPayloads.length} raw posts from source ${source.getId()}`,
    );
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
