import { Injectable, OnModuleInit } from '@nestjs/common';

import { Api } from 'telegram/tl';
import { StringSession } from 'telegram/sessions';
import { TelegramClient } from 'telegram';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { TelegramClientNotConnectedError } from '@/sources/domain/errors';

@Injectable()
export class TelegramService implements OnModuleInit {
  private client: TelegramClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const sessionString = this.configService.telegram.session;
    const session = new StringSession(sessionString);

    this.client = new TelegramClient(
      session,
      parseInt(this.configService.telegram.appId),
      this.configService.telegram.appHash,
      { connectionRetries: 5 },
    );
  }

  async onModuleInit() {
    try {
      await this.client.start({
        phoneNumber: this.configService.telegram.phone,
        phoneCode: async () => {
          this.logger.log('Enter the code sent to your Telegram app:');
          return new Promise((resolve) => {
            process.stdin.once('data', (data) =>
              resolve(data.toString().trim()),
            );
          });
        },
        onError: (err) => this.logger.error('Auth error: ' + err.message),
      });

      this.logger.log('Telegram client connected');

      const session = this.client.session.save();

      this.logger.log(
        'Save this session string to TELEGRAM_SESSION in .env: ' + session,
      );
    } catch (err) {
      this.logger.error(
        'Failed to connect Telegram client: ' + (err as Error).message,
      );
    }
  }

  async fetchChannelMessages(
    channel: string,
    limit: number = 100,
  ): Promise<Api.Message[]> {
    this.logger.log(`Fetching ${limit} messages from channel ${channel}`);

    if (!this.client.connected) {
      this.logger.error('Telegram client not connected');
      throw new TelegramClientNotConnectedError();
    }

    const messages: Api.Message[] = [];

    for await (const message of this.client.iterMessages(channel, { limit })) {
      messages.push(message);
    }

    this.logger.log(
      `Fetched ${messages.length} messages from channel ${channel}`,
    );

    return messages.reverse();
  }
}
