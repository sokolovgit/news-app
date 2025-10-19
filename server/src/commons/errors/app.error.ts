import { HttpStatus } from '@nestjs/common';

/**
 * Base application error class that all domain errors should extend.
 * Provides consistent error structure with HTTP status codes and metadata.
 *
 * @example
 * ```ts
 * export class UserNotFoundError extends AppError {
 *   constructor(userId: string) {
 *     super(
 *       'User not found',
 *       HttpStatus.NOT_FOUND,
 *       'UserService',
 *       { userId }
 *     );
 *   }
 * }
 * ```
 */
export class AppError extends Error {
  /**
   * HTTP status code associated with this error
   */
  public readonly statusCode: HttpStatus;

  /**
   * Context/module where the error occurred
   */
  public readonly context?: string;

  /**
   * Additional metadata for debugging and logging
   */
  public readonly metadata: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    context?: string,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    this.metadata = metadata;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializes the error to a JSON-friendly format
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      metadata: this.metadata,
    };
  }

  /**
   * Returns a string representation of the error
   */
  toString(): string {
    const parts = [this.name];

    if (this.context) {
      parts.push(`[${this.context}]`);
    }

    parts.push(`(${this.statusCode}): ${this.message}`);

    return parts.join(' ');
  }
}
