import { Injectable, OnModuleInit } from '@nestjs/common';

import { Api } from 'telegram/tl';
import { StringSession } from 'telegram/sessions';
import { TelegramClient } from 'telegram';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { TelegramClientNotConnectedError } from '@/sources/domain/errors';

export type DownloadedMedia = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

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

    const messages: Api.Message[] = await this.client.getMessages(channel, {
      limit,
    });

    this.logger.log(
      `Fetched ${messages.length} messages from channel ${channel}`,
    );

    return messages.reverse();
  }

  /**
   * Download media from a Telegram message.
   * Returns buffer with content type and extension.
   */
  async downloadMedia(message: Api.Message): Promise<DownloadedMedia | null> {
    if (!this.client.connected) {
      throw new TelegramClientNotConnectedError();
    }

    const media = message.media;
    if (!media) {
      return null;
    }

    try {
      // Download media to buffer
      const buffer = (await this.client.downloadMedia(message)) as Buffer;

      if (!buffer) {
        return null;
      }

      // Determine content type and extension
      const { contentType, extension } = this.getMediaTypeInfo(media);

      this.logger.debug(
        `Downloaded media from message ${message.id}: ${buffer.length} bytes, ${contentType}`,
      );

      return {
        buffer,
        contentType,
        extension,
      };
    } catch (error) {
      this.logger.error(
        `Failed to download media from message ${message.id}: ${error}`,
      );
      return null;
    }
  }

  /**
   * Get content type and extension for media.
   */
  private getMediaTypeInfo(media: Api.TypeMessageMedia): {
    contentType: string;
    extension: string;
  } {
    if (media instanceof Api.MessageMediaPhoto) {
      return { contentType: 'image/jpeg', extension: 'jpg' };
    }

    if (media instanceof Api.MessageMediaDocument) {
      const doc = media.document;
      if (doc instanceof Api.Document) {
        const mimeType = doc.mimeType || 'application/octet-stream';

        // Get extension from mime type or filename attribute
        let extension = 'bin';
        for (const attr of doc.attributes) {
          if (attr instanceof Api.DocumentAttributeFilename) {
            const parts = attr.fileName.split('.');
            if (parts.length > 1) {
              extension = parts[parts.length - 1].toLowerCase();
            }
            break;
          }
          if (attr instanceof Api.DocumentAttributeVideo) {
            extension = 'mp4';
            break;
          }
          if (attr instanceof Api.DocumentAttributeAudio) {
            extension = 'mp3';
            break;
          }
        }

        return { contentType: mimeType, extension };
      }
    }

    return { contentType: 'application/octet-stream', extension: 'bin' };
  }
}
