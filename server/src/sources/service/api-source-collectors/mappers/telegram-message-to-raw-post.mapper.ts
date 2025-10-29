import { Api } from 'telegram';

import { Content, RawPostPayload } from '@/posts/domain/types';
import { ContentBlockType } from '@/posts/domain/enums';

export class TelegramMessageToRawPostMapper {
  static toRawPostPayload(message: Api.Message): RawPostPayload {
    const content: Content = [];

    if (message.message) {
      content.push({
        type: ContentBlockType.PARAGRAPH,
        data: { text: message.message },
      });
    }

    //TODO: MEDIA HANDLING
    if (message.photo) {
      const imageUrl = `/media/telegram/${message.id}.jpg`;
      content.push({
        type: ContentBlockType.IMAGE,
        data: {
          url: imageUrl,
          caption: `Photo ${message.photo.id.toString()} by ${message.postAuthor?.toString() || 'unknown'}`,
        },
      });
    }

    if (message.audio) {
      const audioUrl = `/media/telegram/${message.id}.mp3`;
      content.push({
        type: ContentBlockType.AUDIO,
        data: {
          url: audioUrl,
          caption: `Audio ${message.audio.id.toString()} by ${message.postAuthor?.toString() || 'unknown'}`,
        },
      });
    }

    if (message.video) {
      const videoUrl = `/media/telegram/${message.id}.mp4`;
      content.push({
        type: ContentBlockType.VIDEO,
        data: {
          url: videoUrl,
          caption: `Video ${message.video.id.toString()} by ${message.postAuthor?.toString() || 'unknown'}`,
        },
      });
    }

    const title = message.message?.split('\n')[0].slice(0, 100) || undefined;
    const externalId = String(message.id);

    return {
      externalId,
      title,
      content,
    };
  }
}
