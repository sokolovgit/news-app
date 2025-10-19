import type { User } from '@/users/domain/entities';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
