import { Api } from 'telegram';
import { FetchedPost } from '@/sources/service/sources-result/types';

export class TelegramMessageToFetchedPostMapper {
  /**
   * Convert Telegram API Message to FetchedPost format
   * Note: This mapper is for simple mapping without media download.
   * For full processing with media download, use TelegramCollectorService.processMessage()
   */
  static toFetchedPost(message: Api.Message): FetchedPost {
    const mediaUrls: string[] = [];

    // Extract media URLs with proper extensions for type detection
    if (message.photo) {
      mediaUrls.push(`/media/telegram/${message.id}.jpg`);
    }

    if (message.video) {
      mediaUrls.push(`/media/telegram/${message.id}.mp4`);
    }

    if (message.audio) {
      mediaUrls.push(`/media/telegram/${message.id}.mp3`);
    }

    // Extract author information from post author or fallback
    const author = {
      username: message.postAuthor?.toString() || 'unknown',
      displayName: message.postAuthor?.toString() || 'Unknown',
      avatarUrl: undefined, // Telegram API doesn't provide avatar in message
    };

    // Extract metrics - sum up all reaction counts, not just count of reaction types
    const totalReactions = message.reactions
      ? message.reactions.results.reduce(
          (total, reaction) => total + (reaction.count || 0),
          0,
        )
      : undefined;

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
        likes: totalReactions,
        comments: undefined, // Telegram doesn't provide comment count in message
        shares: message.forwards || undefined, // Forward count as shares
      },
    };
  }
}
