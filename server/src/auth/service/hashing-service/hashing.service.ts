import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  async hash(toHash: string): Promise<string> {
    return await bcrypt.hash(toHash, 10);
  }

  async compareHashes(toCompare: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(toCompare, hash);
  }
}
