import { EmailContentType } from '@/mails/domain/enums';

export type SendEmailOptions = {
  to: string;
  subject: string;

  payload: string;
  contentType: EmailContentType;

  from?: string;
};
