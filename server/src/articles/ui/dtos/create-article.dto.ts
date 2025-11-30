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
import { CreateArticleRequest } from '@/articles/operation/requests';

export class CreateArticleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @ApiProperty({
    description: 'Article title',
    minLength: 1,
    maxLength: 500,
    example: 'My First Article',
  })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({
    description: 'Article description',
    maxLength: 1000,
    required: false,
    example: 'A brief description of my article',
  })
  description?: string;

  @IsObject()
  @ApiProperty({
    description: 'Article content in Editor.js format',
    example: {
      time: 1234567890,
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'Hello world!' },
        },
      ],
      version: '2.28.0',
    },
  })
  content: EditorJsContent;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Cover image URL',
    required: false,
    example: 'https://example.com/image.jpg',
  })
  coverImageUrl?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'IDs of raw posts used as sources',
    required: false,
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  sourceRawPostIds?: string[];

  toRequest(user: User): CreateArticleRequest {
    return {
      userId: user.getId(),
      title: this.title,
      description: this.description,
      content: this.content,
      coverImageUrl: this.coverImageUrl,
      sourceRawPostIds: this.sourceRawPostIds,
    };
  }
}
