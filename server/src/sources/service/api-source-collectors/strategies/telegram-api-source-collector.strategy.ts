import { Injectable, NotImplementedException } from '@nestjs/common';

import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';
import { AvailableApiSourceCollectorStrategy } from '../interfaces';
import { TelegramService } from '@/sources/service/telegram-serivce';
import { LoggerService } from '@/logger';
import { TelegramMessageToRawPostMapper } from '../mappers';
import { RawPostPayload } from '@/posts/domain/types';
import { RawPostsService } from '@/posts/service';

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
      3,
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
    console.log('validating url', url);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
  }

  supports(api: AvailableApi): boolean {
    return api === AvailableApi.TELEGRAM;
  }

  getApi(): AvailableApi {
    return AvailableApi.TELEGRAM;
  }
}
