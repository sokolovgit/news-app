export type OAuthUser = {
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  emailVerified?: boolean;
};
