import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Request, Response } from 'express';
import pino, { Logger, LoggerOptions } from 'pino';

import { uuid } from '@/commons/utils';
import { AppError } from '@/errors';
import { ConfigService } from '@/config';

type LogMetadata = Record<string, unknown>;

enum ProcessStatus {
  STARTED = 'STARTED',
  PROGRESS = 'PROGRESS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

interface ErrorLogContext {
  context?: string;
  errorName?: string;
  statusCode?: number;
  stack?: string | string[];
  metadata?: LogMetadata;
}

interface ProcessLogContext {
  context: string;
  processId: string;
  processName: string;
  status: ProcessStatus;
  error?: string;
  errorName?: string;
  statusCode?: number;
  stack?: string | string[];
  metadata?: LogMetadata;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = this.createLogger();
  }

  /**
   * Creates and configures the pino logger instance
   */
  private createLogger(): Logger {
    const isDevelopment = this.configService.isDevelopment();
    const loggerOptions = this.buildLoggerOptions(isDevelopment);

    return pino(loggerOptions);
  }

  /**
   * Builds logger configuration options
   */
  private buildLoggerOptions(isDevelopment: boolean): LoggerOptions {
    const options: LoggerOptions = {
      level: isDevelopment ? 'debug' : 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        pid: process.pid,
        hostname: process.env.HOSTNAME || 'localhost',
      },
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
    };

