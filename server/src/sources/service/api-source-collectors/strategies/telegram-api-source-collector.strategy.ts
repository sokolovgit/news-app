import { Injectable, NotImplementedException } from '@nestjs/common';

import { Source } from '@/sources/domain/entities';
import { AvailableApi } from '@/sources/domain/enums';
import { AvailableApiSourceCollectorStrategy } from '../interfaces';
import { TelegramService } from '@/sources/service/telegram-serivce';
import { LoggerService } from '@/logger';

@Injectable()
export class TelegramApiSourceCollectorStrategy
  implements AvailableApiSourceCollectorStrategy
{
  constructor(
    private readonly logger: LoggerService,
    private readonly telegramService: TelegramService,
  ) {}

  async collect(source: Source): Promise<void> {
    console.log('collecting source', source);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
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
