import { EmailContentType } from '@/mails/domain/enums';

export type SendEmailQueueJobType = {
  to: string;
  subject: string;

  payload: string;
  contentType: EmailContentType;

  from?: string;
};
