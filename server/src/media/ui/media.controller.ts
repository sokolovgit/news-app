import { Response } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Auth } from '@/auth/decorators/auth.decorator';
import {
  GetMediaHandler,
  UploadMediaHandler,
} from '@/media/operation/handlers';
import { UploadFile } from '@/media/operation/requests';
import { ParseMediaPathPipe } from '../pipes';
import { UploadFromUrlDto, UploadResponseDto } from './dtos';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly getMediaHandler: GetMediaHandler,
    private readonly uploadMediaHandler: UploadMediaHandler,
  ) {}

  @Post('upload')
  @Auth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Folder to store the file in (default: articles)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body('folder') folder?: string,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadMediaHandler.handle({
      file,
      folder: folder || 'articles',
    });
  }

  @Post('upload-url')
  @Auth()
  @ApiOperation({ summary: 'Upload image from URL' })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  async uploadFromUrl(
    @Body() dto: UploadFromUrlDto,
  ): Promise<UploadResponseDto> {
    if (!dto.url) {
      throw new BadRequestException('No URL provided');
    }

    return this.uploadMediaHandler.handleFromUrl({
      url: dto.url,
      folder: dto.folder || 'articles',
    });
  }

  @Get('*path')
  @ApiOperation({ summary: 'Get media file by path' })
  @ApiOkResponse({ description: 'Media file stream' })
  @ApiNotFoundResponse({ description: 'Media not found' })
  async getMedia(
    @Param('path', ParseMediaPathPipe) path: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.getMediaHandler.handle({ path });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.contentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    result.stream.pipe(res);
  }
}
