import { ApiProperty } from '@nestjs/swagger';

import { Article } from '@/articles/domain/entities';
import { EditorJsContent } from '@/articles/domain/types';
import { ArticleStatus } from '@/articles/domain/enums';

export class ArticleAuthorDto {
  @ApiProperty({ description: 'Author ID' })
  id: string;

  @ApiProperty({ description: 'Author email' })
  email: string;
}

export class ArticleDto {
  @ApiProperty({ description: 'Article identifier' })
  id: string;

  @ApiProperty({ description: 'Author identifier' })
  authorId: string;

  @ApiProperty({ description: 'Article title' })
  title: string;

  @ApiProperty({ description: 'Article slug for URL', required: false })
  slug?: string;

  @ApiProperty({ description: 'Article description', required: false })
  description?: string;

  @ApiProperty({ description: 'Article content in Editor.js format' })
  content: EditorJsContent;

  @ApiProperty({ description: 'Cover image URL', required: false })
  coverImageUrl?: string;

  @ApiProperty({
    description: 'Article status',
    enum: ArticleStatus,
  })
  status: ArticleStatus;

  @ApiProperty({ description: 'Publication date', required: false })
  publishedAt?: Date;

  @ApiProperty({ description: 'View count' })
  viewCount: number;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Author information',
    required: false,
    type: ArticleAuthorDto,
  })
  author?: ArticleAuthorDto;

  static fromEntity(article: Article): ArticleDto {
    const dto = new ArticleDto();
    dto.id = article.getId();
    dto.authorId = article.getAuthorId();
    dto.title = article.getTitle();
    dto.slug = article.getSlug();
    dto.description = article.getDescription();
    dto.content = article.getContent();
    dto.coverImageUrl = article.getCoverImageUrl();
    dto.status = article.getStatus();
    dto.publishedAt = article.getPublishedAt();
    dto.viewCount = article.getViewCount();
    dto.createdAt = article.getCreatedAt();
    dto.updatedAt = article.getUpdatedAt();

    // Only access author if it's loaded
    if (article.hasAuthorLoaded()) {
      const author = article.getAuthor();
      if (author) {
        dto.author = {
          id: author.getId(),
          email: author.getEmail(),
        };
      }
    }

    return dto;
  }
}
