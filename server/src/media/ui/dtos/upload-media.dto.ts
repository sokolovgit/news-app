import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UploadFromUrlDto {
  @IsUrl()
  @ApiProperty({
    description: 'URL of the image to upload',
    example: 'https://example.com/image.jpg',
  })
  url: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Folder to store the file in',
    required: false,
    default: 'articles',
    example: 'articles',
  })
  folder?: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Public URL of the uploaded file',
    example: 'http://localhost:3000/api/media/articles/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Storage key of the uploaded file',
    example: 'articles/abc123.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'Content type of the uploaded file',
    example: 'image/jpeg',
  })
  contentType: string;

  @ApiProperty({
    description: 'Size of the uploaded file in bytes',
    example: 12345,
  })
  size: number;
}

