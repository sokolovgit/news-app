import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

@Injectable()
export class HashingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Hashes a string using bcrypt.
   * @param toHash - The string to hash
   * @returns The hashed string
   */
  async hash(toHash: string): Promise<string> {
    this.logger.debug('Hashing password with bcrypt');
    const hashed = await bcrypt.hash(toHash, 10);
    this.logger.debug('Password hashed successfully');
    return hashed;
  }

  /**
   * Compares a string to a hashed string using bcrypt.
   * @param toCompare - The string to compare
   * @param hash - The hashed string to compare to
   * @returns True if the strings match, false otherwise
   */
  async compareHashes(toCompare: string, hash: string): Promise<boolean> {
    this.logger.debug('Comparing password with hash');
    const isMatch = await bcrypt.compare(toCompare, hash);
    this.logger.debug(`Password comparison result: ${isMatch}`);
    return isMatch;
  }

  /**
   * Creates a deterministic HMAC-SHA256 hash for tokens.
   * Uses a secret key for additional security - even if the database
   * is compromised, tokens cannot be validated without the secret.
   *
   * Unlike bcrypt, this produces the same hash for the same input,
   * allowing us to look up tokens by their hash.
   *
   * @param token - The token to hash
   * @returns The HMAC-SHA256 hash as a hex string
   */
  hashToken(token: string): string {
    this.logger.debug('Hashing token with HMAC-SHA256');
    const secret = this.configService.auth.refreshTokenSecret;
    const hashed = createHmac('sha256', secret).update(token).digest('hex');
    this.logger.debug('Token hashed successfully');
    return hashed;
  }

  /**
   * Compares a string to a hashed string using HMAC-SHA256.
   * @param toCompare - The string to compare
   * @param hash - The hashed string to compare to
   * @returns True if the strings match, false otherwise
   */
  compareToken(toCompare: string, hash: string): boolean {
    this.logger.debug('Comparing token with hash');
    const secret = this.configService.auth.refreshTokenSecret;
    const isMatch =
      createHmac('sha256', secret).update(toCompare).digest('hex') === hash;
    this.logger.debug(`Token comparison result: ${isMatch}`);
    return isMatch;
  }
}
