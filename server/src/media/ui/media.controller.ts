import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Res } from '@nestjs/common';

import { GetMediaHandler } from '../operation/handlers';
import { ParseMediaPathPipe } from '../pipes';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly getMediaHandler: GetMediaHandler) {}

  @Get('*path')
  @ApiOperation({ summary: 'Get media file by path' })
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
