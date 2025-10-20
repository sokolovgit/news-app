import {
  Catch,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { LoggerService } from '@/logger';
import { AppError } from '../app.error';

interface ErrorResponse {
  statusCode: HttpStatus;
  timestamp: string;
  path: string;
  message: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface ErrorDetails {
  statusCode: HttpStatus;
  message: string;
  context?: string;
  metadata: Record<string, unknown>;
}

/**
 * Global exception filter that catches all errors and formats them consistently.
 * Handles AppError, HttpException, and generic Error types.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorDetails = this.extractErrorDetails(exception);
    this.logError(exception, errorDetails);

    const errorResponse = this.buildErrorResponse(
      request,
      errorDetails.statusCode,
      errorDetails.message,
      errorDetails.metadata,
    );

    response.status(errorDetails.statusCode).json(errorResponse);
  }

  /**
   * Extracts error details from various exception types
   */
  private extractErrorDetails(exception: unknown): ErrorDetails {
    if (exception instanceof AppError) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        context: exception.context,
        metadata: exception.metadata,
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: exception.message,
        metadata: {},
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        metadata: {},
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      metadata: {},
    };
  }

  /**
   * Logs the error with appropriate context
   */
  private logError(exception: unknown, details: ErrorDetails): void {
    const processId = this.extractProcessId(details.metadata);

    if (processId) {
      this.logProcessError(processId, exception, details.metadata);
    } else {
      this.logStandardError(exception, details.context);
    }
  }

  /**
   * Extracts process ID from metadata if present
   */
  private extractProcessId(metadata: Record<string, unknown>): string | null {
    return typeof metadata.processId === 'string' ? metadata.processId : null;
  }

  /**
   * Logs an error associated with a tracked process
   */
  private logProcessError(
    processId: string,
    exception: unknown,
    metadata: Record<string, unknown>,
  ): void {
    const processName =
      typeof metadata.processName === 'string'
        ? metadata.processName
        : 'UnknownProcess';

    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logger.errorProcess(processId, processName, error, metadata);
  }

  /**
   * Logs a standard error not associated with a process
   */
  private logStandardError(exception: unknown, context?: string): void {
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logger.error(error, undefined, context || 'GlobalExceptionFilter');
  }

  /**
   * Builds the error response object
   */
  private buildErrorResponse(
    request: Request,
    statusCode: HttpStatus,
    message: string,
    metadata: Record<string, unknown> = {},
  ): ErrorResponse {
    const response: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    // Add error name for client-side error handling
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      response.error = 'Internal Server Error';
    } else if (statusCode >= HttpStatus.BAD_REQUEST) {
      response.error = 'Client Error';
    }

    // Only include metadata if it contains useful information
    if (Object.keys(metadata).length > 0) {
      response.metadata = metadata;
    }

    return response;
  }
}
