import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { Auth } from '@/auth/decorators/auth.decorator';
import { User } from '@/users/domain/entities';
import { CurrentUser } from '@/users/decorators';
import { ArticleId } from '@/articles/domain/schemas';

import {
  CreateArticleHandler,
  UpdateArticleHandler,
  DeleteArticleHandler,
  GetMyArticlesHandler,
  GetArticleByIdHandler,
  GetArticleBySlugHandler,
  GetPublicArticlesHandler,
  PublishArticleHandler,
  UnpublishArticleHandler,
} from '@/articles/operation/handlers';

import {
  ArticleDto,
  CreateArticleDto,
  UpdateArticleDto,
  GetMyArticlesQueryDto,
  GetPublicArticlesQueryDto,
  GetArticlesResponseDto,
} from './dtos';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly createArticleHandler: CreateArticleHandler,
    private readonly updateArticleHandler: UpdateArticleHandler,
    private readonly deleteArticleHandler: DeleteArticleHandler,
    private readonly getMyArticlesHandler: GetMyArticlesHandler,
    private readonly getArticleByIdHandler: GetArticleByIdHandler,
    private readonly getArticleBySlugHandler: GetArticleBySlugHandler,
    private readonly getPublicArticlesHandler: GetPublicArticlesHandler,
    private readonly publishArticleHandler: PublishArticleHandler,
    private readonly unpublishArticleHandler: UnpublishArticleHandler,
  ) {}

  // === Public Articles ===

  @Get()
  @ApiOperation({
    summary: 'Get public articles',
    description: 'Get paginated list of published articles',
  })
  @ApiOkResponse({
    description: 'Public articles retrieved successfully',
    type: GetArticlesResponseDto,
  })
  public async getPublicArticles(
    @Query() query: GetPublicArticlesQueryDto,
  ): Promise<GetArticlesResponseDto> {
    const request = query.toRequest();
    const response = await this.getPublicArticlesHandler.handle(request);
    return GetArticlesResponseDto.fromResponse(response);
  }

  // === User's Own Articles ===

  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Create article',
    description: 'Create a new article draft',
  })
  @ApiCreatedResponse({
    description: 'Article created successfully',
    type: ArticleDto,
  })
  public async createArticle(
    @CurrentUser() user: User,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleDto> {
    const article = await this.createArticleHandler.handle(dto.toRequest(user));
    return ArticleDto.fromEntity(article);
  }

  @Get('my')
  @Auth()
  @ApiOperation({
    summary: 'Get my articles',
    description: "Get paginated list of current user's articles",
  })
  @ApiOkResponse({
    description: 'User articles retrieved successfully',
    type: GetArticlesResponseDto,
  })
  public async getMyArticles(
    @CurrentUser() user: User,
    @Query() query: GetMyArticlesQueryDto,
  ): Promise<GetArticlesResponseDto> {
    const request = query.toRequest(user);
    const response = await this.getMyArticlesHandler.handle(request);
    return GetArticlesResponseDto.fromResponse(response);
  }

  @Get('my/:id')
  @Auth()
  @ApiOperation({
    summary: 'Get my article by ID',
    description: 'Get a single article by ID (owned by current user)',
  })
  @ApiOkResponse({
    description: 'Article retrieved successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to access this article',
  })
  public async getMyArticleById(
    @CurrentUser() user: User,
    @Param('id') id: ArticleId,
  ): Promise<ArticleDto> {
    const article = await this.getArticleByIdHandler.handle({
      articleId: id,
      userId: user.getId(),
    });
    return ArticleDto.fromEntity(article);
  }

  @Patch('my/:id')
  @Auth()
  @ApiOperation({
    summary: 'Update my article',
    description: 'Update an article owned by current user',
  })
  @ApiOkResponse({
    description: 'Article updated successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to update this article',
  })
  public async updateMyArticle(
    @CurrentUser() user: User,
    @Param('id') id: ArticleId,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleDto> {
    const article = await this.updateArticleHandler.handle(
      dto.toRequest(user, id),
    );
    return ArticleDto.fromEntity(article);
  }

  @Delete('my/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete my article',
    description: 'Delete an article owned by current user',
  })
  @ApiNoContentResponse({ description: 'Article deleted successfully' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to delete this article',
  })
  public async deleteMyArticle(
    @CurrentUser() user: User,
    @Param('id') id: ArticleId,
  ): Promise<void> {
    await this.deleteArticleHandler.handle(id, user.getId());
  }

  @Post('my/:id/publish')
  @Auth()
  @ApiOperation({
    summary: 'Publish article',
    description: 'Publish a draft article',
  })
  @ApiOkResponse({
    description: 'Article published successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to publish this article',
  })
  public async publishArticle(
    @CurrentUser() user: User,
    @Param('id') id: ArticleId,
  ): Promise<ArticleDto> {
    const article = await this.publishArticleHandler.handle(id, user.getId());
    return ArticleDto.fromEntity(article);
  }

  @Post('my/:id/unpublish')
  @Auth()
  @ApiOperation({
    summary: 'Unpublish article',
    description: 'Unpublish a published article (convert to draft)',
  })
  @ApiOkResponse({
    description: 'Article unpublished successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to unpublish this article',
  })
  public async unpublishArticle(
    @CurrentUser() user: User,
    @Param('id') id: ArticleId,
  ): Promise<ArticleDto> {
    const article = await this.unpublishArticleHandler.handle(id, user.getId());
    return ArticleDto.fromEntity(article);
  }

  // === Public Article by Slug (for readers) ===

  @Get('read/:slug')
  @ApiOperation({
    summary: 'Get article by slug',
    description: 'Get a published article by its URL slug (public, no auth required)',
  })
  @ApiOkResponse({
    description: 'Article retrieved successfully',
    type: ArticleDto,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  public async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleDto> {
    const article = await this.getArticleBySlugHandler.handle(slug);
    return ArticleDto.fromEntity(article);
  }
}
