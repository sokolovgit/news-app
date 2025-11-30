import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

import { User } from '@/users/domain/entities';
import { EditorJsContent } from '@/articles/domain/types';
import { UpdateArticleRequest } from '@/articles/operation/requests';
import { ArticleId } from '@/articles/domain/schemas';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  @ApiProperty({
    description: 'Article title',
    minLength: 1,
    maxLength: 500,
    required: false,
    example: 'Updated Article Title',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({
    description: 'Article description',
    maxLength: 1000,
    required: false,
    example: 'Updated description',
  })
  description?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Article content in Editor.js format',
    required: false,
  })
  content?: EditorJsContent;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Cover image URL',
    required: false,
  })
  coverImageUrl?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'IDs of raw posts used as sources',
    required: false,
    type: [String],
  })
  sourceRawPostIds?: string[];

  toRequest(user: User, articleId: ArticleId): UpdateArticleRequest {
    return {
      articleId,
      userId: user.getId(),
      title: this.title,
      description: this.description,
      content: this.content,
      coverImageUrl: this.coverImageUrl,
      sourceRawPostIds: this.sourceRawPostIds,
    };
  }
}
