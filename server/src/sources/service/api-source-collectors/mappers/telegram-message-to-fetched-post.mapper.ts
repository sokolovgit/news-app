import { Api } from 'telegram';
import { FetchedPost } from '@/sources/service/sources-result/types';

export class TelegramMessageToFetchedPostMapper {
  static toFetchedPost(message: Api.Message): FetchedPost {
    const mediaUrls: string[] = [];

    // Extract media URLs
    if (message.photo) {
      const imageUrl = `/media/telegram/${message.id}.jpg`;
      mediaUrls.push(imageUrl);
    }

    if (message.video) {
      const videoUrl = `/media/telegram/${message.id}.mp4`;
      mediaUrls.push(videoUrl);
    }

    if (message.audio) {
      const audioUrl = `/media/telegram/${message.id}.mp3`;
      mediaUrls.push(audioUrl);
    }

    // Extract author information
    const author = {
      username: message.postAuthor?.toString() || 'unknown',
      displayName: message.postAuthor?.toString() || 'Unknown',
      avatarUrl: undefined, // Telegram API doesn't provide avatar in message
    };

    // Extract metrics if available
    const metrics = {
      views: message.views,
      reactions: message.reactions
        ? message.reactions.results.length
        : undefined,
    };

    const publishedAt = message.date
      ? new Date(message.date * 1000).toISOString()
      : new Date().toISOString();

    return {
      externalId: String(message.id),
      content: message.message || '',
      mediaUrls,
      publishedAt,
      author,
      metrics: {
        likes: metrics.reactions,
        comments: undefined, // Telegram doesn't provide comment count in message
        shares: undefined, // Telegram doesn't provide share count
      },
    };
  }
}
