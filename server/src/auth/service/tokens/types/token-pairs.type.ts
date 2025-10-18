import { RefreshToken } from '@/auth/domain/entities';

export type RawTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: RefreshToken;
};