    if (isDevelopment) {
      options.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
          ignore: 'pid,hostname,context',
          singleLine: false,
          messageFormat: '{if context}[{context}] {end}{msg}',
        },
      };
    }

    return options;
  }

  /**
   * Extracts error context from various error types
   */
  private extractErrorContext(
    error: Error,
    fallbackContext?: string,
  ): ErrorLogContext {
    const isDevelopment = this.configService.isDevelopment();

    if (error instanceof AppError) {
      return {
        context: error.context || fallbackContext,
        errorName: error.name,
        statusCode: error.statusCode,
        stack: this.formatStack(error.stack, isDevelopment),
        metadata: error.metadata,
      };
    }

    return {
      context: fallbackContext,
      errorName: error.name,
      stack: this.formatStack(error.stack, isDevelopment),
    };
  }

  /**
   * Formats stack trace for better readability in development
   */
  private formatStack(
    stack: string | undefined,
    isDevelopment: boolean,
  ): string | string[] | undefined {
    if (!stack) {
      return undefined;
    }

    // In development, split stack into array for better formatting
    if (isDevelopment) {
      return stack.split('\n');
    }

    // In production, keep as single line string
    return stack;
  }

  /**
   * Automatically detects the calling context from the call stack
   * @returns The name of the class that called the logger
   */
  private detectContext(): string | undefined {
    const stack = new Error().stack;
    if (!stack) {
      return undefined;
    }

    const lines = stack.split('\n');
    // Skip the first 3 lines (Error, detectContext, and the logger method)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];

      // Match patterns like "at ClassName.methodName" or "at new ClassName"
      const match = line.match(/at\s+(?:new\s+)?(\w+)\.(\w+)/);
      if (match) {
        const className = match[1];
        // Skip common framework classes
        if (
          className !== 'Object' &&
          className !== 'Promise' &&
          className !== 'Module' &&
          !className.startsWith('Function')
        ) {
          return className;
        }
      }
    }

    return undefined;
  }

  /**
   * Logs a standard info message
   */
  log(message: string, context?: string): void {
    const finalContext = context || this.detectContext();
    this.logger.info({ context: finalContext }, message);
  }

  /**
   * Logs an error with appropriate context
   */
  error(message: string | Error, trace?: string, context?: string): void {
    const finalContext = context || this.detectContext();

    if (typeof message === 'string') {
      this.logger.error({ context: finalContext, trace }, message);
      return;
    }

    const errorContext = this.extractErrorContext(message, finalContext);
    this.logger.error(errorContext, message.message);
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: string): void {
    const finalContext = context || this.detectContext();
    this.logger.warn({ context: finalContext }, message);
  }

  /**
   * Logs a debug message
   */
  debug(message: string, context?: string): void {
    const finalContext = context || this.detectContext();
    this.logger.debug({ context: finalContext }, message);
  }

  /**
   * Logs a verbose/trace message
   */
  verbose(message: string, context?: string): void {
    const finalContext = context || this.detectContext();
    this.logger.trace({ context: finalContext }, message);
  }

  /**
   * Logs incoming HTTP request
   */
  logIncomingRequest(req: Request): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    const logData: Record<string, unknown> = {
      context: 'HTTP',
      method,
      url: originalUrl,
      ip,
      userAgent,
    };

    // Add headers
    if (req.headers && Object.keys(req.headers).length > 0) {
      logData.headers = req.headers;
    }

    // Add cookies if present
    if (req.cookies && Object.keys(req.cookies).length > 0) {
      logData.cookies = req.cookies;
    }

    // Add body if present
    if (
      req.body &&
      typeof req.body === 'object' &&
      Object.keys(req.body as Record<string, unknown>).length > 0
    ) {
      logData.body = req.body;
    }

    // Add params if present
    if (
      req.params &&
      typeof req.params === 'object' &&
      Object.keys(req.params).length > 0
    ) {
      logData.params = req.params;
    }

    // Add query if present
    if (
      req.query &&
      typeof req.query === 'object' &&
      Object.keys(req.query).length > 0
    ) {
      logData.query = req.query;
    }

    this.logger.info(logData, `-> ${method} ${originalUrl}`);
  }

  /**
   * Logs HTTP request/response information
   */
  logRequest(
    req: Request,
    res: Response,
    responseTime: number,
    responseBody?: unknown,
  ): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    const { statusCode } = res;

    const logData: Record<string, unknown> = {
      context: 'HTTP',
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent,
    };

    // Add request headers
    if (req.headers && Object.keys(req.headers).length > 0) {
      logData.requestHeaders = req.headers;
    }

    // Add request cookies if present
    if (req.cookies && Object.keys(req.cookies).length > 0) {
      logData.requestCookies = req.cookies;
    }

    // Add request body if present
    if (
      req.body &&
      typeof req.body === 'object' &&
      Object.keys(req.body as Record<string, unknown>).length > 0
    ) {
      logData.requestBody = req.body;
    }

    // Add params if present
    if (
      req.params &&
      typeof req.params === 'object' &&
      Object.keys(req.params).length > 0
    ) {
      logData.params = req.params;
    }

    // Add query if present
    if (
      req.query &&
      typeof req.query === 'object' &&
      Object.keys(req.query).length > 0
    ) {
      logData.query = req.query;
    }

    // Add response headers
    const responseHeaders = res.getHeaders();
    if (responseHeaders && Object.keys(responseHeaders).length > 0) {
      logData.responseHeaders = responseHeaders;
    }

    // Add response body if present
    if (responseBody !== undefined) {
      logData.responseBody = responseBody;
    }

    this.logger.info(
      logData,
      `<- ${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
    );
  }

  /**
   * Starts tracking a new process and returns its unique ID
   */
  startProcess(processName: string, metadata: LogMetadata = {}): string {
    const processId = uuid();

    this.logProcess(
      processId,
      processName,
      ProcessStatus.STARTED,
      `Process ${processName} started`,
      metadata,
    );

    return processId;
  }

  /**
   * Logs progress for an ongoing process
   */
  logProcessProgress(
    processId: string,
    processName: string,
    message: string,
    metadata: LogMetadata = {},
  ): void {
    this.logProcess(
      processId,
      processName,
      ProcessStatus.PROGRESS,
      `Process ${processName}: ${message}`,
      metadata,
    );
  }

  /**
   * Logs successful completion of a process
   */
  completeProcess(
    processId: string,
    processName: string,
    metadata: LogMetadata = {},
  ): void {
    this.logProcess(
      processId,
      processName,
      ProcessStatus.COMPLETED,
      `Process ${processName} completed`,
      metadata,
    );
  }

  /**
   * Logs an error that occurred during a process
   */
  errorProcess(
    processId: string,
    processName: string,
    error: string | Error,
    metadata: LogMetadata = {},
  ): void {
    const message = `Process ${processName} failed`;

    if (typeof error === 'string') {
      this.logProcessError(processId, processName, message, error, metadata);
      return;
    }

    const errorContext = this.extractErrorContext(error);
    const mergedMetadata = {
      ...metadata,
      ...(errorContext.metadata || {}),
    };

    this.logProcessError(
      processId,
      processName,
      message,
      error.message,
      mergedMetadata,
      errorContext,
    );
  }

  /**
   * Helper method to log process-related messages
   */
  private logProcess(
    processId: string,
    processName: string,
    status: ProcessStatus,
    message: string,
    metadata: LogMetadata = {},
  ): void {
    const logContext: ProcessLogContext = {
      context: 'PROCESS',
      processId,
      processName,
      status,
      ...metadata,
    };

    this.logger.info(logContext, message);
  }

  /**
   * Helper method to log process errors
   */
  private logProcessError(
    processId: string,
    processName: string,
    message: string,
    error: string,
    metadata: LogMetadata = {},
    errorContext?: Partial<ErrorLogContext>,
  ): void {
    const logContext: ProcessLogContext = {
      context: 'PROCESS',
      processId,
      processName,
      status: ProcessStatus.ERROR,
      error,
      ...errorContext,
      metadata,
    };

    this.logger.error(logContext, message);
  }
}
